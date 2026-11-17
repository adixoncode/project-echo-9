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
+- Baseline Issue #1 build: 68,058 bytes raw, 24,346 bytes gzip; 10 correctness tests PASS. Do not confuse archive size with GPU memory or performance.
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

## Issue #2 — approved iteration 1, 2026-11-17
- Owner approved ONLY the first corridor iteration in this session. Prioritize architecture, composition, directional lighting and actual geometric shadows. PBR/GGX must include credible procedural-room environment reflections.
- Preserve observatory/hangar geometry, materials, lighting, controls and the existing route. Use independent corridor generation and scoped rendering; do not conceal changes by swapping geometry at a camera threshold.
- Produce actual 1920×1080 HUD and clean renders, reference comparison and an independent reference-relative review. The reviewer receives target image and actual render, no code or author rationale.
- Run build, RunAllTests and other-sector regressions. Preserve previous evidence. Save this iteration under `docs/qa/overhaul-v1/iteration-1/`.
- Technical debugging within iteration 1 is allowed. After the first candidate's independent review, report and STOP; no second artistic iteration without explicit owner approval. ART DIRECTION remains NOT ACCEPTED until Adrian approves the result.
- Keep unverified native/hardware GPU gates BLOCKED. Approved closeout includes documentation/AGENTS/task updates and commit/push on main; leave Issue #1 open.


## Issue #2 iteration 1 closeout
- Candidate: 105,761 raw bytes /34,927 gzip; 15 RunAllTests, 17 browser smoke and 3 fallback checks PASS. See `docs/qa/overhaul-v1/iteration-1/RESULTS.md` and exact artifact manifest.
- Three observatory poses and hangar view5 are pixel-identical to baseline. View6 differs only in the visible corridor entrance; outside that region hangar pixels and all legacy geometry/material/RNG data remain unchanged.
- Independent GPT-6 Astra media-only reference review found meaningful architectural improvement but reference match FAIL: critical under-lighting/hierarchy and major visible shadow/reflection shortcomings. ART DIRECTION remains NOT ACCEPTED pending owner evaluation.
- Do not conflate technically functioning shadow maps/local HDR probe with artistic success. No source art changes follow that review. STOP: iteration 2 is NOT authorized; wait for Adrian's assessment.
- Hardware/native and temporal acceptance remain BLOCKED; Issue #1 stays open. Source changes on main are the first candidate, not approved final art.

## Issue #2 — owner authorization for iteration 2, 2026-11-17
- Adrian explicitly approved **Iteration 2: Cinematic Lighting & HDR Overhaul** on 2026-11-17 after comparing target and iteration-1 renders and reviewing the existing Abyssal Garden WebGPU rendering approach. The previous historical STOP after iteration 1 is now lifted **only for iteration 2**. The first render remains ART DIRECTION NOT ACCEPTED.
- Implement only the approved corridor scope in the current Issue #2 section "Iteracja 2 — ZATWIERDZONA". Use native WebGPU/WGSL, procedural assets, one offline HTML; no Three.js, Blender/GLB/texture assets or change of other sectors. Honor original camera/seed/time and deterministic flight.
- P0: linear HDR scene/composite and one final tone mapping/exposure; purposeful cool first-frame illumination and vivid red depth, real associated shadows/reflectance. P1: depth-aware light-linked fog/scattering, believable colored metal-floor reflections, subtle HDR bloom; only necessary geometry fixes. Check the independent critic's iteration-1 findings.
- Never globally brighten other sectors or hide changes by camera-threshold switching. Keep observatory/hangar content and legacy behavior stable, compare regression images, run all build/RunAllTests/smoke/fallback checks and record genuine QA evidence under `docs/qa/overhaul-v1/iteration-2/`. Reference images remain documentation-only; 100 KB remains optional. Hardware FPS and native temporal tests remain BLOCKED without physical GPU.
- After one actual iteration-2 candidate and independent reference-relative media-only review, update AGENTS/QA/Issue, commit and push to main and **STOP for Adrian's artistic assessment**. Do not start iteration 3 or overhaul other sectors without separate approval. The current approval is for implementation and review only, not artistic sign-off.

### Iteration 2 execution
- User reconfirmed implementation, build/RunAllTests/browser/reference comparison/independent review, documentation and Issue #2 update, main commit and push. The historical iteration1 STOP is superseded only for iteration2.
- Preserve exact approved hero camera/seed/time. Save real HDR-only, relighting and final diagnostics under `docs/qa/overhaul-v1/iteration-2/`. Do not overwrite iteration1 evidence.
- Final review must be independent of implementation/advisory work and receive only target plus actual final clean/HUD media. After presenting that candidate, STOP before iteration3; artist acceptance remains Adrian's decision.


## Issue #2 iteration 2 closeout — 2026-11-17
- The original Cloud workspace was recovered with uncommitted work intact. A verified local snapshot/diff is kept under `.git/echo9-recovery/`; no resets, source reconstruction or artistic edits were performed during recovery.
- Final HTML: 128,893 raw / 41,027 gzip bytes; source identity is recorded in `artifact-manifest.json`.
- Authoritative final HTML SHA256: `8d0da9eb540d3373eee1a33fecd49381d46e64c797afb6dd28c0c76ebe8a3e08`. Source and generated HTML match; 35 source/script/test/package/index files remain byte-identical to the recovered snapshot.
- Explicit build and RunAllTests 24/24, smoke 17/17, fallback 3/3, five sector rechecks, clean/HUD rechecks and four feature-off diagnostics PASS. Final recovery reports are under `docs/qa/overhaul-v1/iteration-2/verification/`; earlier reports/failures remain historical evidence.
- Fresh images are pixel-identical to the preserved candidate. Views1/2/3/5 are also identical to iteration1; view6 changes only within the visible corridor doorway/MSAA edge. Legacy geometry/material/RNG, six poses, hero camera and full route are unchanged.
- Independent GPT-6 Astra received only reference and final actual clean/HUD media: reference-match FAIL, five major and three minor findings, no critical defect. Main gaps: smooth materials, broad white/red blocks, repetitive structure, depth and shadow modelling. ART DIRECTION: NOT ACCEPTED until Adrian approves. No source art changes follow that review.
- Software route completion PASS (63.2297s, 12 frames) is functional only. Hardware GPU / 60 FPS / native temporal acceptance remain BLOCKED; Issue #1 stays open. Issue #2 remains open for owner review.
- Approved closeout is documentation/AGENTS/Issue update, main commit and push. STOP after delivery: iteration3, further artistic revisions and other-sector overhaul are not authorized.

## Issue #3 — owner authorization for iteration 3, 2026-11-17
- Adrian explicitly approved iteration3 in Issue #3 and the current chat. This supersedes the historical iteration2 STOP only for the approved corridor scope. No iteration4 or other-sector overhaul is authorized.
- First prove the cause of the abrupt left-wall red-light edge with actual fixed-camera renders, world-space receiver/light/visibility/cone/frustum measurements and shadow/light/atmosphere diagnostics. Correct the proven cause, preserve real cast occlusion and add continuity/occluder regression evidence; do not globally bypass shadows or conceal it with gain/blur.
- Then implement surface-specific, structurally motivated procedural metals, footprint filtering/specular AA, restrained cinematic lighting and atmospheric depth. Evaluate selected Noniv/web-ocean principles via actual A/B images; preserve MIT attribution for any copied substantial code. Do not import unrelated ocean/sky simulation or runtime assets.
- Coding uses GPT-6.1 Sol high reasoning. A separate GPT-6 Astra reviewer receives only the target and final actual clean/HUD images, without code or author explanation. After the first reviewed candidate STOP for Adrian; ART DIRECTION remains NOT ACCEPTED until he accepts.
- Lock the existing hero camera/FOV, seed15515657, time12s, High/DPR1/4xMSAA/1920x1080. Preserve observatory/hangar content and pixel behavior, all six poses, route, RNG, controls and collision. Keep native WebGPU/WGSL and standalone offline HTML.
- Save new evidence under `docs/qa/overhaul-v1/iteration-3/`; preserve prior iterations. Complete build, green RunAllTests, browser smoke/fallback, sector regressions, actual feature/crop comparisons, QA/AGENTS/Issue #3 update, main commit and push. Hardware GPU/60FPS/temporal gates stay BLOCKED without physical verification; leave Issue #1 open.

## Issue #3 iteration 3 closeout — 2026-11-17
- Final standalone HTML SHA256:`8e6cec19966228ee8f5a0ec4b39b9a7a7d22be85237e4d5a89b521c38091d281`,140,511 raw /45,417 gzip bytes. Preserve this reviewed candidate; no further source/art changes after review.
- P0 actual GPU depth/ray diagnostics prove a pendant mounting ear crossing the emission aperture and straddling the0.15m shadow near plane caused the old red-wall edge. Repositioning its mounting above the diffuser removes that false boundary, while actual final shadow maps retain real handle/panel occlusion. See matched same-mode crops, source archives and diagnosis under iteration3/p0; earlier mismatched context zooms are explicitly not controlled comparisons.
- Six surface-specific procedural families/structural wear, footprint/specular AA, restrained corridor relighting, source-path atmospheric extinction and AgX final transfer are implemented. Substantial upstream AgX adaptation retains Noniv/web-ocean MIT attribution in source, built HTML and THIRD_PARTY_NOTICES. No runtime assets/dependencies added.
- Build/reproducibility, RunAllTests27/27, smoke17/17, fallback3/3, production-transfer calibration, final P0 depth check, four feature-off images and exact restore/default A/B PASS. Same-light P0/material stages and actual final1920×1080 clean/HUD, closeups/comparisons are archived. Switch scopes/cached probe limitations are explicit in ABLATION-SCOPE.md.
- Other-sector views1/2/3/5 are pixel-identical to iteration2; view6 differs56,351pixels only in the visible corridor doorway/MSAA edge, bbox[1520,409,1795,644]. Legacy geometry/material/RNG, six poses, route and collision remain unchanged. Functional route PASS62.4579s/13software frame samples, with a freshly presented t60goal frame and no errors/external requests. This is not a hardware or smooth-motion result.
- Fresh independent GPT-6 Astra/high reviewed only target plus actual final clean/HUD media: reference-match FAIL,0critical/4major/3minor. Remaining gaps: too-clean materials, schematic structure, light hierarchy/angular glow, weaker atmospheric depth. The specific P0 correction does not imply all light transitions are artistically accepted. ART DIRECTION: NOT ACCEPTED until Adrian approves.
- Hardware GPU /60FPS /native temporal acceptance remain BLOCKED. Issue #1 stays open; Issue #3 stays open for owner assessment. Authorized closeout is documentation/Issue update, main commit/push. **STOP after this reviewed candidate. No iteration4, further art revision or other-sector overhaul without Adrian's separate approval.**

## Issue #4 — owner authorization for phase 4A, 2026-11-17
- Adrian explicitly approved Issue #4 and instructed implementation in the current chat. Historical iteration3 STOP is superseded only for this corridor set-design/geometry phase. No phase4B materials/lighting overhaul, iteration5 or other-sector overhaul is authorized.
- Read Issues1–4, this file, iteration3 evidence and actual target/baseline images before geometry edits. Save an image-first large/middle/negative-space breakdown and3–5 thumbnail art criteria under `docs/qa/overhaul-v1/iteration-4a/`.
- Rebuild nearest2–3 meaningful bays with massive layered octagonal pressure frames, real recesses and functional asymmetric services. Reduce dominant thin ceiling bars, oversized pipe bundles and repetitive floor stripes; preserve a credible open far transition. Keep traversable continuous world geometry, real occlusion and route/camera clearance; no camera-threshold scene swaps.
- Preserve production material shaders, HDR/AgX, light table, atmosphere and the red-emitter aperture correction. Only necessary local integration fixes are allowed and must be documented. A separately identified true neutral diagnostic is allowed for geometry review; do not pass it off as the production lighting result.
- Lock canonical hero/seed/time/High/DPR1/4xMSAA/1920x1080 and all saved poses/flight. Preserve observatory/hangar mesh, lights/materials/RNG and pixels except visible corridor geometry in adjacent views. Native procedural WebGPU/WGSL and one offline HTML remain required.
- Coding: GPT-6.1 Sol/high. After technical QA, a fresh independent GPT-6 Astra critic receives only actual reference and neutral/production clean/HUD images, no source or author rationale. Assess geometry/composition separately from remaining material/light polish. Owner acceptance remains Adrian's decision.
- Deliver actual FullHD neutral+production clean/HUD, iteration3/reference comparisons,320px thumbnails and near/mid/far crops. Run build, green RunAllTests, smoke/fallback, six-view/sector regression, actual route/collision checks. Update QA/AGENTS/Issue4/task, commit main/push and verify remote SHA/HTML identity. Keep hardware GPU/60FPS/temporal BLOCKED until measured. Preserve historical evidence.
- **STOP after the first independently reviewed4A candidate for Adrian. Do not start4B or another artistic revision without his separate approval.**

## Issue #4 phase4A closeout — 2026-11-17
- Reviewed production HTML SHA256:`872c37fff35e4e273b78c6f55a237df655396660c269ca8e56520fbbe155b412`,149,436raw /48,619gzip bytes. Runtime changes only `src/corridor.js`; all13locked renderer/material/light/HDR/legacy/control/style/template sources and corrected emitter housing block are byte-identical to iteration3. No camera/seed/pose/route change, no4B shader or lighting overhaul.
- Three layered octagonal thresholds, recessed service pockets and a connected pump/valve landmark, quieter near ceiling/floor and set-back supply runs are implemented as continuous procedural geometry.112,204corridor /143,698drawn architecture triangles;15,988fewer than iteration3. Resident legacy VBO retains7,464deliberately undrawn old-corridor triangles; distinguish resident counts from submitted architecture. Geometry/surface GPU buffers shrink3,837,120bytes; persistent GPU estimate268,368,208bytes is not measured VRAM/peak.
- Root found an upper-shoulder manual-collision gap after initial30-test QA; preserved superseded source/images/results. Local conservative shoulder/soffit AABBs fixed it without changing rendered geometry. Final31/31tests, smoke17/17, fallback3/3 and all pixel/identity checks PASS.1187manual cases explicitly distinguish whole-mesh exact cases from changed-frame sampling; retained small overhead-fitting collision simplifications remain. All7final FullHD frames are RGB-identical across the collider-only repair.
- Actual-mesh route sampling4801points plus analytic Catmull speed bound gives0.6943m conservative continuous clearance for0.45m camera; canonical hero1.2687m. Actual full route functional PASS65.8483s/13software frame samples and freshly presented t60goal, no errors/external requests. Hardware GPU/60FPS/native temporal remain BLOCKED.
- Final production/neutral1920×1080 clean/HUD, iteration3/reference/HUD comparisons,320px thumbnails and raw near/middle/far crops are under iteration-4a. Separate neutral diagnostic HTML records explicit gray rough nonmetallic/white-light/no-fog overrides and matching runtime geometry hashes; it never changes the production pipeline. Four unaffected-sector views are pixel-identical; view6 changes29,644pixels only in the visible corridor doorway, bbox[1521,410,1794,641].
- Fresh independent GPT-6 Astra/high received only7reference/actual final/thumbnail images. **GEOMETRY FAIL, COMPOSITION FAIL; basic depth PASS with limitations.0critical/3major/2minor.** Remaining major issues: dead right foreground mass, uneven large/middle hierarchy and unreadable distant passage at320px. Geometry construction/test success does not override that image verdict. ART DIRECTION remains NOT ACCEPTED pending Adrian.
- No application/art edits after this first final review. Authorized closeout is QA/AGENTS/Issue4/task update, main commit/push and remote SHA/HTML verification. Keep Issue #1 and Issue #4 open. **STOP for Adrian; no4B, another art pass or other-sector overhaul without separate approval.**
