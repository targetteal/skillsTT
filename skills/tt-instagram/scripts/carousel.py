#!/usr/bin/env python3
"""Preparação LOCAL de carrosséis. Nenhum comando usa rede ou publica conteúdo.

Python 3.10+, Pillow >= 11. Ordem vem do array slides do manifesto, nunca de glob.
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import html
import io
import json
import math
import re
import shutil
import sys
import tempfile
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    from PIL import Image, ImageCms, ImageDraw, ImageFont, ImageOps
except ImportError:
    raise SystemExit("Falta Pillow. Instale a dependência indicada em requirements.txt no ambiente de trabalho.")

ROLES = {"post_cover", "context", "argument", "qualification", "closure", "club_bridge", "season_closing", "service"}
SOURCE_FORMATS = {"PNG", "JPEG", "WEBP"}
MAX_PIXELS = 50_000_000  # Proteção local de memória, não limite do Instagram.
SRGB = ImageCms.ImageCmsProfile(ImageCms.createProfile("sRGB"))
SRGB_BYTES = SRGB.tobytes()


def read_json(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError("O JSON precisa ter um objeto na raiz.")
    return value


def dump(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def digest_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for block in iter(lambda: f.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def safe_file(root: Path, name: Any) -> Path:
    if not isinstance(name, str) or not name.strip() or "\\" in name:
        raise ValueError("Caminho inválido; use caminho relativo com barras /.")
    rel = Path(name)
    if rel.is_absolute() or ".." in rel.parts:
        raise ValueError("O arquivo precisa estar dentro da pasta do manifesto, sem .. ou caminho absoluto.")
    resolved = (root / rel).resolve()
    if not resolved.is_relative_to(root.resolve()):
        raise ValueError("O caminho ou link simbólico sai da pasta do manifesto.")
    if not resolved.is_file():
        raise ValueError(f"Arquivo não encontrado: {name}")
    return resolved


def target_settings(manifest: dict[str, Any]) -> tuple[int, int, str]:
    t = manifest.get("target")
    if not isinstance(t, dict):
        raise ValueError("Falta target com width, height e background.")
    w, h, bg = t.get("width"), t.get("height"), t.get("background")
    if any(type(v) is not int or v < 1 or v > 12000 for v in (w, h)) or w * h > MAX_PIXELS:
        raise ValueError("Dimensões inválidas ou acima da proteção local de memória.")
    if not isinstance(bg, str) or not re.fullmatch(r"#[0-9A-Fa-f]{6}", bg):
        raise ValueError("target.background precisa ser uma cor como #F2EFEB.")
    return w, h, bg


def open_rgb(path: Path, background: str) -> Image.Image:
    """Orienta, converte ICC quando disponível e achata transparência sem deformar."""
    with Image.open(path) as src:
        if src.format not in SOURCE_FORMATS:
            raise ValueError(f"Formato de origem não suportado pelo script: {src.format}")
        if getattr(src, "n_frames", 1) != 1:
            raise ValueError("Imagem animada não é aceita; escolha um quadro explicitamente.")
        if src.width * src.height > MAX_PIXELS:
            raise ValueError("Imagem acima da proteção local de memória.")
        src.load()
        icc = src.info.get("icc_profile")
        im = ImageOps.exif_transpose(src)
        alpha = im.convert("RGBA").getchannel("A") if im.mode in {"RGBA", "LA", "P"} else None
        if icc:
            try:
                profile = ImageCms.ImageCmsProfile(io.BytesIO(icc))
                color = im.convert("RGB") if im.mode in {"RGBA", "LA", "P"} else im
                color = ImageCms.profileToProfile(color, profile, SRGB, outputMode="RGB")
            except Exception as exc:
                raise ValueError(f"Perfil ICC inválido ou incompatível: {exc}") from exc
        else:
            if im.mode in {"CMYK", "LAB"}:
                raise ValueError("Imagem CMYK/LAB sem perfil ICC; forneça uma conversão sRGB confiável.")
            color = im.convert("RGB")
        if alpha is not None:
            canvas = Image.new("RGB", color.size, background)
            canvas.paste(color, (0, 0), alpha)
            color = canvas
        return color.copy()


def validate(path: Path, *, strict: bool = False, require_target: bool = False,
             max_items: int | None = None, max_bytes: int | None = None,
             caption_limit: int | None = None, alt_limit: int | None = None) -> dict[str, Any]:
    errors: list[str] = []
    warnings: list[str] = []
    result: dict[str, Any] = {"ok": False, "errors": errors, "warnings": warnings, "items": []}
    try:
        m = read_json(path)
        w, h, bg = target_settings(m)
    except (OSError, ValueError, TypeError) as exc:
        errors.append(str(exc)); return result
    if m.get("schema_version") != "1.0":
        errors.append("schema_version precisa ser 1.0.")
    if not isinstance(m.get("campaign_id"), str) or not m["campaign_id"].strip():
        errors.append("Falta campaign_id.")
    account = m.get("account_username")
    if not isinstance(account, str) or not re.fullmatch(r"[A-Za-z0-9_.]{1,64}", account):
        (errors if strict else warnings).append("Conta ainda não identificada corretamente (sem @).")
    caption = m.get("caption")
    if not isinstance(caption, str):
        errors.append("caption precisa ser texto.")
    elif not caption.strip() and strict:
        errors.append("Legenda vazia na revisão estrita.")
    elif strict and re.search(r"\{\{.*?\}\}", caption):
        errors.append("Legenda contém marcador pendente {{...}}.")
    elif caption_limit is not None and len(caption) > caption_limit:
        errors.append("Legenda excede o limite informado.")
    slides = m.get("slides")
    if not isinstance(slides, list) or not slides:
        errors.append("slides precisa ser uma lista não vazia."); return result
    if max_items is not None and len(slides) > max_items:
        errors.append("Quantidade de slides excede o limite informado.")
    ids, paths, hashes = set(), set(), set()
    cover_count, season_count = 0, 0
    for expected, slide in enumerate(slides, 1):
        tag = f"Slide {expected}"
        if not isinstance(slide, dict):
            errors.append(f"{tag}: item precisa ser objeto."); continue
        pos, sid, role = slide.get("position"), slide.get("id"), slide.get("role")
        if type(pos) is not int or pos != expected:
            errors.append(f"{tag}: position deve ser {expected}; a ordem do array não será reordenada automaticamente.")
        if not isinstance(sid, str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", sid) or len(sid) > 80:
            errors.append(f"{tag}: id deve ser curto, estável e em kebab-case.")
        elif sid in ids:
            errors.append(f"{tag}: id duplicado.")
        else:
            ids.add(sid)
        if not isinstance(role, str) or role not in ROLES:
            errors.append(f"{tag}: role desconhecido.")
        if role == "post_cover":
            cover_count += 1
            if expected != 1:
                errors.append(f"{tag}: capa do post precisa abrir o carrossel.")
        if role == "season_closing":
            season_count += 1
            if expected != len(slides):
                errors.append(f"{tag}: encerramento de temporada precisa ficar no fim deste fluxo.")
        for field in ("copy_text", "alt_text"):
            value = slide.get(field)
            if not isinstance(value, str):
                errors.append(f"{tag}: {field} precisa ser texto.")
            elif strict and not value.strip():
                errors.append(f"{tag}: {field} vazio na revisão estrita.")
            elif strict and re.search(r"\{\{.*?\}\}", value):
                errors.append(f"{tag}: {field} contém marcador pendente.")
        if alt_limit is not None and isinstance(slide.get("alt_text"), str) and len(slide["alt_text"]) > alt_limit:
            errors.append(f"{tag}: alt_text excede o limite informado.")
        if not isinstance(slide.get("copy_status"), str) or slide.get("copy_status") not in {"pending", "approved"}:
            errors.append(f"{tag}: copy_status precisa ser pending ou approved.")
        elif strict and slide["copy_status"] != "approved":
            errors.append(f"{tag}: copy não aprovada.")
        try:
            src = safe_file(path.parent, slide.get("file"))
            if src in paths:
                errors.append(f"{tag}: mesmo arquivo listado duas vezes.")
            paths.add(src)
            if max_bytes is not None and src.stat().st_size > max_bytes:
                errors.append(f"{tag}: arquivo excede o limite de bytes informado.")
            im = open_rgb(src, bg)
            if require_target and im.size != (w, h):
                errors.append(f"{tag}: tamanho {im.size} difere do alvo {(w,h)}.")
            if not require_target and im.size != (w, h):
                warnings.append(f"{tag}: tamanho de origem {im.size}; exportação ainda necessária.")
            hs = digest_file(src)
            if hs in hashes:
                warnings.append(f"{tag}: conteúdo binário repetido; conferir intenção narrativa.")
            hashes.add(hs)
            with Image.open(src) as raw:
                if not raw.info.get("icc_profile"):
                    warnings.append(f"{tag}: sem perfil ICC; RGB/cinza será interpretado como sRGB.")
            result["items"].append({"position": expected, "id": sid, "file": slide.get("file"),
                                     "width": im.width, "height": im.height, "sha256": hs})
        except (OSError, ValueError, TypeError, Image.DecompressionBombError) as exc:
            errors.append(f"{tag}: {exc}")
    if cover_count != 1 or not isinstance(slides[0], dict) or slides[0].get("role") != "post_cover":
        errors.append("É necessária exatamente uma post_cover, na primeira posição.")
    if season_count > 1:
        errors.append("Há mais de um encerramento de temporada.")
    result["ok"] = not errors
    return result


def require_valid(path: Path, **kwargs: Any) -> tuple[dict[str, Any], dict[str, Any]]:
    report = validate(path, **kwargs)
    if not report["ok"]:
        raise ValueError("\n".join(report["errors"]))
    return read_json(path), report


def clean_manifest(m: dict[str, Any]) -> dict[str, Any]:
    """Só exporta os campos documentados; não arrasta metadados arbitrários/segredos."""
    return {"schema_version": "1.0", "campaign_id": m["campaign_id"],
            "account_username": m.get("account_username"), "target": {k: m["target"][k] for k in ("width", "height", "background")},
            "caption": m["caption"], "slides": [{k: s[k] for k in
             ("position", "id", "role", "file", "alt_text", "copy_text", "copy_status")} for s in m["slides"]]}


def fingerprint(path: Path) -> str:
    m, report = require_valid(path)
    clean = clean_manifest(m)
    for s, item in zip(clean["slides"], report["items"]):
        s.pop("file")  # Renomear o mesmo arquivo não altera o conteúdo aprovado.
        s.pop("copy_status")  # Aprovar não muda pixels/copy; é verificado separadamente.
        s["sha256"] = item["sha256"]
    canonical = json.dumps(clean, sort_keys=True, ensure_ascii=False, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def check_approval(path: Path, approval_path: Path) -> dict[str, Any]:
    m, _ = require_valid(path, strict=True, require_target=True)
    a = read_json(approval_path)
    errors = []
    if a.get("schema_version") != "1.0" or a.get("action") != "publish" or a.get("status") != "authorized":
        errors.append("O registro não contém autorização de publicação.")
    if a.get("account_username") != m.get("account_username"):
        errors.append("Conta aprovada não corresponde ao manifesto.")
    for f in ("authorized_by", "authorized_at", "user_instruction", "timing"):
        if not isinstance(a.get(f), str) or not a[f].strip():
            errors.append(f"Falta {f} no registro da autorização.")
    try:
        dt = datetime.fromisoformat(str(a.get("authorized_at", "")).replace("Z", "+00:00"))
        if dt.tzinfo is None:
            errors.append("authorized_at precisa incluir o fuso.")
    except ValueError:
        errors.append("authorized_at inválido.")
    if a.get("content_fingerprint") != fingerprint(path):
        errors.append("Conteúdo/ordem/conta mudou ou impressão digital não foi registrada.")
    return {"ok": not errors, "errors": errors,
            "note": "Confere consistência, não a autenticidade do consentimento; não publica."}


def new_output(out: Path) -> Path:
    if out.exists():
        raise ValueError(f"Destino já existe, nada foi sobrescrito: {out}")
    out.parent.mkdir(parents=True, exist_ok=True)
    return Path(tempfile.mkdtemp(prefix=".tt-carousel-", dir=out.parent))


def export(path: Path, out: Path, *, fit: str = "same-ratio", allow_upscale: bool = False) -> dict[str, Any]:
    m, _ = require_valid(path)
    w, h, bg = target_settings(m)
    cleaned = clean_manifest(m)
    temp = new_output(out)
    warnings = []
    try:
        for s in cleaned["slides"]:
            im = open_rgb(safe_file(path.parent, s["file"]), bg)
            delta = abs((im.width / im.height) / (w / h) - 1)
            if delta > 0.003 and fit == "same-ratio":
                raise ValueError(f"{s['id']}: proporção diferente. Recomponha a arte ou use --fit contain para autorizar bordas, nunca recorte silencioso.")
            scale = min(w / im.width, h / im.height)
            if scale > 1.001 and not allow_upscale:
                raise ValueError(f"{s['id']}: exige ampliação. Forneça original maior ou autorize --allow-upscale.")
            if delta > 0.003:
                warnings.append(f"{s['id']}: bordas adicionadas por --fit contain; revisar leitura.")
            if scale > 1.001:
                warnings.append(f"{s['id']}: ampliada por autorização explícita; conferir qualidade.")
            fitted = ImageOps.contain(im, (w, h), Image.Resampling.LANCZOS)
            canvas = Image.new("RGB", (w, h), bg)
            canvas.paste(fitted, ((w-fitted.width)//2, (h-fitted.height)//2))
            name = f"{s['position']:02d}-{s['id']}.jpg"
            canvas.save(temp/name, "JPEG", quality=92, subsampling=0, optimize=True, icc_profile=SRGB_BYTES)
            s["file"] = name
        dump(temp/"manifest.json", cleaned)
        (temp/"legenda.txt").write_text(cleaned["caption"] + "\n", encoding="utf-8")
        alts = [f"## {s['position']:02d} · {s['id']}\n\n{s['alt_text']}\n" for s in cleaned["slides"]]
        (temp/"textos-alternativos.md").write_text("\n".join(alts), encoding="utf-8")
        report = validate(temp/"manifest.json", require_target=True)
        if not report["ok"]:
            raise ValueError("Falha na validação da exportação: " + "; ".join(report["errors"]))
        dump(temp/"export-report.json", {"warnings": warnings, "content_fingerprint": fingerprint(temp/"manifest.json"),
                                       "note": "Exportação local. Nenhuma publicação ou aprovação foi realizada."})
        temp.rename(out)
    except Exception:
        shutil.rmtree(temp, ignore_errors=True)
        raise
    return {"ok": True, "output": str(out), "warnings": warnings, "count": len(cleaned["slides"])}


def preview(path: Path, out: Path) -> dict[str, Any]:
    m, _ = require_valid(path)
    _, _, bg = target_settings(m)
    temp = new_output(out)
    try:
        cols = min(3, len(m["slides"]))
        cell_w, cell_h, gap = 340, 485, 24
        sheet = Image.new("RGB", (cols*cell_w+(cols+1)*gap,
                         math.ceil(len(m["slides"])/cols)*cell_h+(math.ceil(len(m["slides"])/cols)+1)*gap), "#E1DEDA")
        draw = ImageDraw.Draw(sheet)
        font = ImageFont.load_default(size=16)
        cards=[]
        for i, s in enumerate(m["slides"]):
            im = open_rgb(safe_file(path.parent, s["file"]), bg)
            small = ImageOps.contain(im, (cell_w, 425), Image.Resampling.LANCZOS)
            x, y = gap+(i % cols)*(cell_w+gap), gap+(i//cols)*(cell_h+gap)
            sheet.paste(small, (x+(cell_w-small.width)//2,y))
            draw.text((x, y+433), f"{s['position']:02d}  {s['role']}", fill="#1E1E1E", font=font)
            draw.text((x, y+456), s["id"][:34], fill="#256675", font=font)
            b=io.BytesIO(); im.save(b,"JPEG",quality=88,icc_profile=SRGB_BYTES)
            uri="data:image/jpeg;base64,"+base64.b64encode(b.getvalue()).decode("ascii")
            cards.append(f'<figure><img src="{uri}" alt="{html.escape(s["alt_text"], quote=True)}"><figcaption>{s["position"]:02d} · {html.escape(s["id"])}<br>{html.escape(s["role"])}</figcaption></figure>')
        sheet.save(temp/"visao-geral.jpg",quality=92,icc_profile=SRGB_BYTES)
        page='''<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Revisão do carrossel</title><style>body{margin:0;background:#F2EFEB;color:#1E1E1E;font:18px/1.5 system-ui,sans-serif}header,aside{max-width:1100px;margin:32px auto;padding:0 24px}h1{line-height:1.1}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;padding:24px}figure{margin:0}img{display:block;width:100%;height:auto}figcaption{padding:12px 0;color:#256675}pre{white-space:pre-wrap;font:inherit}p{max-width:70ch}</style><header><h1>Revisão do carrossel</h1><p>Prévia local. Não é rascunho no Instagram nem autorização para publicar.</p><p>Conta: '''+html.escape(str(m.get("account_username") or "pendente"))+'''</p></header><main>'''+"".join(cards)+'''</main><aside><h2>Legenda</h2><pre>'''+html.escape(m["caption"])+'''</pre></aside></html>'''
        (temp/"index.html").write_text(page,encoding="utf-8")
        temp.rename(out)
    except Exception:
        shutil.rmtree(temp,ignore_errors=True); raise
    return {"ok":True,"output":str(out),"count":len(m["slides"])}


def package(path: Path, out: Path, *, draft: bool = False) -> dict[str, Any]:
    m,_=require_valid(path,strict=not draft,require_target=True)
    cleaned=clean_manifest(m)
    if out.exists():
        raise ValueError("ZIP de destino já existe; não sobrescrito.")
    out.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".tt-zip-", dir=out.parent) as td:
        temp=Path(td)/"package.zip"
        with zipfile.ZipFile(temp,"w",zipfile.ZIP_DEFLATED) as z:
            order=[]
            for s in cleaned["slides"]:
                src=safe_file(path.parent,s["file"])
                with Image.open(src) as im:
                    if im.format != "JPEG":
                        raise ValueError("Execute export antes de package: o pacote operacional usa JPEG.")
                name=f"{s['position']:02d}-{s['id']}.jpg"
                z.write(src,name); s["file"]=name
                order.append(f"{s['position']:02d} {name} | {s['role']}")
            z.writestr("manifest.json",json.dumps(cleaned,ensure_ascii=False,indent=2)+"\n")
            z.writestr("legenda.txt",cleaned["caption"]+"\n")
            z.writestr("textos-alternativos.md","\n\n".join(f"## {s['position']:02d} {s['id']}\n{s['alt_text']}" for s in cleaned["slides"]))
            z.writestr("ORDEM.txt","\n".join(order)+"\n\nNenhum arquivo foi publicado. Usar esta ordem explicitamente no upload.\n")
            z.writestr("revisao.json",json.dumps({"draft":draft,"content_fingerprint":fingerprint(path),
                          "publication_authorized":False,"note":"Verificações técnicas não comprovam qualidade da arte nem consentimento."},ensure_ascii=False,indent=2))
        temp.rename(out)
    return {"ok":True,"output":str(out),"count":len(cleaned["slides"]),"draft":draft}


def main() -> int:
    parser=argparse.ArgumentParser(description=__doc__)
    sub=parser.add_subparsers(dest="command",required=True)
    v=sub.add_parser("validate",help="Validar ordem e arquivos; não consulta limites da API.")
    v.add_argument("manifest",type=Path); v.add_argument("--strict",action="store_true")
    v.add_argument("--require-target",action="store_true")
    for opt in ("max-items","max-bytes","caption-limit","alt-limit"):
        v.add_argument("--"+opt,type=int)
    e=sub.add_parser("export",help="Gerar JPEG sRGB, sem crop, em pasta nova.")
    e.add_argument("manifest",type=Path); e.add_argument("--out",type=Path,required=True)
    e.add_argument("--fit",choices=("same-ratio","contain"),default="same-ratio")
    e.add_argument("--allow-upscale",action="store_true")
    p=sub.add_parser("preview",help="Gerar HTML autocontido e folha de contato, em pasta nova.")
    p.add_argument("manifest",type=Path); p.add_argument("--out",type=Path,required=True)
    z=sub.add_parser("package",help="Empacotar os JPEGs exportados na ordem do manifesto.")
    z.add_argument("manifest",type=Path); z.add_argument("--out",type=Path,required=True)
    z.add_argument("--draft",action="store_true",help="Permite copy/conta ainda pendentes; marca pacote como revisão.")
    f=sub.add_parser("fingerprint",help="Calcular impressão digital da ordem, pixels, conta e copy.")
    f.add_argument("manifest",type=Path)
    a=sub.add_parser("check-approval",help="Conferir registro externo de autorização; não publica.")
    a.add_argument("manifest",type=Path); a.add_argument("approval",type=Path)
    args=parser.parse_args()
    try:
        if args.command=="validate":
            opts={k:getattr(args,k) for k in ("strict","require_target","max_items","max_bytes","caption_limit","alt_limit")}
            if any(v is not None and v<1 for k,v in opts.items() if k not in {"strict","require_target"}):
                raise ValueError("Limites informados devem ser inteiros positivos.")
            result=validate(args.manifest,**opts)
        elif args.command=="export":
            result=export(args.manifest,args.out,fit=args.fit,allow_upscale=args.allow_upscale)
        elif args.command=="preview": result=preview(args.manifest,args.out)
        elif args.command=="package": result=package(args.manifest,args.out,draft=args.draft)
        elif args.command=="fingerprint": result={"ok":True,"content_fingerprint":fingerprint(args.manifest)}
        else: result=check_approval(args.manifest,args.approval)
    except (OSError,ValueError,TypeError,KeyError,Image.DecompressionBombError) as exc:
        print(json.dumps({"ok":False,"errors":[str(exc)]},ensure_ascii=False),file=sys.stderr)
        return 2
    print(json.dumps(result,ensure_ascii=False,indent=2))
    return 0 if result.get("ok") else 1


if __name__=="__main__":
    raise SystemExit(main())
