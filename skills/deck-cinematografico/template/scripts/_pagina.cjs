// Utilitário comum: abre index.html (file://) num Chromium sem janela.
const path = require("path");
const { chromium } = require("playwright");
module.exports = async (query = "", viewport = { width: 1920, height: 1080 }) => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport });
  const erros = []; p.on("pageerror", e => erros.push(e.message)); p.on("console", m => { if (m.type() === "warning" || m.type() === "error") console.log("página:", m.text()); });
  await p.goto("file://" + path.resolve(__dirname, "../index.html") + query);
  await p.evaluate(() => document.fonts.ready.then(() => 0));
  // atenção: nunca retorne tl.seek() de um evaluate (serializar a timeline trava o processo)
  const seek = t => p.evaluate(t => { window.__timelines.main.seek(t); }, t);
  return { b, p, erros, seek };
};
