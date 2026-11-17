# PROJECT ECHO-9 — Iteracja 3: Filmic Materials, Red-Light Continuity & Atmospheric Depth

**Status: APPROVED FOR IMPLEMENTATION by Adrian, 2026-11-17. ART DIRECTION: NOT ACCEPTED until Adrian reviews real renders.**

Adrian reviewed the real iteration-2 images, explicitly approved the next corridor-only art pass (materials → lighting → atmospheric depth), pointed out an abrupt red-light discontinuity in the left corridor wall, and approved drawing suitable techniques from [Noniv/web-ocean](https://github.com/Noniv/web-ocean). This **supersedes the previous iteration-2 STOP only for this iteration 3**. It is *not* advance acceptance of the artwork or authorization for iteration 4.

Baseline: [main 56b0255](https://github.com/adixoncode/project-echo-9/commit/56b0255e8b97ff3ac8458317e381202fc7e9fdb3), [clean](https://github.com/adixoncode/project-echo-9/blob/main/docs/qa/overhaul-v1/iteration-2/after-clean.png), [reference comparison](https://github.com/adixoncode/project-echo-9/blob/main/docs/qa/overhaul-v1/iteration-2/comparison-reference.png), [independent review](https://github.com/adixoncode/project-echo-9/blob/main/docs/qa/overhaul-v1/iteration-2/INDEPENDENT-REVIEW.md), [Issue #2](https://github.com/adixoncode/project-echo-9/issues/2). The target remains `docs/references/target-red-corridor.jpg`.

## Guardrails / scope

- **Only** cinematic service corridor; preserve observatory/hangar pixel behavior, other-sector geometry/material/RNG, controls, six views, route/collision. No change of engine, no Three.js, external textures/GLB or runtime network requests. Keep native WebGPU/WGSL and one offline `index.html` with readable sources.
- Prefer convincing filmic realism to the optional 100KB size goal. Do not mask problems with a generated image or replacement still.
- Same baseline camera **[-2.35,1.72,27.5] → [-13.5,1.78,61]**, vertical FOV64°, seed15515657, t=12s, High, DPR1, 4×MSAA, 1920×1080. Keep this locked for fair comparisons.
- Before editing read `AGENTS.md`, Issue #1/#2/#3, actual reference & iteration2 media and QA. Record this new explicit scope authorization in AGENTS during implementation, not by silently ignoring historical STOP text.
- Implement via **GPT-6.1 Sol high reasoning**; after the first actual candidate have a **separate GPT-6 Astra critic** assess *only* target image and actual clean/HUD media, with no code/author rationale.

## P0 — diagnose and fix discontinuous red light

Adrian spotted an **abrupt transition between vivid red and virtually unlit material** on the left wall. Treat this as a potential light/shadow/volume boundary defect and reproduce it before touching its appearance.

Relevant code evidence:
- `src/corridor-lights.js` `geometricShadow` returns **0 visibility** outside shadow-camera UV/depth coverage. This is a credible *hypothesis* for false hard boundaries, **not a proven root cause**. The same file applies `smoothstep` cones and finite range fades.
- `src/corridor-post-shaders.js` performs half-res shadow-linked scattering within a bounded ray segment; real occlusion or medium boundaries may also explain an edge.

Required diagnostic:
1. Capture original 1920×1080 crop and locate edge in world space, identify affected receiver and influencing lights, measure its source radiance / cone / visibility / receiver shadow UV-depth / fog contribution.
2. Repeat same camera with targeted shadow-off, relevant emitter only, atmosphere-off and/or shadow coverage visualization. Determine whether the edge comes from an actual physical occluder, shadow-map frustum/lookup, falloff/cone, depth/composition or atmosphere.
3. Correct the *proven* cause. Preserve real cast shadows and intended contrast; no global `return 1`, blur, gain tweak, screen-space paint, or hidden camera-threshold substitution without a defensible test.
4. Add a regression test/diagnostic showing a continuous physically plausible falloff on an unoccluded receiver while a genuine occluder still blocks light. Save before/after same-pixel crop and technical explanation.

## P1 — materials that react to light like real used metal

- Implement **surface-specific** procedural material families: painted and worn metal, dark steel/alloy, brushed tubing, grates and rubber/cables. Keep metalness/roughness energy behavior credible; preserve actual geometry.
- Make wear **structurally motivated**, not random color noise: chipped edges, grime in recessed joints, streaks, varied direction of brushing, irregular fine normal/roughness. Provide coarse-to-fine scales and different responses under identical lights.
- Preserve stable appearance at distance: filter high-frequency normal/roughness/detail by pixel footprint, use specular anti-aliasing (derivatives / local slope variance or equivalent) and suitable mips to suppress shimmering / moiré. Be mindful of dominant bright bars on grates and continuous white stripes on pipes.
- Add close-up image comparisons for wall, pipes and floor under the same light, not just a full-frame image.

## P1 — filmic lighting, grading and natural depth

- Keep an intentional cool near-key and warm red depth, **but remove large near-white and solid-red blocks** competing with one another. Design localized sources and believable bounce/reflections rather than increasing exposure globally.
- Preserve shadow geometry; ensure receiver contact and penumbra behave coherently. Diagnose shadows, probes, medium and direct illumination separately; do not conceal one broken system with another.
- Make the corridor recede through near/middle/far planes, with subtle distance-dependent contrast/visibility. Red mist should not terminate as a flat geometric wall. Atmosphere should relate to actual lights, surfaces and occluders; avoid haloes, half-res seams and banding.
- Tune tone mapping/highlight rolloff, white balance, muted reflected color and bloom *only after* material/lighting fundamentals. The final look must remain strong **without HUD**.

## Web Ocean — borrow principles, not the unrelated water simulation

Primary source: [Noniv/web-ocean](https://github.com/Noniv/web-ocean), MIT (2026 Maksymilian Dendura).

**Useful concepts to evaluate via A/B actual renders:**
- `js/wgsl/ocean.js`: distance-dependent unresolved roughness / slope variance and screen-derivative specular AA; adapt the **principle** to industrial metals, not ocean-specific LEAN coefficients blindly.
- `js/wgsl/sky.js`: footprint-filtered procedural noise/edge anti-aliasing and gradual aerial perspective; adapt to procedural grime/microdetail and corridor fog.
- `js/wgsl/post.js`: AgX highlight handling, controlled saturation/white balance, subtle triangular dithering, bloom design. Test against existing ECHO-9 final tone; **do not assume replacing the tone curve automatically improves the look**.
- Do **not** transplant FFT waves, cloud/sky LUTs or seawater scattering into an enclosed corridor.
- Prefer original ECHO-9 implementation. If verbatim or substantial Web Ocean code is copied, retain required MIT copyright/license attribution in an appropriate source/documentation location and explain exact provenance.

## Gates and delivery

Iteration checkpoints (real images, fixed settings):
1. P0 discontinuity diagnosed and **corrected with evidence** (or explicitly BLOCKED with culprit narrowed); provide cropped before/after and shadow/volume/light-off evidence.
2. P1 materials: real clean hero and wall/pipe/grate close-ups compared to iteration2.
3. P1 cinematic composition and depth: final **1920×1080 clean + HUD**, reference side-by-side, iteration2/iteration3 side-by-side; show at least near/mid/far readability and consistent shadow/reflections. Preserve historical captures.
4. Independent media-only review: reference-relative critical/major/minor, visibly inspectable findings; **technical tests never imply art PASS**. Owner Adrian retains acceptance decision.

Testing must include: `npm run build`, **green `npm run RunAllTests`**, browser smoke, fallback/error, same-seed poses/route, pixel regressions of unaffected sectors, no external requests, actual HTML raw/gzip, shader compilation and feature diagnostics. Native hardware GPU/60FPS/temporal remain **BLOCKED** unless physically verified; do not claim SwiftShader satisfies them.

Update QA under `docs/qa/overhaul-v1/iteration-3/`, `AGENTS.md`, and Issue #3 (cross-reference Issue #2); commit on `main` and `git push` per approved workflow. On any infra failure preserve workspace and report honestly. **STOP after one reviewed candidate for Adrian's acceptance — no Iteration 4 and no other-sector overhaul without separate authorization.**

## Acceptance intent

Adrian's goal is a genuinely convincing **cinematic/portfolio-quality** corridor, at least approaching the art reference. No number-only grade substitutes for seeing the real image. The design brief is ambitious; do not claim photorealism/“better than reference” until Adrian sees and accepts evidence.
