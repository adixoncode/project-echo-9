# Phase4B camera study

Gate1 only: compare four cameras on exact4A geometry, production shaders/materials/lights, corrected red fixture, atmosphere and final transfer. No artistic scene changes have begun. Baseline commit: `d51f4f55a3c1eeb753bda92e518ec2700db8d1ac`.

`src/main.js` now accepts an explicit `setCameraShot({position,target,verticalFovDegrees})`. Projection and screen-ray tangents derive from the same vertical FOV. Original six saved poses and route remain unchanged; `setView()` and `startFlythrough()` restore the historical64degree default.

1. `npm run test:all`
2. `QA_DIR=docs/qa/overhaul-v1/iteration-4b/camera-study NEUTRAL_DIR=/tmp/echo9-4b-neutral node scripts/iteration4a-neutral.mjs`
3. Serve repository on4173, `/tmp/echo9-4b-neutral` on4174.
4. `node scripts/iteration4b-camera-clearance.mjs`
5. `node scripts/iteration4b-camera-study.mjs`
6. `python3 scripts/iteration4b-camera-images.py`

Captures are actual native WebGPU/WGSL offscreen pixels, Chromium151 on SwiftShader, FullHD1920x1080, High/DPR1/4MSAA, fixed time12 and seed15515657. This is software diagnostic evidence; hardware GPU/60FPS/native temporal gates remain BLOCKED. Capture metadata includes source/served artifact SHA, actual state, rendering report, browser errors, external requests and FOV reset checks.

Neutral is a separate derived HTML, never the production pipeline: uniform gray rough nonmetal, white versions of the same lights with identical positions/powers/cones/shadows, no material detail/IBL/emission, small hemisphere ambient, fog and bloom disabled. Source archive and geometry hashes bind it to unchanged4A geometry.

`source/` is an exact readable study snapshot; `production-source.html.gz` and `neutral-source.html.gz` retain both standalone capture artifacts. `source-provenance.json` compares every archived source with4A. `image-provenance.json` records unaltered thumbnails and exact historicalA RGB comparisons. `camera-clearance.json` measures each eye against actual double-sided corridor mesh with0.45m required radius.

Await independent image-only review and parent camera selection before geometry/material/light edits. No commit/push from implementation agent.
