# Visual Overhaul V1 — iteration 1

Scope approved on2026-11-17: service corridor only. Architecture, composition, real shadows, PBR/GGX and credible environment reflections take priority. No second artistic iteration is authorized.

Reference: `docs/references/target-red-corridor.jpg` (review-only, never a runtime asset).

Baseline source: main7e967f0; runtime artifact unchanged from7164bff, SHA2565452f9efca7e83dc52dfb293522f297ff8172aab8df3491b04317160b9b68f2e.

Fixed hero camera: position[-2.35,1.72,27.5], target[-13.5,1.78,61], verticalFOV 64°. Seed15515657, scene time 12s, High, 1920×1080, DPR1. Baseline is captured with the same camera, not the old elevated view4 pose.

Evidence plan:
- `before-clean.png`, `before-hud.png`: old scene at the agreed camera.
- `before-view-{1,2,3,5,6}.png`: clean regression baseline for the other sectors.
- `after-clean.png`, `after-hud.png`: first candidate, actual WebGPU output.
- `after-view-{1,2,3,5,6}.png`: regression captures; inspect any differences against the scope of visible corridor geometry.
- `before-capture.json`, `after-capture.json`: build hashes, camera, rendering/presentation mode, adapter and errors.
- Reference comparison, independent review and test results added at closeout.

Hardware/native presentation acceptance remains BLOCKED until actual hardware verification. Static art direction is independently assessable from the real diagnostic images. Only Adrian can approve it; no technical PASS implies artistic acceptance.

## Delivery

Final artifact:105,761 raw / 34,927 gzip bytes; see `artifact-manifest.json`. Build/RunAllTests 15PASS, smoke 17PASS, fallback 3PASS. [Results](RESULTS.md), [independent review](INDEPENDENT-REVIEW.md), [reference comparison](comparison-reference.png), [before/after](comparison-baseline.png). Reference match FAIL; ART DIRECTION NOT ACCEPTED; GPU/temporal BLOCKED. STOP after iteration 1. No post-review artistic adjustment.
