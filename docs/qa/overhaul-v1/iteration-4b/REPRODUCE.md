# Reproduce phase4B

The selected runtime is the already-reviewed round2/C2 image, with a named shot and provenance access. Round3 was rejected. Do not overwrite historical evidence when repeating QA; use a separate checkout/output directory.

## Selected offline scene

Build with `npm run build`, then open `index.html?shot=4b&quality=High&clean=1&test=1` in a WebGPU-capable browser. A local server is convenient:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://localhost:4173/index.html?shot=4b&quality=High&clean=1&test=1`. `test=1` fixes time at12s; seed is15515657. Use1920×1080 CSS pixels, DPR1, High/4×MSAA. The selected camera is[-1.2,1.72,25.6] toward[-13,1.76,62], vertical FOV52°. Omitting `clean=1` shows the HUD. Original `?view=4` remains the historical64° hero; views1–6 and flight remain unchanged.

This Cloud used explicit `&readback=1` and SwiftShader because native swapchain presentation is unavailable. That path displays actual offscreen WebGPU pixels with CPU copy overhead. It cannot establish hardware FPS or temporal acceptance. Normal deployment uses the native swapchain by default.

## Technical verification

```sh
npm run build
npm run RunAllTests
mkdir -p /tmp/echo9-4b-repeat
export CHROMIUM_PATH=/home/agent/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome
QA_OUT=/tmp/echo9-4b-repeat/smoke.json npm run qa:smoke
QA_OUT=/tmp/echo9-4b-repeat/fallback.json npm run qa:fallback
QA_DIR=/tmp/echo9-4b-repeat node scripts/overhaul-qa.mjs
QA_DIR=/tmp/echo9-4b-repeat node scripts/browser-qa.mjs --software --readback --benchmark --route-only
QA_DIR=/tmp/echo9-4b-repeat QA_VARIANTS='[["no-atmosphere","shot=4b&fog=0"],["no-bloom","shot=4b&bloom=0"]]' node scripts/overhaul-ablations.mjs
```

Run browser jobs serially. The flight collector runs the full wall-clock route and waits for a freshly presented t60goal. Its software measurements are functional evidence only. `overhaul-qa` captures the five other-sector views and the original hero, verifies served HTML SHA, and reads actual HDR buffers. Pass `ECHO_SHADOW_SAMPLES=docs/qa/overhaul-v1/iteration-3/p0/mesh-before.json` to collect the fixed world-space P0 receivers too; historical pixel labels are not new camera coordinates.

For pixel regression, copy4A `after-view-{1,2,3,5,6}.png` to the repeat directory as `before-view-*`, and4A `after-clean.png` as `before-clean.png`. Set `QA_DIR` for `python3 scripts/overhaul-regressions.py`. Any changed sector pixels require fresh image/scope classification, tied to actual before/after hashes and current HTML. Do not reuse a stale scope approval.

## Candidate and neutral reconstruction

Each camera-study/round/selected directory contains readable source snapshots, source provenance, exact production HTML gzip, neutral HTML gzip, capture state and image hashes. Decompress an archived HTML into a separate directory and serve it to reproduce that candidate. Do not replace the current repository runtime merely to view old evidence.

The stage-specific capture scripts are under `scripts/iteration4b-*`. Their stage output paths are intentionally fixed for provenance; run them only in a separate copy when reproducing historical stages. Camera coordinates and FOV are in each `capture.json`. The camera-study archive contains all four unchanged-scene alternatives, their neutral counterparts and exact4A comparison.

`scripts/iteration4a-neutral.mjs` derives a separate QA-only neutral HTML; choose `QA_DIR` and `NEUTRAL_DIR` explicitly. Gray rough materials, white directional lights, real shadows and a small ambient reveal mass; detail/IBL/emission/fog/bloom are disabled. It does not modify production. Runtime position/normal hashes establish geometry identity. The selected neutral must reproduce the preserved round2 neutral exactly.

Round3's old-light diagnostic is made by `scripts/iteration4b-round3-old-lights.mjs` from its archived source/artifact. It freezes the final mesh before changing renderer light inputs; all visible vertex/surface data is identical. The old/final illumination comparison was rejected and is not the selected runtime. See the [technical report](TECHNICAL-REPORT.md) and [independent addendum](round-3/LIGHTING-REVIEW.md).

Comparison PNGs are unretouched source images resized/cropped/placed with labels.320px thumbnails are320×180. Reference remains review-only and is never loaded by the standalone HTML. Existing shader attribution remains in `THIRD_PARTY_NOTICES.md` and generated HTML.

**STOP after the three-round handoff. ART DIRECTION:NOT ACCEPTED; hardware GPU/60FPS/native temporal:BLOCKED.**
