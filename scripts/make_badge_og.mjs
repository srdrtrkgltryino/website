// Renders the LinkedIn preview images for the badge share pages (public/og/badges/{lang}-{badge}.jpg) with headless
// Chrome. Run after changing badges or their names: node scripts/make_badge_og.mjs
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import {ICONS} from '../src/lib/icons.ts';
import {visitorCopy} from '../src/i18n/visitor.ts';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const root = path.resolve(import.meta.dirname, '..');
const fonts = path.join(root, 'node_modules/@fontsource-variable');
const out = path.join(root, 'public/og/badges');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'badge-og-'));
fs.mkdirSync(out, {recursive: true});

const text = {
  en: {earned: 'I earned a badge on tryino.com', foot: 'Play Points Rush · tryino.com/play'},
  tr: {earned: 'tryino.com\'da bir rozet kazandım', foot: 'Puan Yağmuru oyna · tryino.com/tr/play'},
};

for (const lang of ['en', 'tr']) {
  for (const [id, [name, desc]] of Object.entries(visitorCopy[lang].badges)) {
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      @font-face{font-family:Outfit;src:url(file://${fonts}/outfit/files/outfit-latin-wght-normal.woff2) format('woff2');font-weight:100 900}
      @font-face{font-family:Outfit;src:url(file://${fonts}/outfit/files/outfit-latin-ext-wght-normal.woff2) format('woff2');font-weight:100 900;unicode-range:U+0100-024F}
      @font-face{font-family:Inter;src:url(file://${fonts}/inter/files/inter-latin-wght-normal.woff2) format('woff2');font-weight:100 900}
      @font-face{font-family:Inter;src:url(file://${fonts}/inter/files/inter-latin-ext-wght-normal.woff2) format('woff2');font-weight:100 900;unicode-range:U+0100-024F}
      *{margin:0;box-sizing:border-box}
      body{width:1200px;height:630px;overflow:hidden;font-family:Inter;color:#c9d6e8;position:relative;
        background:radial-gradient(120% 120% at 100% 0%,#4F46E5 0%,#1A2F6B 42%,#0B1F3A 76%)}
      .dots{position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.07) 2px,transparent 2px);background-size:36px 36px}
      .medal{position:absolute;left:96px;top:155px;width:320px;height:320px;border-radius:96px;display:grid;place-items:center;
        background:linear-gradient(135deg,#00A4E4,#4F46E5);box-shadow:0 0 0 18px rgba(255,255,255,.06),0 50px 120px rgba(79,70,229,.55)}
      .medal svg{width:160px;height:160px;color:#fff}
      .text{position:absolute;left:500px;right:80px;top:150px;display:grid;gap:22px}
      .earned{font-size:28px;color:#9fb3c8}
      h1{font-family:Outfit;font-weight:650;font-size:96px;line-height:1;letter-spacing:-.03em;color:#fff}
      .desc{font-family:Outfit;font-weight:600;font-size:32px;color:#FFB547}
      .foot{position:absolute;left:500px;bottom:70px;font-size:24px;color:#9fb3c8;display:flex;align-items:center;gap:16px}
      .foot img{height:34px}
    </style></head><body><div class="dots"></div>
      <div class="medal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[id]}</svg></div>
      <div class="text"><p class="earned">${text[lang].earned}</p><h1>${name}</h1><p class="desc">${desc}</p></div>
      <div class="foot"><img src="file://${root}/public/brand/tryino-logo-horizontal-dark.svg"><span>${text[lang].foot}</span></div>
    </body></html>`;
    const page = path.join(tmp, `${lang}-${id}.html`);
    const png = path.join(tmp, `${lang}-${id}.png`);
    fs.writeFileSync(page, html);
    execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files', '--window-size=1200,630', '--virtual-time-budget=3000', `--screenshot=${png}`, `file://${page}`], {stdio: 'ignore'});
    await sharp(png).jpeg({quality: 86, mozjpeg: true}).toFile(path.join(out, `${lang}-${id}.jpg`));
    console.log(`${lang}-${id}.jpg`);
  }
}
fs.rmSync(tmp, {recursive: true, force: true});
