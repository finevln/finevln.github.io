# Phase 0: FOCA teaser analysis and FINE style spec

Reference: https://focavla.github.io/assets/teaser.mp4 (page: https://focavla.github.io/). It was only analysed; no copy
is kept here. Use structure, pacing and layout only; none of its footage, graphics or text.

## Technical facts

| Property | Measured |
|---|---|
| Duration | 142.3 s |
| Video | H.264, 2940×1912, 60 fps, 22 MB |
| Slide area | 16:9, about 2938×1652, with black bars baked in (82 px top, about 47 px bottom at 1470 wide) |
| Audio | AAC 48 kHz stereo, nearly mono; -10.5 LUFS, peaks about 0 dB |
| Subtitles | 3 soft tracks: one empty, two near-identical; none burned in |
| Speech rate | 152 wpm (294 words over 115.8 s of usable cues) |

It is a screen recording of a slide deck. The cursor, recording dot, page numbers and phone home indicator are all
visible. Do not borrow those.

## Chapters

| # | Chip | Start | End | Length | Share | Beats inside the chapter |
|---|---|---|---|---|---:|---|
| 1 | Motivation | 0:00.0 | 0:23.1 | 23.1 s | 16% | Results and cost; new slide at 13.9 s poses the question; callout at 20.0 s |
| 2 | Stress Test of Existing VLA Models | 0:23.1 | 0:40.8 | 17.7 s | 12% | Results table, marks build, then a question callout |
| 3 | Key Observation | 0:40.8 | 0:48.3 | 7.5 s | 5% | Statement panel, frame strip, callout |
| 4 | FOCA (method) | 0:48.3 | 1:37.6 | 49.3 s | 35% | Full figure; explicit at 61.65 s; implicit at 82.1 s |
| 5 | Learning from Synthetic Videos | 1:37.6 | 1:59.1 | 21.5 s | 15% | Prior method compared with FOCA |
| 6 | Reinforcement learning perspective | 1:59.1 | 2:22.3 | 23.2 s | 16% | Left-to-right flow plus takeaway callout |

Scene detection at the plan's 0.3 threshold found only 13.9, 40.8 and 97.6 s. The others came from a 0.06 threshold
(23.1, 48.3, 61.65, 82.1) and a targeted 0.01 pass (119.1).

## Style

**Layout.** White slide, chapter title top-left, then one idea per slide. Figures fill the width, or the lower part
with bullets above when a method part is being explained. Rounded outlined panels group content. Tinted callout bars
carry the takeaway: red for problems, orange for conclusions. Flows read left to right with grey arrows.

**Typography** (estimated from frames, scaled to 1920 wide).

| Role | Size | Style |
|---|---|---|
| Chapter chip | about 40 px | Bold serif, navy, at about x 18, y 50 |
| Body | about 40 px | Serif, with bold for emphasis |
| Callout | about 32 px | Bold, with one coloured phrase |
| Figure labels | about 26 px | Sans or serif |

**Colour** (sampled, ±8 per channel). Navy chip `#085090`; panel and icon blue `#0058D8`; success green `#20A818`;
callout orange `#F89800` on `#F8F0E8`; near-white slide background with black text.

**Text entry and exit.** Elements appear by slide build, effectively instantly: the 20.0 s callout completes within
about 0.05 s. Nothing exits on its own; text leaves when the slide cuts.

**Transitions.** Hard cuts at the 23.1 and 48.3 s boundaries checked frame by frame, with no fades seen.

**Sync.** Slides lead the narration by about 0.2 to 0.9 s, measured against subtitle times at 23.1, 40.8, 48.3, 97.6
and 119.1 s, and the 20.0 s callout leads by about 0.8 s.

**Narration and music.** There is narration throughout. Only 2 pauses fall below -30 dB in the whole video, and the
spectrum shows steady low-level energy between words. That could be a quiet music bed, room noise or processing. This
comes from measurement only, because I cannot listen to the audio; please confirm by ear if it matters.

**Letterboxing.** Baked in as a side effect of the recording, not a design choice.

**Numbers.** Shown in a static results table, with red outlines and arrows marking the drops and the method's own row
in yellow and bold. No charts or counters.

**Known defect.** One subtitle cue spans 53.55 to 78.83 s and holds only three words, so about 25 s of narration has no
usable timing. It is excluded from the speech rate.

## Proposed style spec for FINE

**Keep from the reference:** numbered top-left chips, white slides, one idea per scene, left-to-right flows, tinted
takeaway callouts, visuals leading the voice slightly.

**Change:** clean 1920×1080 with no bars or recording artefacts, 0.3 s crossfades (your plan), short text entrances,
animated bars for numbers, and much larger text, because this must read on a phone.

**Fonts** (from the site). Google Sans for chips, titles and numbers; Noto Sans for body and captions. The site only
requests the regular weight, so I would save the font files locally for rendering, so frames do not depend on the network.

**Colours.** From `static/images/flow/*.svg`, `flow-figures.js`, `ui-enhance.css` and `bulma.min.css`.

| Use | Fill | Stroke or text |
|---|---|---|
| Context tokens (pink) | `#F8CECC` | `#B85450` |
| Implicit (green) | `#D5E8D4` | `#82B366`, dark text `#336600` |
| Explicit (blue) | `#DAE8FC` | `#6C8EBF` |
| Negatives | | `#990000` |
| Animated token inside your figures | | `#E8590C` |
| Chips and FINE result bars (site accent) | | `#0E7490` |
| Baseline bars | `#B3B3B3` | |
| Body text on white `#FFFFFF` | | `#4A4A4A` |

**Type scale at 1920×1080.** A 375 px phone shows the video at 0.195×, so the reference's 40 px text becomes under 8 px.

| Role | Size | At 375 px |
|---|---|---|
| Result numbers and badges | 96 px or more | about 19 px |
| Title | 88 px | about 17 px |
| Chip | 44 px | about 9 px |
| Overlay text and burned-in captions | 56 px | about 11 px |

**Grid.** 80 px side margins. Chip at top-left (80, 48). Content from y 130 to y 850. The bottom band, y 860 to 1040,
stays clear for captions.

**Motion.** Text fades in with a 12 px rise over 0.25 s, about 0.3 s ahead of the matching words. Bars grow over 0.6 s
and numbers appear as the bars finish. Elements leave only through the scene crossfade.

## Issues to settle before later phases

Update: the length limit is now under 80 s, and `static/images/example.svg` supplies the orange chair and scene 2 frames.
Items 1 to 3 and 6 below are superseded by `teaser/script.md`.

1. **The script runs long.** Spoken out, it is about 157 words, or about 63 s at 150 wpm, against the 58 s limit.
   Scene 7 is the main cause: numbers and acronyms take it to about 40 spoken words (about 16 s against its 9 s slot).
   The other seven scenes total about 47 s. These are estimates until Phase 2 measures them. Scene budgets also add up
   to 59 s. Phase 1 would shorten scenes 7 and 2 as your plan says.
2. **The 60 s limit depends on how crossfades work.** Adding 0.4 s per scene adds 3.2 s, so 58 s of narration would
   reach 61.2 s. If each 0.3 s crossfade overlaps inside that padding, total length is narration + 1.1 s, or 59.1 s, and
   no voice overlaps. I propose this.
3. **Orange chair.** Scene 2 uses it, but your `robot_1` list does not include it. I have not yet checked the clips.
   Phase 1 needs either a clip that shows it or a change to the strip.
4. **No overview animation exists.** Scene 6 asks for one in inference mode, but the repo only animates `explicit` and
   `implicit`, each with an inference mode; `overview.png` is static. I propose showing those two inference animations
   side by side instead of drawing anything new.
5. **Figure timing.** Exports run 13.0 s (explicit) and 14.6 s (implicit), including lead-in and end hold, against 10 s
   scenes. `tools/flow-figures/export.js` already steps frames, so I would reuse its approach and retime the figures,
   using GSAP only for new overlays.
6. **Scene 8 footage.** `robot_1` is 120.5 s long (1280×720, 29.97 fps). A 5 s scene at up to 2× shows at most 10 s of
   it, so it cannot show the whole route. I would use an excerpt, not imply a full run.
7. **"Readable at 375 px".** Labels inside your existing figures will not be readable at that size. I propose applying
   this check to chips, overlays, numbers and captions only, with those carrying the key message.
8. **Missing inputs and tools.** Plan placeholders are unfilled: the paper and figure `<path>` values, and the TTS
   provider, voice and key. No ElevenLabs or OpenAI key is set in this environment. Playwright and whisperX are not
   installed.
