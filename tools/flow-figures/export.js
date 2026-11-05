#!/usr/bin/env node
// Exports each animated figure and mode to static/videos/<output>_<mode>.{mp4,webm} at 1080p, 30 fps.
// Steps the page's animation frame by frame, so timing is exact however slow the capture is.
//
// Usage (needs ffmpeg with libx264 and libvpx-vp9; install Playwright outside the repo):
//   NODE_PATH=<dir>/node_modules node tools/flow-figures/export.js implicit
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const FPS = 30;
const LEAD_IN = 0.5; // seconds on the first frame
const HOLD_END = 2; // seconds on the final state
const OUTPUTS = { implicit: { name: 'implicit_state', modes: ['training', 'inference'] } };
const ENCODERS = {
  mp4: ['-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'],
  webm: ['-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0', '-pix_fmt', 'yuv420p', '-row-mt', '1', '-cpu-used', '2'],
};

function encoder(file, args) {
  const ffmpeg = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'png', '-framerate', String(FPS), '-i', '-', '-r', String(FPS), ...args, file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((resolve, reject) => ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}: ${file}`)))));
  return { stdin: ffmpeg.stdin, done };
}

const writeFrame = (stream, frame) => new Promise((resolve, reject) => stream.write(frame, (err) => (err ? reject(err) : resolve())));

/* Serves the repo through Playwright, because the page fetches its SVG and that needs http. */
async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'no-preference' });
  await page.route('http://fine.local/**', (route) => {
    const file = path.join(ROOT, new URL(route.request().url()).pathname);
    return route.fulfill(fs.existsSync(file) ? { path: file } : { status: 404 });
  });
  await page.goto('http://fine.local/index.html', { waitUntil: 'load' });
  await page.waitForFunction(() => window.FlowFigures);
  await page.evaluate(() => window.FlowFigures.ready);
  return page;
}

(async () => {
  const name = process.argv[2];
  const output = OUTPUTS[name];
  if (!output) throw new Error(`Usage: export.js <${Object.keys(OUTPUTS).join('|')}>`);
  const browser = await chromium.launch();
  const page = await openPage(browser);
  // Show only this figure, centred on a white frame.
  await page.evaluate((figure) => {
    const host = document.querySelector(`[data-flow-figure="${figure}"]`);
    window.FlowFigures.get(figure).freeze();
    document.body.replaceChildren(host);
    document.body.style.cssText = 'margin:0;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;background:#fff';
    host.style.cssText = 'width:1800px;margin:0';
    host.querySelector('.flow-replay').style.display = 'none';
    host.querySelector('.flow-controls').style.cssText = 'zoom:1.6;margin-bottom:1.5rem';
  }, name);
  await page.evaluate(() => document.fonts.ready);

  for (const mode of output.modes) {
    const base = path.join(ROOT, 'static/videos', `${output.name}_${mode}`);
    const encoders = Object.entries(ENCODERS).map(([ext, args]) => encoder(`${base}.${ext}`, args));
    const duration = await page.evaluate(([figure, m]) => {
      const fig = window.FlowFigures.get(figure);
      fig.setMode(m, { play: false });
      return fig.plan.duration;
    }, [name, mode]);
    const frames = Math.ceil((LEAD_IN + duration + HOLD_END) * FPS);
    for (let i = 0; i < frames; i += 1) {
      const t = Math.min(duration, Math.max(0, i / FPS - LEAD_IN));
      await page.evaluate(([figure, at]) => window.FlowFigures.get(figure).render(at), [name, t]);
      const frame = await page.screenshot({ type: 'png' });
      await Promise.all(encoders.map((e) => writeFrame(e.stdin, frame)));
    }
    encoders.forEach((e) => e.stdin.end());
    await Promise.all(encoders.map((e) => e.done));
    console.log(`${output.name}_${mode}: ${frames} frames (${(frames / FPS).toFixed(1)} s)`);
  }
  await browser.close();
})().catch((err) => { console.error(err); process.exit(1); });
