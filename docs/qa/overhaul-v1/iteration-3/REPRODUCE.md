# Reproduce iteration 3 evidence

Use the repository on `main` at the delivered commit, Node/npm, Python with Pillow/NumPy, Playwright1.62.1 and Chromium. Keep previous QA folders intact. This environment uses Chrome151 at `/home/agent/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`; select another installation through `CHROMIUM_PATH`.

```sh
npm install
npm run build
npm run RunAllTests
python3 -m http.server 4173
```

Run browser jobs serially, especially on a software adapter. Choose a new output folder when preserving delivered evidence. `QA_DIR` selects overhaul output; smoke/fallback use `QA_OUT`.

```sh
QA_OUT=/tmp/echo9-smoke.json npm run qa:smoke
QA_OUT=/tmp/echo9-fallback.json npm run qa:fallback
node scripts/iteration3-tone-probe.mjs
npm run qa:overhaul
node scripts/iteration3-final-ab.mjs
node scripts/overhaul-ablations.mjs
QA_DIR=docs/qa/overhaul-v1/iteration-3/route node scripts/browser-qa.mjs --software --readback --benchmark --route-only
python3 scripts/overhaul-regressions.py
python3 scripts/overhaul-lighting-analysis.py
python3 scripts/iteration3-image-details.py
node scripts/overhaul-comparison.mjs
node scripts/iteration3-evidence-layout.mjs
```

The default QA scripts target iteration3; running them again overwrites its generated evidence. Override the output directory or copy the evidence first. Comparison/crop tools need the supplied before/checkpoint files, and the regression tool requires the source/PNG-hash-bound scope review for the changed visible corridor in view6. Inspect any new differences; do not reuse a PASS against different hashes.

For P0 reproduction, inspect script environment options and [DIAGNOSIS](p0/DIAGNOSIS.md). Standalone exact before-instrumented, P0-only and materials-only HTML sources are gzip-archived in `p0/` and `checkpoints/`, with source identity records. Serve each frozen HTML as the artifact under test; do not roll back or reset the active checkout. Match each GPU capture with its corresponding mesh JSON and source SHA before running analysis. The final capture's optional `ECHO_SHADOW_SAMPLES` reads `p0/mesh-after.json` and copies actual depth texels for those receiver coordinates. The final production light table differs from the P0-only table, so its verification uses the final table and captured maps.

All delivered images are actual1920×1080 WebGPU frames (or explicitly labeled extracted crops/documentation layouts). Fixed hero:[−2.35,1.72,27.5]→[−13.5,1.78,61], verticalFOV64°, seed15515657, t12s, High/DPR1/4×MSAA. A/B grade changes only final transfer; detail-AA comparison retains the AA-on cached probe. See [ablation scope](ABLATION-SCOPE.md) for inherited feature-switch limits.

The route collector's `--route-only` avoids duplicating the five regression poses and corridor hero captured separately. It runs the full wall-clock route and waits for a fresh goal frame after CPU completion. This is functional software verification, not a smooth hardware recording. Native hardware follow-up must use default swapchain presentation, a named physical reference GPU and independent temporal review; those acceptance gates remain BLOCKED here.
