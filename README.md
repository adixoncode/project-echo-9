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

The QA collector requires Playwright and uses `/usr/bin/chromium` by default. Override `CHROMIUM_PATH` and `ECHO_URL` for another local installation. It writes six 1920×1080 images, browser diagnostics, adapter identity and timing results to `docs/qa/`. `?view=1&quality=High&test=1` selects a reproducible view with the menu hidden. The application exposes `window.echo9` for inspection: `setView(1..6)`, `setTime(seconds)`, `setQuality(name)`, `startFlythrough()`, `stopFlythrough()`, `getState()` and `getReport()`.

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

Known artistic simplifications: analytic local contact darkening and procedural light pools rather than shadow maps or physically traced reflections; suspended geometry and dust move subtly, without a rigid-body physics simulation. See the independent visual review for remaining minor findings and the required hardware follow-up.
