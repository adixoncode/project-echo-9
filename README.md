# PROJECT ECHO-9

An abandoned orbital research station above a ringed gas giant. Original procedural geometry, materials, lighting and synthesized audio, rendered with native WebGPU/WGSL. No runtime libraries, models, textures, fonts or network services.

## Run

Open the standalone [`index.html`](index.html) in desktop Chrome/Edge with WebGPU, or serve the repository locally:

```sh
npm install
npm run build
python3 -m http.server 4173
```

Visit `http://localhost:4173`. WebGPU requires a secure context (localhost or HTTPS); local-file support depends on the browser. The built HTML contains the entire application and needs no connection after download. If the browser cannot provide WebGPU, the application displays a diagnostic message.

## Explore

- WASD: horizontal movement; mouse: look after clicking into the scene.
- Q / E: descend / ascend; Shift: faster movement.
- Esc: release pointer lock and menu. 1–6: saved camera views.
- M: synthesized ambience / mute; H: performance display.
- Menu: Low / Medium / High quality and the deterministic 60-second flight.

The observatory, service corridor and hangar form one continuous space. Camera collision covers floors, major walls and obstacles. This is an exploration scene, without combat or missions.

## Reproduce verification

```sh
npm run build
npm run test:all
# With a local server on port 4173 and Chromium installed:
node scripts/browser-qa.mjs --benchmark --video
# Diagnostic software rendering, explicitly excluded from hardware acceptance:
node scripts/browser-qa.mjs --software --readback --benchmark --video
```

The QA collector requires Playwright and uses `/usr/bin/chromium` by default. Override `CHROMIUM_PATH` and `ECHO_URL` for another local installation, and `QA_DIR` to keep a new evidence run separate. It writes six 1920×1080 images, browser diagnostics, adapter identity and timing results to `docs/qa/`. `?view=1&quality=High&test=1` selects a reproducible view with the menu hidden. The application exposes `window.echo9` for inspection: `setView(1..6)`, `setTime(seconds)`, `setQuality(name)`, `startFlythrough()`, `stopFlythrough()`, `getState()` and `getReport()`.

## Acceptance and evidence

See [task status](docs/TASK.md), [verification plan](docs/qa/TEST-PLAN.md), and the complete approved scope archived in [Issue #1](docs/ISSUE-1.md). Results and limitations must be read alongside the images: software WebGPU diagnostics do not establish the hardware 60 FPS target. The reference desktop GPU has not yet been selected.

## Rendering and diagnostics

`src/math.js`, `geometry.js`, `scene.js`, `shaders.js` and `main.js` remain readable; `scripts/build.mjs` embeds them with the HTML/CSS without a runtime loader. High uses native-resolution 4× MSAA; Medium keeps native resolution with 1× sampling; Low explicitly uses 0.7 render scale and fewer particles/effects. The diagnostic report includes actual pixel dimensions, scale, geometry counts and estimated allocation sizes.

The managed cloud browser cannot present even a minimal WebGPU swapchain clear. `scripts/gpu-presentation-probe.mjs --software` reproduces this independently of the scene. An explicit `?readback=1` mode renders the same WebGPU pipelines into an offscreen GPU texture, copies actual pixels through a preallocated buffer and presents them using 2D ImageData. This supports image inspection in that environment. Its GPU copy, mapping, BGRA conversion and CPU upload are included in frame times; it is unsuitable for establishing normal presentation performance. The default application uses the native WebGPU swapchain and checks the first submission for failure.

For the bundled test browser:

```sh
npx playwright install chromium ffmpeg
# Set CHROMIUM_PATH to the installed Chrome/Chromium executable if needed.
npm run qa:fallback
npm run qa:smoke
node scripts/gpu-presentation-probe.mjs --software
```

Known artistic simplifications in the original observatory/hangar: analytic local contact darkening and procedural light pools rather than shadow maps or physically traced reflections; suspended geometry and dust move subtly, without a rigid-body physics simulation. See the independent visual review for remaining minor findings and the required hardware follow-up.

## Visual Overhaul — corridor iterations

Issue #2 adds a corridor-only first candidate. Use saved view4, or open `http://localhost:4173/index.html?view=4&quality=High`; append `&clean=1` for the HUD-free view. The default start remains in the original observatory. The primary art reference in `docs/references/target-red-corridor.jpg` is documentation only and is never loaded by the application.

The corridor has independent procedural geometry and RNG, beveled structural profiles, swept round pipes, recessed floor grates, two cached 2048² geometric shadow maps and GGX materials. Environment reflections come from six HDR views of the actual procedural room, filtered into an 8-level local cubemap and sampled with room-box parallax correction. These resources are generated by native WebGPU at startup; no external environment image is used. `&shadows=0` and `&probe=0` are diagnostic feature-off switches for the same candidate.

`npm run qa:overhaul` captures the fixed 1920×1080 corridor and the other-sector regression views. `node scripts/overhaul-ablations.mjs` captures feature-off diagnostics; `python3 scripts/overhaul-regressions.py` compares actual pixels using Pillow/NumPy; `node scripts/overhaul-comparison.mjs` produces the documentation comparison layouts. See `docs/qa/overhaul-v1/iteration-1/` for source hashes, renders, test logs and independent reference-relative review. `QA_OUT` redirects the existing smoke/fallback reports without overwriting the original Issue #1 evidence.

Adrian approved iteration 2, “Cinematic Lighting & HDR Overhaul”, on 2026-11-17. Scope remains the service corridor, with the original hero camera, seed, time and route. Art direction remains NOT ACCEPTED until Adrian evaluates the new candidate. Iteration 3 and observatory/hangar overhaul require separate approval. Hardware/native presentation and 60 FPS gates remain BLOCKED; software readback pictures support static analysis only.

The first corridor candidate improves architectural complexity but **fails reference-relative artistic review** because its lighting is too dark and shadows/reflections lack visual clarity. Technical checks passing does not approve the look. See the [independent review](docs/qa/overhaul-v1/iteration-1/INDEPENDENT-REVIEW.md). That review is preserved as historical evidence; the owner subsequently authorized iteration 2.


## Corridor iteration 2 — HDR lighting

The approved second iteration keeps the corridor camera/seed/route and other sectors, while moving corridor lighting and reflection through linear RGBA16F, shadowed scattering, bright-only bloom and one final exposure/filmic/gamma pass. The original sectors retain their display output through a shared-depth spatial bypass. Seven authored lights drive fixtures, direct shading, cached shadows, the room probe and scattering from one table. Receiver-plane PCF corrects false self-shadowing on sloped panels.

`&fog=0` and `&bloom=0` join the existing shadow/probe diagnostic switches. `window.echo9.getHdrDiagnostics()` performs an on-demand readback of actual HDR buffers; it is not part of normal frame timing. `QA_DIR` selects a separate output directory for browser/overhaul QA; `QA_OUT` selects smoke/fallback report paths.

Historical iteration2 images, source hashes, staged diagnostics, tests, approximations and independent review are in [iteration 2 results](docs/qa/overhaul-v1/iteration-2/RESULTS.md). Its stop was subsequently superseded only by Adrian's explicit iteration3 approval in Issue #3. Native performance and smoothness remain BLOCKED; neither iteration is accepted art until Adrian approves.

## Corridor iteration 3 — materials, red-light continuity and depth

Issue #3 authorizes this corridor-only candidate. A near-emitter mounting ear clipped by the shadow camera caused the abrupt red-wall boundary; the physical fixture correction preserves genuine occlusion. Six procedural surface families add edge/joint wear, footprint filtering and GGX specular AA. Restrained relighting, source-path atmospheric extinction and an AgX final transfer refine the candidate without changing camera/route or other-sector content.

Actual FullHD clean/HUD images, matched P0 crops, same-light material stages, AgX/detail-AA A/B, pixel regressions and independent reference-relative review are in [iteration3 results](docs/qa/overhaul-v1/iteration-3/RESULTS.md). See [technical limits](docs/qa/overhaul-v1/iteration-3/TECHNICAL-REPORT.md), [reproduction](docs/qa/overhaul-v1/iteration-3/REPRODUCE.md) and [third-party attribution](THIRD_PARTY_NOTICES.md). The standalone artifact is140,511 raw /45,417 gzip bytes. Diagnostic `&grade=legacy` and `&detailAA=0` support static comparisons; inherited feature switches have [explicit cached-contribution limits](docs/qa/overhaul-v1/iteration-3/ABLATION-SCOPE.md).

**ART DIRECTION: NOT ACCEPTED. Hardware GPU /60FPS /native temporal acceptance: BLOCKED.** Technical checks and software renders do not imply portfolio-quality art or hardware performance. STOP after this reviewed candidate; no iteration4 or other-sector overhaul without Adrian's separate approval. Issue #1 remains open.
