#!/usr/bin/env python3
"""Joins teaser/scenes/scene_XX.mp4 with 0.3 s crossfades, writes captions, and outputs teaser/out/.

Adds the voice track when all eight teaser/voice/scene_XX.wav files exist; otherwise the videos are silent.
Without audio the caption timing is an estimate, spread across each scene in proportion to its text.
"""
import json
import pathlib
import re
import subprocess
import textwrap

TEASER = pathlib.Path(__file__).resolve().parent.parent
OUT = TEASER / "out"
XFADE = 0.3
ENCODE = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart"]

# On-screen spelling. The text-to-speech spelling lives in teaser/voice/scene_XX.txt.
DISPLAY = [
    "Vision-language navigation policies need a demonstration for every new route. Cut the demonstrations by 30%, and success drops by nearly 20 points.",
    "Yet each demonstration already shows the future: which landmark comes next, what it looks like, and its 3D structure.",
    "FINE turns this future into a teacher, used only during training.",
    "First: what should appear next? Explicit landmark tokens follow the instruction's ordered landmarks, and predict the future landmark region in semantic and 3D geometric feature space.",
    "Second: which future is consistent with the route? An implicit future token learns the future the route actually reaches, against same-scene hard negatives from a fine-tuned video world model.",
    "At deployment, these branches are dropped: no future frames, no rollouts, and only 5 milliseconds of overhead.",
    "FINE raises success by 2.6 points on R2R-CE and 4.5 on RxR-CE. With 70% of the data, the gain is 6.8 points.",
    "On a real humanoid, gains are largest with hidden landmarks: 30 success points, and 20 on room-to-room routes.",
]


def run(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *map(str, args)], check=True, cwd=TEASER)


def stamp(t, sep):
    h, rest = divmod(t, 3600)
    m, s = divmod(rest, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d}{sep}{int(round((s % 1) * 1000)) % 1000:03d}"


def cues_for(text):
    """Splits text into cues of at most two lines of 42 characters, breaking at sentences and clauses where possible."""
    wrap = lambda s: textwrap.wrap(s, 42, break_on_hyphens=False)
    groups, current = [], ""
    for clause in re.split(r"(?<=[.,:?])\s+", text):
        joined = f"{current} {clause}".strip()
        if current and (current[-1] in ".?" or len(wrap(joined)) > 2):
            groups.append(current)
            current = clause
        else:
            current = joined
    groups.append(current)
    cues = []
    for group in groups:
        lines = wrap(group)
        cues += [lines[i:i + 2] for i in range(0, len(lines), 2)]
    return cues


def build_cues(narration, starts):
    cues = []
    for text, length, start in zip(DISPLAY, narration, starts):
        groups = cues_for(text)
        total = sum(len(" ".join(g)) for g in groups)
        at = start
        for group in groups:
            span = length * len(" ".join(group)) / total
            cues.append((at, at + span, group))
            at += span
    return cues


def write_captions(cues):
    srt = [f"{i}\n{stamp(a, ',')} --> {stamp(b, ',')}\n" + "\n".join(g) + "\n" for i, (a, b, g) in enumerate(cues, 1)]
    (OUT / "teaser.srt").write_text("\n".join(srt))
    vtt = [f"{stamp(a, '.')} --> {stamp(b, '.')}\n" + "\n".join(g) + "\n" for a, b, g in cues]
    (OUT / "teaser.vtt").write_text("WEBVTT\n\n" + "\n".join(vtt))
    head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV
Style: Cap,Noto Sans,70,&H00FFFFFF,&H50000000,&H50000000,0,3,12,0,2,80,80,44

[Events]
Format: Layer, Start, End, Style, Text
"""
    def ass(t):
        h, rest = divmod(t, 3600)
        m, s = divmod(rest, 60)
        return f"{int(h)}:{int(m):02d}:{s:05.2f}"
    line_break = chr(92) + "N"
    events = [f"Dialogue: 0,{ass(a)},{ass(b)},Cap,{line_break.join(g)}" for a, b, g in cues]
    (TEASER / "build/teaser.ass").write_text(head + "\n".join(events) + "\n")


def main():
    OUT.mkdir(exist_ok=True)
    data = json.loads((TEASER / "durations.json").read_text())
    scenes = data["scenes"]
    starts = [sum(scenes[:i]) - XFADE * i for i in range(len(scenes))]
    write_captions(build_cues(data["narration"], starts))

    inputs = []
    for i in range(len(scenes)):
        inputs += ["-i", f"scenes/scene_{i + 1:02d}.mp4"]
    chain, last = [], "0:v"
    for i in range(1, len(scenes)):
        chain.append(f"[{last}][{i}:v]xfade=transition=fade:duration={XFADE}:offset={starts[i]:.3f}[v{i}]")
        last = f"v{i}"
    voiced = data["source"] == "audio"
    audio_args, maps = [], ["-map", f"[{last}]"]
    if voiced:
        for i in range(len(scenes)):
            audio_args += ["-i", f"voice/scene_{i + 1:02d}.wav"]
        for i, start in enumerate(starts):
            chain.append(f"[{len(scenes) + i}:a]adelay={int(start * 1000)}:all=1[a{i}]")
        chain.append("".join(f"[a{i}]" for i in range(len(scenes))) + f"amix=inputs={len(scenes)}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[voice]")
        maps += ["-map", "[voice]", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2"]
    run(*inputs, *audio_args, "-filter_complex", ";".join(chain), *maps, *ENCODE, "out/FINE_teaser.mp4")

    audio_copy = ["-c:a", "copy"] if voiced else []
    run("-i", "out/FINE_teaser.mp4", "-vf", "ass=build/teaser.ass:fontsdir=build/fonts", *ENCODE, *audio_copy, "out/FINE_teaser_subbed.mp4")
    run("-ss", "1.5", "-i", "out/FINE_teaser.mp4", "-frames:v", "1", "-q:v", "2", "out/poster.jpg")


main()
