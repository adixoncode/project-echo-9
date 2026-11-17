# Iteration 2 — Cinematic Lighting & HDR Overhaul

**ART DIRECTION: NOT ACCEPTED. Hardware GPU / 60 FPS / temporal acceptance: BLOCKED. STOP before iteration 3.**

See [results](RESULTS.md), the [independent reference-relative review](INDEPENDENT-REVIEW.md), [clean render](after-clean.png), [HUD](after-hud.png), [reference comparison](comparison-reference.png) and [before/after comparison](comparison-baseline.png). The review found five major and three minor artistic differences; technical verification does not approve the look.

The approved scope is corridor lighting, HDR, material response and atmosphere, with targeted fixture changes only. No observatory/hangar overhaul or iteration 3 is authorized. Implementation began from authorization commit `dc39774`; its runtime baseline is `308807a`, 105,761 raw / 34,927 gzip bytes, artifact SHA256 `aeb80e7100df3c58c4e916426285f6140c3b2e49882edc85972f43ffd7277db6`. The `before-*` images and baseline metadata are exact copies of matching iteration-1 actual captures, not newly generated or retouched images.

The final HTML is 128,893 raw / 41,027 gzip bytes, SHA256 `8d0da9eb540d3373eee1a33fecd49381d46e64c797afb6dd28c0c76ebe8a3e08`. Fixed state: seed 15515657, time 12 s, position [-2.35,1.72,27.5], target [-13.5,1.78,61], vertical FOV 64°, High, DPR 1, 4× MSAA, 1920×1080. The target JPEG is documentation only.

Actual [construction checkpoints](checkpoints/README.md) show HDR-only → relighting → final atmosphere/reflections/bloom. Source archives, numeric HDR readback and capture metadata preserve provenance. The independent reviewer received only the reference and final clean/HUD images, without source or author rationale. No artistic source changes followed the review.

The original Cloud environment was recovered with its uncommitted files intact. Fresh results are under [verification/](verification/README.md); their exact image comparisons establish continuity with the reviewed candidate. Earlier root smoke/fallback reports and technical failures remain historical evidence. Use the verification reports for final closeout.

See [reproduction commands](REPRODUCE.md) and [pipeline/approximation notes](HDR-PIPELINE.md). Software offscreen readback supports static correctness checks; it cannot establish native performance or smoothness. Owner artistic acceptance remains Adrian's decision.
