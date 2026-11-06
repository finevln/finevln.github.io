#!/usr/bin/env python3
"""Writes teaser/durations.json: each scene lasts its narration + 0.4 s.

Uses teaser/voice/scene_XX.wav when all eight exist, otherwise estimates from the text at 150 wpm.
"""
import json
import pathlib
import subprocess

TEASER = pathlib.Path(__file__).resolve().parent.parent
VOICE = TEASER / "voice"
SCENES = range(1, 9)
PAD = 0.4
WORDS_PER_SECOND = 150 / 60


def audio_seconds(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout)


wavs = [VOICE / f"scene_{n:02d}.wav" for n in SCENES]
if all(w.exists() for w in wavs):
    source = "audio"
    narration = [audio_seconds(w) for w in wavs]
else:
    source = "estimate_150wpm"
    texts = [(VOICE / f"scene_{n:02d}.txt").read_text() for n in SCENES]
    narration = [len(t.replace("-", " ").split()) / WORDS_PER_SECOND for t in texts]

scenes = [round(n + PAD, 3) for n in narration]
total = sum(scenes) - 0.3 * (len(scenes) - 1)
(TEASER / "durations.json").write_text(json.dumps(
    {"source": source, "narration": [round(n, 3) for n in narration], "scenes": scenes, "total": round(total, 3)}, indent=2) + "\n")
print(source, scenes, "total", round(total, 2))
