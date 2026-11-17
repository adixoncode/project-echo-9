# Reproducing iteration 2 evidence

Serve the repository on port 4173. Install the locked development dependencies and a WebGPU-capable Chromium. `CHROMIUM_PATH` selects the executable; the captured diagnostics use Chrome for Testing 151 with explicit SwiftShader and CPU readback. These flags do not establish hardware acceptance.

```sh
npm ci
npm run build
npm run RunAllTests
QA_DIR=docs/qa/overhaul-v1/iteration-2 npm run qa:overhaul
QA_DIR=docs/qa/overhaul-v1/iteration-2 node scripts/overhaul-ablations.mjs
QA_OUT=docs/qa/overhaul-v1/iteration-2/smoke-report.json npm run qa:smoke
QA_OUT=docs/qa/overhaul-v1/iteration-2/fallback-report.json npm run qa:fallback
QA_DIR=docs/qa/overhaul-v1/iteration-2/route node scripts/browser-qa.mjs --software --readback --benchmark
QA_DIR=docs/qa/overhaul-v1/iteration-2 python3 scripts/overhaul-regressions.py
QA_DIR=docs/qa/overhaul-v1/iteration-2 python3 scripts/overhaul-lighting-analysis.py
QA_DIR=docs/qa/overhaul-v1/iteration-2 node scripts/overhaul-comparison.mjs
```

Use a separate `QA_DIR` when experimenting so committed evidence remains intact. The source hash in each capture identifies the exact HTML tested. The standalone offline-file check is part of smoke QA; runtime assets must not be fetched.

The scope review is bound to the final HTML and exact before/after image hashes. Raw pixel differences default to BLOCKED and require inspection; a current source hash alone never blesses an unrelated image. Regional and global display-luminance measurements are descriptive only, not art similarity scores. Feature-off images establish pixel contributions, not artistic success.

The route collector runs the full 60 seconds of wall-clock flight and records sampled state plus its completion report. With software rendering/readback, sparse frames and timing include CPU copy overhead; route completion PASS cannot pass visual smoothness or hardware FPS gates. Repeat native presentation on an agreed physical GPU for those gates.

The construction-stage sources are archived as gzip-compressed standalone HTML under `checkpoints/`. Decompress each into a local served directory and set `ECHO_URL`, `ECHO_ARTIFACT`, `QA_TAG=hdr` or `relit`, and `QA_DIR` when using `scripts/overhaul-qa.mjs --hero-only`. Preserve the flags recorded in stage metadata. Image comparisons use actual image files in an HTML layout; they never repaint the scene or modify exposure after capture.
