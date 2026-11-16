# PROJECT ECHO-9 — agent instructions

## Authorization and scope
- Issue #1 (`docs/ISSUE-1.md`) defines the approved implementation. The owner explicitly approved autonomous implementation, documentation, commit on `main`, and push in this session.
- Work only in this repository. Preserve user changes; no destructive Git operations or unrelated repositories. No additional prohibited paths were provided.
- Runtime: native WebGPU/WGSL, JavaScript, Web Audio; procedural assets only, no external runtime dependencies. Deliver one offline `index.html` plus readable sources.

## Workflow
- Coding: GPT-6.1 Sol, high reasoning. Implement the observatory first, then continuous service corridor and hangar, navigation, collisions, audio, quality presets, six views and deterministic 60-second fly-through.
- Independent visual critic receives only six 1920×1080 renders and a short flight recording, no source or author rationale. Iterate on defects above minor; preserve review evidence.
- Build and run `RunAllTests` (`npm run test:all`). Verify reproducibility, standalone output, seeded generation and helper behavior. Record actual browser smoke results.
- Never claim a visual/performance gate passed without rendered evidence and real measurements. Software WebGPU is useful for diagnostics but cannot establish hardware 60 FPS. Use PASS / FAIL / BLOCKED explicitly.
- Before delivery update this file, task status and QA documentation; commit on `main` and push. Leave unmet gates open and explain the next step.

## Status
- Repository started with README only; Issue #1 archived in `docs/ISSUE-1.md`.
- Implementation delivered with reproducible QA evidence; acceptance remains BLOCKED on native hardware/temporal verification. Reference GPU not selected. See `docs/TASK.md` and `docs/qa/RESULTS.md`.

## Implementation map and verified workflow
+- Sources: `src/math.js` (camera/route/collision), `geometry.js`, `scene.js`, `shaders.js`, `main.js`, template and styles. `scripts/build.mjs` embeds all runtime content into `index.html`.
+- Commands: `npm run build`; `npm run RunAllTests` / `npm run test:all`; `npm run qa`; `npm run qa:smoke`; `npm run qa:fallback`. Browser tools require Playwright and Chromium; use `CHROMIUM_PATH` to select an installed executable.
+- Server port: 4173. Avoid managed desktop ports 8000/8085 for new servers.
+- Final source build: 68,058 bytes raw, 24,346 bytes gzip; 10 correctness tests PASS. Do not confuse archive size with GPU memory or performance.
+- Independent critic has reviewed actual full-HD media in fresh context. Ring filtering, HUD contrast, stale flight labels and camera obstruction were addressed iteratively. Keep review history and source hashes in `docs/qa/`.
+- Cloud default adapter is unavailable; explicit SwiftShader is a fallback adapter. Native swapchain presentation fails even in a scene-independent minimal test. Explicit `?readback=1` shows actual offscreen WebGPU pixels with CPU copy overhead; it is diagnostic only. The shared desktop tool is unavailable.
+- Hardware/temporal acceptance remains BLOCKED. No 60 FPS claim is authorized by this evidence. Select a reference desktop GPU and repeat the native presentation, independent temporal review and 60-second benchmark before closing Issue #1.
+- Keep sparse GPU timestamp counts and actual presentation/render scale in reports. Route completion PASS does not imply visual/performance acceptance PASS.

## Visual Overhaul / Issue #2 — reference-first art direction
- Adrian rejected the initial cinematic look even though baseline software QA passed. The current stills are a TECHNICAL BASELINE, not accepted final art direction. Issue #1 remains open on hardware/temporal gates.
- Reference images are kept in `docs/references/` (see README there). They are review-only documentation assets and must never enter the runtime `index.html` build.
- For the approved first iteration, edit ONLY the cinematic service corridor hero shot. Before coding read the actual reference image; show a plan and wait for owner approval.
- The independent visual critic must receive both the target image and the rendered comparison, without source or author explanation. Technical image defect severity alone is NOT an artistic acceptance gate.
- Do not expand to observatory/hangar overhaul without Adrian's explicit acceptance of the corridor render. Prioritize visual quality over the optional 100 KB target. Keep procedural WebGPU/WGSL and no runtime assets unless Adrian separately approves a change.
- Retain hardware 60 FPS and temporal gates as BLOCKED until measured on a reference GPU. Perform build, RunAllTests, QA documentation, AGENTS/task updates and push for approved source changes.
