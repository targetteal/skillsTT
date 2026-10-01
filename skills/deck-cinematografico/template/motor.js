/* Motor do deck cinematográfico · v1.0
 *
 * Uma composição HyperFrames contínua que serve a dois usos:
 *   · ao vivo (index.html?present): cada clique TOCA a animação até a próxima parada;
 *   · vídeo (hyperframes render): a mesma timeline, com respiros nas paradas.
 *
 * Mundo único com câmera 3D por variáveis CSS (seek-safe):
 *   --cx/--cy  ponto do mundo no centro da tela   --s  dolly (1 = identidade)
 *   --rx/--ry  inclinação/órbita em graus          --r  rolagem   --at relógio da respiração
 * A identidade (cores, fontes) vem do bloco IDENTIDADE no index.html, gerado por
 * scripts/aplicar-identidade.mjs. Os planos vêm de planos/*.js via Deck.plano({...}).
 */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const PERSP = 1600;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const svg = (tag, attrs = {}, parent) => { const el = document.createElementNS(NS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); parent && parent.appendChild(el); return el; };
  const div = (cls, html, parent, style) => { const el = document.createElement("div"); el.className = cls || ""; el.innerHTML = html || ""; if (style) Object.assign(el.style, style); parent && parent.appendChild(el); return el; };
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const hexPts = r => [0, 1, 2, 3, 4, 5].map(i => { const a = Math.PI / 180 * (60 * i - 30); return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`; }).join(" ");
  const decor = el => { el.setAttribute("data-layout-ignore", ""); return el; };

  const tl = gsap.timeline({ paused: true });
  const S = { T: 0, HOLDS: [], HOLD_ENDS: [], NOMES: [], planos: [], numeroAtual: null };

  /* ---------- paradas ---------- */
  // hold: parada do deck. d é o respiro que só existe no vídeo (ao vivo o clique o pula).
  const hold = (d = 2.4, nome = "") => { S.HOLDS.push(+S.T.toFixed(3)); S.T += d; S.HOLD_ENDS.push(+S.T.toFixed(3)); S.NOMES.push(nome); };

  /* ---------- câmera ---------- */
  const camv = v => ({ "--cx": v.cx, "--cy": v.cy, "--s": v.s ?? 1, "--r": v.r ?? 0, "--rx": v.rx ?? 0, "--ry": v.ry ?? 0 });
  const cam = (at, v, dur, ease = "power2.inOut") => tl.to("#camvars", { ...camv(v), duration: dur, ease }, at);
  // vários pontos de passagem: [[alvo, duração, ease], ...]
  const camK = (at, keys) => { let t = at; keys.forEach(([v, d, e]) => { cam(t, v, d, e || "power2.inOut"); t += d; }); return t; };
  const corte = (at, v) => tl.set("#camvars", camv(v), at); // corte seco (use escondido por um movimento rápido)
  const tremor = (at, forca = 1) => tl.to("#camvars", { keyframes: [{ "--r": .9 * forca, duration: .06 }, { "--r": -.7 * forca, duration: .06 }, { "--r": .35 * forca, duration: .07 }, { "--r": 0, duration: .1 }] }, at);

  /* ---------- tipografia ---------- */
  // linhas com máscara: retorna os spans internos que animam
  const lines = (el, arr) => { el.innerHTML = arr.map(l => `<span class="ln"><span>${l}</span></span>`).join(""); return [...el.querySelectorAll(".ln > span")]; };
  const reveal = (els, at, stagger = .12, dur = 1.15) => tl.to(els, { yPercent: 0, duration: dur, ease: "power4.out", stagger }, at);
  const conceal = (els, at, stagger = .05) => tl.to(els, { yPercent: -115, duration: .7, ease: "power3.in", stagger }, at);
  // odômetro: número que rola até o valor (0..999)
  const odometro = (el, valor, altura) => {
    const d = String(valor).split(""), strips = [];
    el.classList.add("odo"); el.style.height = altura + "px";
    d.forEach((dig, i) => {
      const alvo = Number(d.slice(0, i + 1).join("")), n = alvo + 1;
      const cells = Array.from({ length: n }, (_, k) => `<span style="height:${altura}px;line-height:${altura}px">${i === 0 && k === 0 && d.length > 1 ? "&nbsp;" : k % 10}</span>`).join("");
      const st = div("strip", cells, el);
      // dígitos fora da máscara são intencionais: marcados para o validador
      st.querySelectorAll("span").forEach(c => ["data-layout-allow-overlap", "data-layout-allow-occlusion", "data-layout-allow-overflow"].forEach(a => c.setAttribute(a, "")));
      strips.push(st);
    });
    return (at, dur = 2.6, ease = "power2.out") => strips.forEach(st => { const n = st.children.length; tl.fromTo(st, { yPercent: 0 }, { yPercent: -(n - 1) / n * 100, duration: dur, ease }, at); });
  };

  /* ---------- 3D ---------- */
  // linha 3D entre a e b ({x,y,z}); o de fora orienta (CSS), o de dentro desenha (GSAP scaleX)
  const link3d = (a, b, op, parent) => {
    const dx = b.x - a.x, dy = b.y - a.y, dz = (b.z || 0) - (a.z || 0), L = Math.hypot(dx, dy, dz), Lxy = Math.hypot(dx, dy);
    const o = decor(div("w", "", parent, { left: "0px", top: "0px", width: L + "px", height: "1.2px", transformOrigin: "0 0", opacity: op,
      transform: `translate3d(${a.x}px, ${a.y}px, ${a.z || 0}px) rotateZ(${Math.atan2(dy, dx)}rad) rotateY(${-Math.atan2(dz, Lxy)}rad)` }));
    const i = div("", "", o, { width: "100%", height: "100%", background: "var(--tinta)", transformOrigin: "0 50%" });
    gsap.set(i, { scaleX: 0 });
    return i;
  };
  // fator para compensar a perspectiva: quem está em z aparece em (x,y) como se estivesse em z=0
  const compensa = z => (PERSP - z) / PERSP;

  /* ---------- camadas de profundidade ---------- */
  const fundo = html => { $("#bg3d").innerHTML = html; };
  const poeira = (regioes, porRegiao = 26, seed = 77) => {
    const dr = rng(seed);
    regioes.forEach(([rx, ry]) => { for (let i = 0; i < porRegiao; i++) {
      const x = rx + (dr() - .5) * 2600, y = ry + (dr() - .5) * 1500, z = -1300 + dr() * 1650, A = 8 + dr() * 26, F = .12 + dr() * .3, P = dr() * 6;
      const traco = dr() < .35, perto = z > 150;
      decor(div("w", "", $("#dust"), { left: "0px", top: "0px", width: (traco ? 10 + dr() * 16 : 2 + dr() * 3) + "px", height: (traco ? 1.2 : 2 + dr() * 3) + "px",
        background: dr() < .15 ? "var(--acento)" : "var(--tinta)", opacity: (.18 + dr() * .35).toFixed(2), borderRadius: traco ? "0" : "50%", filter: perto ? "blur(2px)" : "none",
        transform: `translate3d(calc(${x.toFixed(0)}px + sin(var(--at) * ${F.toFixed(2)} + ${P.toFixed(2)}) * ${A.toFixed(0)}px), calc(${y.toFixed(0)}px + cos(var(--at) * ${(F * .8).toFixed(2)} + ${P.toFixed(2)}) * ${A.toFixed(0)}px), ${z.toFixed(0)}px) rotate(${(dr() * 180).toFixed(0)}deg)` }));
    } });
  };
  // itens: [x, y, z(350..700), html, blur, opacidade]. Posicione no MEIO dos trajetos de câmera, nunca nas paradas.
  const primeiroPlano = itens => itens.forEach(([x, y, z, html, bl, op]) => { const el = decor(div("w", html, $("#fg"), { left: x + "px", top: y + "px", opacity: op, filter: `blur(${bl}px)` })); gsap.set(el, { z, xPercent: -50, yPercent: -50 }); });

  /* ---------- cabeçalho ---------- */
  const numero = (at, n) => {
    const box = $("#mast .no"); if (!box) return;
    let el = box.querySelector(`[data-n="${n}"]`);
    if (!el) { el = document.createElement("span"); el.dataset.n = n; el.textContent = "Nº " + n; box.appendChild(el); gsap.set(el, { opacity: 0 }); }
    const prev = S.numeroAtual && box.querySelector(`[data-n="${S.numeroAtual}"]`);
    if (prev) tl.to(prev, { yPercent: -100, opacity: 0, duration: .5, ease: "power2.in" }, at);
    tl.fromTo(el, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .6, ease: "power3.out" }, at + (prev ? .3 : 0));
    S.numeroAtual = n;
  };

  /* ---------- planos ---------- */
  // Deck.plano({ id, numero, regiao: [x, y], build(ctx) {...}, beats: [{ dur, hold, run(t, ctx) {...} }] })
  const plano = def => S.planos.push(def);
  const ctx = {
    $, $$, div, svg, rng, hexPts, decor, tl, cam, camK, corte, tremor, lines, reveal, conceal, odometro, link3d, compensa, PERSP,
    fundo, poeira, primeiroPlano, numero, p: {}, shared: {},
    centro: id => { const p = S.planos.find(q => q.id === id); return { cx: p.regiao[0] + 960, cy: p.regiao[1] + 540 }; },
    get T() { return S.T; }
  };

  const iniciar = (opts = {}) => {
    const cam3d = $("#cam"), hud = $("#hud");
    ctx.hud = hud;
    // 1) construir todos os planos (a ordem importa para match cuts: planos podem ler ctx.p de anteriores)
    S.planos.forEach(p => {
      const g = div("w" + (p.p3d ? " p3d" : ""), "", cam3d, { left: "0px", top: "0px" }); g.id = "pl-" + p.id;
      ctx.g = g; ctx.regiao = p.regiao || [0, 0];
      ctx.p[p.id] = (p.build && p.build(ctx)) || {};
    });
    // 2) linhas mascaradas escondidas; marcadas para o validador (camadas intencionais)
    $$(".ln > span, .ln > span em, .ln > span em span").forEach(e => ["data-layout-allow-overlap", "data-layout-allow-occlusion", "data-layout-allow-overflow"].forEach(a => e.setAttribute(a, "")));
    gsap.set(".ln > span", { yPercent: 115 });
    gsap.set(["#mast-rule"], { scaleX: 0 });
    gsap.set("#mast .m", { opacity: 0 });
    // 3) timeline
    hold(opts.inicio ?? .6, "inicio");
    S.planos.forEach((p, pi) => {
      p.beats.forEach((b, bi) => {
        const t = S.T;
        if (bi === 0 && pi === 0 && opts.cabecalho !== false) {
          tl.to("#mast-rule", { scaleX: 1, duration: 1.3, ease: "power3.inOut" }, t);
          tl.to("#mast .m", { opacity: 1, duration: .6, stagger: .12 }, t + .5);
        }
        if (bi === 0 && p.numero) numero(t + (p.numeroEm ?? .5), p.numero);
        ctx.g = $("#pl-" + p.id); ctx.regiao = p.regiao || [0, 0];
        b.run(t, ctx);
        S.T += b.dur;
        hold(b.hold ?? 2.4, `${p.id}-${bi + 1}`);
      });
    });
    // 4) respiração contínua no vídeo (ao vivo, o ticker assume)
    tl.fromTo("#camvars", { "--at": 0 }, { "--at": S.T, duration: S.T, ease: "none" }, 0);
    window.__timelines["main"] = tl;
    window.__HOLDS = S.HOLDS; window.__HOLD_NAMES = S.NOMES; window.__DECK = S;
    const DUR = +$("#root").dataset.duration;
    if (Math.abs(S.T - DUR) > .01) console.warn("data-duration desatualizado: use", S.T.toFixed(2));
    tl.seek(0);
    if (/[?&]present\b/.test(location.search)) apresentar(opts);
  };

  /* ---------- modo apresentação ---------- */
  const apresentar = opts => {
    const html = document.documentElement, body = document.body, H = S.HOLDS, E = S.HOLD_ENDS;
    html.style.background = opts.fundoApresentacao || "#1b1a17"; html.style.overflow = "hidden";
    const fit = () => { const k = Math.min(innerWidth / 1920, innerHeight / 1080); body.style.transformOrigin = "0 0"; body.style.transform = `translate(${(innerWidth - 1920 * k) / 2}px, ${(innerHeight - 1080 * k) / 2}px) scale(${k})`; };
    html.style.width = "100vw"; html.style.height = "100vh"; fit(); addEventListener("resize", fit);
    const reent = opts.reentrada ? S.NOMES.indexOf(opts.reentrada.ate) : -1;
    let idx = 0, playing = null;
    const go = i => {
      i = Math.max(0, Math.min(H.length - 1, i));
      if (playing) { playing.progress(1); playing = null; }
      // o clique pula o respiro do vídeo e começa a animação na hora
      if (i === idx + 1) { tl.seek(E[idx]); playing = tl.tweenTo(H[i], { duration: H[i] - E[idx], ease: "none", onComplete: () => (playing = null) }); }
      else tl.seek(H[i]);
      idx = i;
    };
    addEventListener("keydown", e => {
      if (["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); go(idx + 1); }
      if (["ArrowLeft", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); go(idx - 1); }
      if (e.key === "Home") go(0);
      if (e.key === "f") document.fullscreenElement ? document.exitFullscreen() : html.requestFullscreen();
      if ((e.key === "r" || e.key === "R") && reent > 0) { if (playing) playing.kill(); tl.seek(0); idx = reent; playing = tl.tweenTo(H[reent], { duration: opts.reentrada.segundos || 60, ease: "none", onComplete: () => (playing = null) }); }
    });
    addEventListener("click", () => go(idx + 1));
    const camvars = $("#camvars");
    gsap.ticker.add(() => camvars.style.setProperty("--at", gsap.ticker.time.toFixed(3)));
  };

  window.Deck = { plano, iniciar, ctx, S };
})();
