// Renderizador. Abre index.html num Chromium sem janela, chama
// window.renderFrame(t) quadro a quadro e entrega os quadros ao ffmpeg.
//
//   node render.mjs --check            sanidade: erros de página, quadros vazios, tempos
//   node render.mjs --stills 3 12.5    PNGs avulsos em out/stills/ (+ --debug: grade, margens, origem do mundo)
//   node render.mjs --contact          folha de contato nos tempos da partitura (out/contact.png)
//   node render.mjs --draft            rascunho: 15 fps, sem motion blur (rápido)
//   node render.mjs                    final: 30 fps, motion blur de 4 subquadros
//   node render.mjs --preview          versão ≤ 28 MB do final (para enviar por chat)
//   node render.mjs --report           check + loudness num arquivo (out/medicoes.md) para colar no relatório
//
// Variáveis: CHROME_PATH (caminho do Chromium), WORKERS (padrão 4).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import ffmpegPath from 'ffmpeg-static';
import { FPS, DURATION, T, WIDTH, HEIGHT } from './timeline.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'out');
const args = process.argv.slice(2);
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff' };

function chromePath() {
  const cands = [process.env.CHROME_PATH, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'];
  try { cands.push(chromium.executablePath()); } catch { /* sem navegador do playwright */ }
  if (fs.existsSync('/opt/pw-browsers')) for (const d of fs.readdirSync('/opt/pw-browsers')) cands.push(`/opt/pw-browsers/${d}/chrome-linux/chrome`);
  const hit = cands.find((p) => p && fs.existsSync(p));
  if (!hit) throw new Error('Chromium não encontrado. Defina CHROME_PATH ou rode: npx playwright install chromium');
  return hit;
}
function serve() {
  const server = http.createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}
const errors = [];
async function openPage(browser, url) {
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  page.on('pageerror', (e) => { errors.push(e.message); console.error('ERRO NA PÁGINA:', e.message); });
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('favicon')) { errors.push(m.text()); console.error('console:', m.text()); } });
  await page.goto(url);
  await page.waitForFunction(() => window.ready, null, { timeout: 30000 });
  await page.evaluate(() => window.ready);
  return page;
}
const grab = (page, t, samples, fps, type = 'jpeg') => page.evaluate(([t, s, f, ty]) => {
  window.renderFrame(t, s, f);
  return document.getElementById('c').toDataURL(ty === 'png' ? 'image/png' : 'image/jpeg', 0.95);
}, [t, samples, fps, type]).then((d) => Buffer.from(d.split(',')[1], 'base64'));

function ffmpeg(argv) {
  const p = spawn(ffmpegPath, ['-loglevel', 'error', '-y', ...argv], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((ok, ko) => p.on('close', (c) => (c ? ko(new Error('ffmpeg saiu com ' + c)) : ok())));
  return { stdin: p.stdin, done };
}
const write = (s, b) => new Promise((ok) => (s.write(b) ? ok() : s.once('drain', ok)));

// Todos os tempos numéricos da partitura, achatados e ordenados.
function cueTimes() {
  const out = [];
  const walk = (v) => { if (typeof v === 'number') out.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  walk(T);
  return [...new Set(out.map((x) => +x.toFixed(2)))].sort((a, b) => a - b);
}

if (args[0] === '--preview') {
  const src = path.join(OUT, 'final.mp4'), dst = path.join(OUT, 'preview.mp4');
  if (!fs.existsSync(src)) throw new Error('Rode o render final antes (node render.mjs).');
  const kbps = Math.floor((28 * 8 * 1024) / DURATION) - 170;
  await ffmpeg(['-i', src, '-c:v', 'libx264', '-preset', 'slow', '-b:v', `${kbps}k`, '-pass', '1', '-passlogfile', path.join(OUT, 'p2'), '-an', '-f', 'mp4', '/dev/null']).done;
  await ffmpeg(['-i', src, '-c:v', 'libx264', '-preset', 'slow', '-b:v', `${kbps}k`, '-pass', '2', '-passlogfile', path.join(OUT, 'p2'), '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', dst]).done;
  for (const f of fs.readdirSync(OUT)) if (f.startsWith('p2')) fs.unlinkSync(path.join(OUT, f));
  console.log(`ok → ${dst} (${(fs.statSync(dst).size / 1048576).toFixed(1)} MB)`);
  process.exit(0);
}

// Vigia: comandos de inspeção levam segundos a poucos minutos. Travou? Sai com erro
// em vez de ficar pendurado (render final: sem limite).
if (['--check', '--stills', '--contact', '--report'].includes(args[0])) setTimeout(() => { console.error('ERRO: comando travado há 8 min — confira laços infinitos em scene.js (a cena deve desenhar um quadro em < 1 s).'); process.exit(2); }, 480000).unref();

const server = await serve();
const url = `http://127.0.0.1:${server.address().port}/index.html`;
const browser = await chromium.launch({ executablePath: chromePath(), args: ['--force-color-profile=srgb'] });
fs.mkdirSync(OUT, { recursive: true });

try {
  if (args[0] === '--check' || args[0] === '--report') {
    const logLines = []; const log0 = console.log; if (args[0] === '--report') console.log = (...a) => { logLines.push(a.join(' ')); log0(...a); };
    // Números, não impressão: modelos (e pessoas) julgam mal tamanho e ritmo
    // olhando miniaturas. Este relatório mede.
    const bad = cueTimes().filter((x) => x < 0 || x > DURATION);
    if (bad.length) console.error(`TEMPOS FORA DE 0..${DURATION}:`, bad.join(', '));
    const page = await openPage(browser, url);
    page.on('console', (m) => { if (m.type() === 'warning') console.warn('aviso da cena:', m.text()); });
    const step = 0.5, rows = [];
    for (let t = 0.25; t < DURATION; t += step) {
      rows.push(await page.evaluate(([t, step]) => {
        const c = document.getElementById('c'), g = c.getContext('2d');
        const lum = (d, i) => 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
        window.renderFrame(t, 1);
        const a = g.getImageData(0, 0, c.width, c.height).data;
        window.renderFrame(t + step, 1);
        const b = g.getImageData(0, 0, c.width, c.height).data;
        // cor de fundo = mediana de amostras nas bordas
        const edge = []; for (let x = 8; x < c.width; x += 97) { edge.push(lum(a, (4 * c.width + x) * 4), lum(a, ((c.height - 5) * c.width + x) * 4)); }
        edge.sort((p, q) => p - q); const bg = edge[edge.length >> 1];
        let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1, ink = 0, n = 0, diff = 0;
        for (let y = 0; y < c.height; y += 4) for (let x = 0; x < c.width; x += 4) {
          const i = (y * c.width + x) * 4, v = lum(a, i); n++;
          diff += Math.abs(v - lum(b, i));
          if (Math.abs(v - bg) > 45) { ink++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        }
        return { t, h: x1 < 0 ? 0 : (y1 - y0) / c.height, w: x1 < 0 ? 0 : (x1 - x0) / c.width, ink: ink / n, motion: diff / n, x0, y0, x1, y1 };
      }, [t, step]));
    }
    console.log('  t(s)  movimento  área desenhada (altura × largura do quadro)  tinta');
    for (const r of rows) console.log(`${r.t.toFixed(2).padStart(6)}  ${r.motion.toFixed(2).padStart(7)}   ${(r.h * 100).toFixed(0).padStart(3)}% × ${(r.w * 100).toFixed(0).padStart(3)}%${r.h > 0 ? `  [x ${r.x0}–${r.x1}, y ${r.y0}–${r.y1}]` : ''}   ${(r.ink * 100).toFixed(1)}%`);
    const flags = [];
    // trechos parados: movimento < 0.4 por ≥ 3 s, fora dos 2 s finais e dos congelamentos da partitura
    let runStart = null;
    for (const r of rows) {
      const still = r.motion < 0.4 && r.t < DURATION - 2;
      if (still && runStart == null) runStart = r.t;
      if ((!still || r === rows[rows.length - 1]) && runStart != null) { if (r.t - runStart >= 3) flags.push(`PARADO de ${runStart.toFixed(1)} a ${r.t.toFixed(1)} s: nada se move por ${(r.t - runStart).toFixed(1)} s. Mantenha algo vivo (deriva de câmera 'lin', traço fervendo, próximo gesto mais cedo) ou encurte.`); runStart = null; }
    }
    const empty = rows.filter((r) => r.ink < 0.002 && r.t > 1 && r.t < DURATION - 1);
    if (empty.length) flags.push(`QUASE VAZIO em ${empty.map((r) => r.t.toFixed(1)).join(', ')} s (confira se é intencional).`);
    const edgeHits = rows.filter((r) => r.h > 0 && (r.x0 < 60 || r.y0 < 60 || r.x1 > 1860 || r.y1 > 1020) && r.h < 0.95);
    if (edgeHits.length) flags.push(`DESENHO ENCOSTANDO NA BORDA em ${edgeHits.slice(0, 8).map((r) => r.t.toFixed(1)).join(', ')} s — se for texto, está fora da margem de segurança; se for desenho, pode ser intencional (sangria).`);
    const fontsOk = await page.evaluate(() => [...document.fonts].map((f) => `${f.family} ${f.weight} ${f.status}`));
    console.log('\nfontes:', fontsOk.join(' | ') || 'NENHUMA (texto sairá em fonte padrão!)');
    console.log('\nLEITURA: "área desenhada" mede o conjunto de tudo que não é fundo (texto + desenho).');
    console.log('Para o protagonista ocupar a tela, use fitFrame(LAYOUTS.<layout>.hero, alturaDoHeroiNoMundo) — lib/layout.js.');
    if (flags.length) { console.log('\nALERTAS:'); flags.forEach((f) => console.log(' - ' + f)); }
    console.log(errors.length ? `\nFALHOU: ${errors.length} erro(s) de página.` : `\ncheck ok: sem erros de página${flags.length ? ` (mas ${flags.length} alerta(s) acima — trate cada um)` : ''}.`);
    if (args[0] === '--report') {
      console.log = log0;
      const { spawnSync } = await import('node:child_process');
      const wav = path.join(OUT, 'audio.wav');
      const loud = fs.existsSync(wav) ? spawnSync(process.execPath, [path.join(ROOT, 'tools', 'loudness.mjs'), wav, '2'], { encoding: 'utf8' }).stdout : '(sem out/audio.wav — rode node audio.mjs)';
      const md = `# Medições automáticas\n\nGerado por \`node render.mjs --report\`. Cole este arquivo inteiro no relatório.\n\n## Imagem (--check)\n\n\`\`\`\n${logLines.join('\n')}\n\`\`\`\n\n## Som (tools/loudness.mjs)\n\n\`\`\`\n${loud}\`\`\`\n`;
      fs.writeFileSync(path.join(OUT, 'medicoes.md'), md);
      console.log(`ok → ${path.join(OUT, 'medicoes.md')}`);
    }
  } else if (args[0] === '--stills') {
    const dir = path.join(OUT, 'stills'); fs.mkdirSync(dir, { recursive: true });
    const debug = args.includes('--debug');
    const page = await openPage(browser, debug ? url + '?debug=1' : url);
    for (const s of args.slice(1).filter((a) => a !== '--debug')) {
      const t = parseFloat(s);
      const f = path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.png`);
      fs.writeFileSync(f, await grab(page, t, 1, FPS, 'png'));
      console.log(f);
    }
  } else if (args[0] === '--contact') {
    // Um quadro 0.35 s depois de cada tempo da partitura (quando o gesto já
    // começou) + o último quadro. Montado no próprio navegador, com rótulos.
    const times = [...cueTimes().map((x) => Math.min(DURATION - 0.05, x + 0.35)), DURATION - 0.05];
    const page = await openPage(browser, url);
    const tiles = [];
    for (const t of times) tiles.push({ t, data: 'data:image/jpeg;base64,' + (await grab(page, t, 1, FPS)).toString('base64') });
    const png = await page.evaluate(async (tiles) => {
      const cols = 5, tw = 384, th = 216, rows = Math.ceil(tiles.length / cols);
      const c = document.createElement('canvas'); c.width = cols * tw; c.height = rows * th; const g = c.getContext('2d');
      g.fillStyle = '#111'; g.fillRect(0, 0, c.width, c.height);
      for (let i = 0; i < tiles.length; i++) {
        const im = new Image(); im.src = tiles[i].data; await im.decode();
        const x = (i % cols) * tw, y = Math.floor(i / cols) * th;
        g.drawImage(im, x, y, tw - 2, th - 2);
        g.fillStyle = 'rgba(0,0,0,0.7)'; g.fillRect(x, y, 70, 24); g.fillStyle = '#fff'; g.font = '16px monospace'; g.fillText(tiles[i].t.toFixed(2) + 's', x + 6, y + 17);
      }
      return c.toDataURL('image/png');
    }, tiles);
    const f = path.join(OUT, 'contact.png');
    fs.writeFileSync(f, Buffer.from(png.split(',')[1], 'base64'));
    console.log(`ok → ${f} (${times.length} quadros)`);
    console.log('AGORA ABRA ESTA IMAGEM (ferramenta de leitura de imagem) e escreva, para cada quadro, o que se vê.');
    console.log('Pergunte: o protagonista está visível e grande? algum texto cortado ou fora da margem? algo sobrou de um gesto anterior?');
  } else {
    const draft = args.includes('--draft');
    const fps = draft ? 15 : FPS, samples = draft ? 1 : 4;
    const total = Math.round(DURATION * fps), workers = +(process.env.WORKERS || 4), chunk = Math.ceil(total / workers);
    const started = Date.now();
    let doneFrames = 0;
    const parts = await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const page = await openPage(browser, url);
      const file = path.join(OUT, `part${w}.mp4`);
      const enc = ffmpeg(['-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', draft ? 'veryfast' : 'slow', '-crf', draft ? '23' : '16', '-pix_fmt', 'yuv420p', '-r', String(fps), file]);
      for (let f = w * chunk; f < Math.min(total, (w + 1) * chunk); f++) {
        await write(enc.stdin, await grab(page, f / fps, samples, fps));
        if (++doneFrames % 60 === 0) console.log(`${doneFrames}/${total} quadros · ${((Date.now() - started) / 1000).toFixed(0)}s`);
      }
      enc.stdin.end(); await enc.done; await page.close();
      return file;
    }));
    const list = path.join(OUT, 'parts.txt');
    fs.writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
    const audio = path.join(OUT, 'audio.wav');
    const name = path.join(OUT, draft ? 'draft.mp4' : 'final.mp4');
    const hasAudio = fs.existsSync(audio);
    if (!hasAudio) console.warn('aviso: out/audio.wav não existe — vídeo sem som. Rode node audio.mjs antes.');
    await ffmpeg(['-f', 'concat', '-safe', '0', '-i', list, ...(hasAudio ? ['-i', audio, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000', '-c:a', 'aac', '-b:a', '256k'] : []), '-c:v', 'copy', '-t', String(DURATION), '-movflags', '+faststart', name]).done;
    for (const p of [...parts, list]) fs.unlinkSync(p);
    console.log(`ok → ${name} (${((Date.now() - started) / 1000).toFixed(0)}s)${errors.length ? ` — ATENÇÃO: ${errors.length} erro(s) de página` : ''}`);
  }
} finally {
  await browser.close();
  server.close();
}
