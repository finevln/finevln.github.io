#!/usr/bin/env node
// Renders teaser scenes frame by frame at 30 fps, timed by teaser/durations.json.
//
//   node teaser/tools/render.js            all scenes to teaser/scenes/scene_XX.mp4
//   node teaser/tools/render.js 3 7        only these scenes
//   node teaser/tools/render.js --stills   contact stills to teaser/build/stills/
//
// Needs Playwright installed outside the repo: NODE_PATH=<dir>/node_modules node teaser/tools/render.js
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEASER = path.resolve(__dirname, '..');
const FPS = 30;
const scenes = JSON.parse(fs.readFileSync(path.join(TEASER, 'durations.json'))).scenes;
const seqDir = path.join(TEASER, 'build/seq');
const counts = Object.fromEntries(fs.readdirSync(seqDir).map((d) => [d, fs.readdirSync(path.join(seqDir, d)).length]));

async function open() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', (e) => { throw e; });
  await page.addInitScript((c) => { window.SEQ_COUNTS = c; }, counts);
  await page.goto(`file://${path.join(TEASER, 'scenes/index.html')}`);
  await page.evaluate(() => window.ready);
  return { browser, page };
}

async function stills(page) {
  const out = path.join(TEASER, 'build/stills');
  fs.mkdirSync(out, { recursive: true });
  for (const [i, d] of scenes.entries()) {
    for (const f of [0.15, 0.5, 0.95]) {
      await page.evaluate(([n, t, dur]) => window.seek(n, t, dur), [i + 1, f * d, d]);
      await page.screenshot({ path: path.join(out, `s${i + 1}_${Math.round(f * 100)}.jpg`), type: 'jpeg', quality: 88 });
    }
  }
}

async function renderScene(page, n, d) {
  const file = path.join(TEASER, 'scenes', `scene_${String(n).padStart(2, '0')}.mp4`);
  const ffmpeg = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'png', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p', file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ffmpeg.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg ${c}`)))));
  const frames = Math.round(d * FPS);
  for (let i = 0; i < frames; i += 1) {
    await page.evaluate(([s, t, dur]) => window.seek(s, t, dur), [n, i / FPS, d]);
    const png = await page.screenshot({ type: 'png' });
    await new Promise((res, rej) => ffmpeg.stdin.write(png, (e) => (e ? rej(e) : res())));
  }
  ffmpeg.stdin.end();
  await done;
  console.log(`scene ${n}: ${frames} frames (${(frames / FPS).toFixed(2)} s)`);
}

(async () => {
  const args = process.argv.slice(2);
  const { browser, page } = await open();
  if (args.includes('--stills')) {
    await stills(page);
  } else {
    const wanted = args.length ? args.map(Number) : scenes.map((_, i) => i + 1);
    for (const n of wanted) await renderScene(page, n, scenes[n - 1]);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
