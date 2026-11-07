#!/usr/bin/env python3
"""Writes teaser/voice/scene_XX.wav from scene_XX.txt with Kokoro-82M, an open-source text-to-speech model.

Needs kokoro and soundfile installed outside the repo, on Python 3.12 or older. Run durations.py next.
"""
import pathlib

import numpy as np
import soundfile as sf
from kokoro import KPipeline

VOICE = pathlib.Path(__file__).resolve().parent.parent / "voice"
SPEAKER = "af_heart"
RATE = 24000
PEAK = 0.89  # -1 dBFS, applied as one gain across all scenes so their relative loudness stays as spoken.

pipeline = KPipeline(lang_code="a", repo_id="hexgrad/Kokoro-82M")
clips = {}
for txt in sorted(VOICE.glob("scene_*.txt")):
    parts = list(pipeline(txt.read_text().strip(), voice=SPEAKER, speed=1.0))
    clips[txt.stem] = np.concatenate([p.audio.numpy() for p in parts])
    print(txt.stem, f"{len(clips[txt.stem]) / RATE:.2f} s", " | ".join(p.phonemes for p in parts))

gain = PEAK / max(np.abs(c).max() for c in clips.values())
for name, clip in clips.items():
    sf.write(VOICE / f"{name}.wav", clip * gain, RATE, subtype="PCM_16")
