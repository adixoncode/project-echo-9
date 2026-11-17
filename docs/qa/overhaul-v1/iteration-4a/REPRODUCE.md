# Reproduce phase4A evidence

Use the delivered main commit, Node/npm, Python with Pillow/NumPy and Playwright1.62.1. Actual Cloud verification uses Chrome151 at `/home/agent/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`. Override `CHROMIUM_PATH` for your installation. Browser jobs run serially; software rendering is expensive.

```sh
npm install
npm run build
npm run RunAllTests
python3 -m http.server 4173
```

In another terminal, create the separate neutral artifact and serve its directory:

```sh
node scripts/iteration4a-neutral.mjs
python3 -m http.server 4180 --directory /tmp/echo9-4a-neutral
```

The following are the delivered verification commands. **They overwrite generated4A evidence at their default paths.** Choose a new `QA_DIR`/`QA_OUT` to preserve the delivery, and copy the supplied before/checkpoint inputs when reproducing comparisons. No reset or checkout rollback is needed.

```sh
QA_OUT=/tmp/echo9-4a-smoke.json npm run qa:smoke
QA_OUT=/tmp/echo9-4a-fallback.json npm run qa:fallback
QA_DIR=docs/qa/overhaul-v1/iteration-4a node scripts/overhaul-qa.mjs
QA_DIR=docs/qa/overhaul-v1/iteration-4a QA_TAG=neutral ECHO_ARTIFACT=/tmp/echo9-4a-neutral/index.html ECHO_URL='http://localhost:4180/index.html?test=1&readback=1&view=4&quality=High&clean=1&fog=0&bloom=0' node scripts/overhaul-qa.mjs --hero-only
QA_DIR=docs/qa/overhaul-v1/iteration-4a/route node scripts/browser-qa.mjs --software --readback --benchmark --route-only
python3 scripts/overhaul-regressions.py
python3 scripts/iteration4a-image-details.py
node scripts/iteration4a-comparison.mjs
```

All final captures use1920×1080, High, DPR1,4×MSAA, seed15515657, t12s and the canonical hero. The collector verifies the SHA of the actual served HTML, waits for fresh presented frames, records actual state/adapter/HDR and rejects errors or external requests. Neutral capture also exposes runtime position/normal and surface-stream hashes to prove the production geometry is unchanged by the diagnostic. Its material/light overrides are explicit in [neutral-source.json](neutral-source.json); archived diagnostic HTML is gzip-compressed beside it. Production HTML remains `index.html`.

`scripts/iteration4a-clearance.mjs` independently reports distance to actual corridor triangles; it is CPU diagnostic geometry, not a substitute for rendered images. `tests/iteration4a-geometry.test.mjs` includes route/saved-camera clearance, annular thickness/void/occlusion and the upper-frame collision regression. The1187manual cases consist of two exact mirrored discovered points checked against the entire corridor,1050shoulder and135soffit cases checked against the changed frame mesh. Existing small-fitting collision simplifications are documented in [construction history](construction/HISTORY.md). Do not infer all-position, exact triangle-based interactive collision from these tests.

The route collector's `--route-only` reuses the independently captured six views rather than duplicating them. It runs the full60-second wall-clock flight and waits for a fresh presented goal frame. It remains functional software verification, with CPU readback overhead and sparse frames. Native hardware/60FPS/temporal acceptance requires a named physical reference GPU and default swapchain presentation; it is BLOCKED in this Cloud environment.

Four unchanged-sector images must be exactly identical. Differences in adjacent view6 need source/PNG-hash-bound manual classification against the visible corridor, never a broad generic tolerance. Reclassify any new hashes or changed bounds. Neutral/production closeups are raw same-pixel crops;320px thumbnails use only declared resampling, without retouching. Independent geometry/composition judgment and Adrian's art acceptance are separate from every technical check. STOP before4B.
