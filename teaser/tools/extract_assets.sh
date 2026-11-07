#!/usr/bin/env bash
# Prepares teaser/build/: figure crops and frame sequences from the site's own figures and videos.
# Needs Playwright outside the repo: NODE_PATH=<dir>/node_modules bash teaser/tools/extract_assets.sh
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT=..
mkdir -p build/img build/seq build/fonts

font() { # Google Fonts family, output. Listing the glyphs returns one file; the plain latin subset has no arrow.
  local css
  css=$(curl -sfG -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" "https://fonts.googleapis.com/css2" \
    --data-urlencode "family=$1:wght@400..700" --data-urlencode "text=$(printf '%s' ' !"#$%&'"'"'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~·×−→“”‘’–—')")
  curl -sf -o "build/fonts/$2" "$(grep -oE 'https://[^)]+' <<<"$css" | head -1)"
}
font "Google Sans" GoogleSans.woff2
font "Noto Sans" NotoSans.woff2

raster() { # svg, output, width, height, scale
  node -e "
    const { chromium } = require('playwright');
    (async () => {
      const b = await chromium.launch();
      const p = await b.newPage({ viewport: { width: $3, height: $4 }, deviceScaleFactor: $5 });
      await p.goto('file://' + require('path').resolve('$1'));
      await p.waitForTimeout(1500);
      await p.screenshot({ path: '$2' });
      await b.close();
    })();"
}
raster "$ROOT/static/images/example.svg" build/img/example.png 746 886 4
raster "$ROOT/static/images/FINE-Page-5.svg" build/img/page5.png 730 410 3

crop() { # name x y w h, in example.png pixels
  ffmpeg -v error -y -i build/img/example.png -vf "crop=$4:$5:$2:$3" "build/img/$1.png"
}
crop f1 72 1258 895 558
crop f2 1043 1258 895 558
crop f3 2013 1258 895 558
crop f4 72 1978 895 558
crop f5 1043 1993 895 558
crop f6 2013 1993 895 558

# The small panels are rendered from the SVG at 10x, because a crop of the 4x render looks soft when enlarged.
node -e "
  const { chromium } = require('playwright');
  (async () => {
    const b = await chromium.launch();
    const p = await b.newPage({ viewport: { width: 746, height: 886 }, deviceScaleFactor: 10 });
    await p.goto('file://' + require('path').resolve('$ROOT/static/images/example.svg'));
    await p.waitForTimeout(2500);
    const c = { region: [32, 791.25, 107.25, 49.25], appear: [185.75, 781.25, 66, 32], geom: [185.75, 827.25, 66, 32] };
    for (const [n, [x, y, width, height]] of Object.entries(c)) await p.screenshot({ path: 'build/img/' + n + '.png', clip: { x, y, width, height } });
    await b.close();
  })();"

seq() { # name, input, filter, optional input args
  rm -rf "build/seq/$1"; mkdir -p "build/seq/$1"
  ffmpeg -v error -y ${4:-} -i "$2" -vf "$3" -q:v 2 "build/seq/$1/%04d.jpg"
  echo "$1: $(ls "build/seq/$1" | wc -l | tr -d ' ') frames"
}
V="$ROOT/static/videos"
seq explicit "$V/explicit_landmark_training.mp4" "crop=1920:580:0:270"
seq implicit "$V/implicit_state_training.mp4" "crop=1920:560:0:310"
seq robot_a "$V/real/robot_1.mp4" "fps=30,scale=1280:720" "-ss 0 -t 14"
seq robot_b "$V/real/robot_1.mp4" "setpts=0.5*PTS,fps=30,scale=1280:720" "-ss 22 -t 22"
