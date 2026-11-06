# Phase 1: FINE teaser storyboard and script

**Length limit:** under 80 s (updated from 60 s). **Estimated length:** 75.9 s, from 187 spoken words at 150 wpm.
This is an estimate until real audio is measured. If it runs long, shorten scenes 2 and 7 first and never cut scene 6.

TTS input is in `teaser/voice/scene_XX.txt`. You will generate the audio yourself with an open-source model.

Timing rule: each scene lasts its narration + 0.4 s, and each 0.3 s crossfade overlaps inside that padding, so no
voice is overlapped. Total = narration + 1.1 s.

## Timeline

| # | Chip | Starts | Length | Spoken words |
|---|---|---:|---:|---:|
| 1 | 1. Motivation | 0:00.0 | 10.0 s | 24 |
| 2 | 2. Insight | 0:09.7 | 8.4 s | 20 |
| 3 | 3. Key idea | 0:17.8 | 4.8 s | 11 |
| 4 | 4. Explicit | 0:22.3 | 11.2 s | 27 |
| 5 | 5. Implicit | 0:33.2 | 12.8 s | 31 |
| 6 | 6. Deployment | 0:45.7 | 7.2 s | 17 |
| 7 | 7. Results | 0:52.6 | 15.2 s | 37 |
| 8 | 8. Real world | 1:07.5 | 8.4 s | 20 |
| | **End** | **1:15.9** | | **187** |

## Narration and visuals

### Scene 1: Motivation

> Vision-language navigation policies need a demonstration for every new route. Cut the demonstrations by thirty
> percent, and success drops by nearly twenty points.

- Title card overlays the first words: **FINE**, then the tagline "Explicit prediction. Implicit discrimination.
  Data-efficient navigation."
- `robot_1` plays as the backdrop. The clip is filmed from behind the robot, so the observation → action arrow starts
  from an onboard inset (frame 1 of `example.svg`), not from the clip.
- Bar animates **58.2 → 38.5**, labelled "InternVLA-N1 · R2R-CE · 70% budget", with **−19.7** beside it.

### Scene 2: Insight

> Yet each demonstration already shows the future: which landmark comes next, what it looks like, and its 3D structure.

- Six onboard frames from `example.svg`, in order. Frames 1, 3, 4 and 6 light up with their boxes as carton box, blue
  table, orange chair and green plant. Frames 2 and 5 have no landmark and stay grey.
- The instruction appears as live text, using the paper's wording, with each landmark coloured as its frame lights up.
- As "what it looks like" and "3D structure" are spoken, the appearance and geometry crops from the `example.svg` panel
  appear.

### Scene 3: Key idea

> FINE turns this future into a teacher, used only during training.

- The frame strip rises above a dashed line labelled **training only**.

### Scene 4: Explicit

> First: what should appear next? Explicit landmark tokens follow the instruction's ordered landmarks, and predict the
> future landmark region in semantic and 3D geometric feature space.

- Question shown as text: "What should appear next?"
- Landmark words highlight in order and become blue slot tokens.
- Your explicit training animation, retimed: SGAD → ŝ, ĝ compared against the f_enc and VGGT targets.

### Scene 5: Implicit

> Second: which future is consistent with the route? An implicit future token learns the future the route actually
> reaches, against same-scene hard negatives from a fine-tuned video world model.

- Question shown as text: "Which future is consistent with the route?"
- Your implicit training animation, retimed: the rollout diverges through a heading flip, and green z_t is pulled to y+
  and pushed from y−.
- Label by the world model: "Fine-tuned on R2R-CE · same-scene counterfactuals". The figure's flame stays.
- The figure shows the cross-episode negatives too; the voice names only the same-scene ones.

### Scene 6: Deployment

> At deployment, these branches are dropped: no future frames, no rollouts, and only five milliseconds of overhead.

- `FINE-Page-5.svg` is the overview: the explicit, implicit and world-model parts fade out, leaving VLM → action
  decoder. This needs a dark panel behind it, because its labels are white. If its parts cannot be separated cleanly,
  fall back to your explicit and implicit inference animations side by side.
- Badge: **+5 ms**.

### Scene 7: Results

> FINE raises success by 2.6 points on R2R-CE and 4.5 on RxR-CE. With seventy percent of the data, the gain is 6.8 points.

- Three bar pairs, baseline grey and FINE teal: **58.2 → 60.8**, **53.5 → 58.0**, **38.5 → 45.3**.
- "InternVLA-N1 · val-unseen SR" stays on screen, so the backbone is named without spending voice time on it.
- Takeaway callout on the third pair: "Recovers about 1/3 of the drop".

### Scene 8: Real world

> On a real humanoid, gains are largest with hidden landmarks: thirty success points, and twenty on room-to-room routes.

- `robot_1` excerpt labelled "Example run · 2×": about 0:22 to 0:38, passing the blue table. At 2× a scene this long
  shows at most 16.8 s, so it does not show the whole route.
- Numbers sit in a separate panel, not on the clip: **+30 SR · occluded landmarks (30 → 60)** and **+20 SR ·
  room-to-room (30 → 50)**, labelled "InternVLA-N1 + FINE · 100% data".
- End card overlays the last words: FINE · finevln.github.io · arXiv 2609.32855

## Fact check

Numbers checked against `static/fine.pdf`.

| On screen or spoken | Paper |
|---|---|
| 58.2 → 38.5, −19.7 | Tables I and IV; text gives "19.7-point SR drop" |
| 58.2 → 60.8 (+2.6) | Tables I, II and IV |
| 53.5 → 58.0 (+4.5) | Table II |
| 38.5 → 45.3 (+6.8), about 1/3 recovered | Tables I and IV; text gives "roughly one third" |
| World model fine-tuned on R2R-CE; hard negatives | Sec. IV-B, Implementation Details |
| 5 ms overhead | Sec. IV-A, Real-World Evaluation Setup |
| 30 → 60 (+30), occluded | Table III, Experiment 2, InternVLA-N1 at 100% |
| 30 → 50 (+20), room-to-room | Table III, Experiment 3, InternVLA-N1 at 100% |
| No future frames, no rollouts at deployment | Sec. III-D, Inference |
| Largest gains with occluded landmarks or multiple landmarks | Sec. IV-C, Real-world navigation |

## Changes from your draft

- **Scene 7:** the spoken backbone name moved to the screen, which saves about 5 spoken words.
- **Scene 8:** adds the room-to-room result, in line with the paper naming both conditions.
- **Scenes 4 and 5:** open with the fact sheet's two questions.
- **Scene 6:** adds "no future frames".
- **Scene 2:** the orange chair comes from `example.svg`, which shows it in frame 4.

## Decisions

1. **World model flame:** kept. The model is fine-tuned on R2R to generate hard negatives, so the flame stands.
2. **Scene 8 clip:** `robot_1`, per the plan. The author confirms the real-world test hides the landmark. The label
   stays "Example run" because its prompt says "turn right", while the paper describes prompts without directional cues.
3. **Instruction wording:** the paper's, "Then go to the orange chair and stop at the green plant at the end".
4. **Voiceover:** this project only supplies the text in `teaser/voice/`. The author generates the audio.

## Not part of this video, for you to check

`index.html` spells "cartoon box" in the real-world prompts where "carton box" appears to be meant.
