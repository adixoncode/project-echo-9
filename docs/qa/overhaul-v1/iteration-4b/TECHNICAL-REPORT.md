# Phase 4B — technical report

The cinematic target remains unmet. After three independently reviewed rounds, the stronger existing candidate **round2/C2** is selected for delivery. Round3 is rejected; its source, images, same-mesh lighting A/B and reviews remain archived. See the [artistic ledger](ARTISTIC-LEDGER.md) and [comparative review](round-3/INDEPENDENT-REVIEW.md). Technical correctness does not accept the image.

## Selected camera and real geometry

The mandatory camera study captured four production and four neutral FullHD views on unchanged4A art sources. Independent review ranked C>B>D>A; historical A remained RGB-identical to4A. Raster projection and screen-ray reconstruction now derive from the same per-shot FOV. The original six poses and fly-through restore64°.

The optional offline `?shot=4b` entry reproduces C2: eye `[-1.2,1.72,25.6]`, target `[-13,1.76,62]`, vertical FOV52°. It has a separate HUD caption and no falsely selected saved-view button. Saved view4 and the default observatory start are preserved. The final integration contains the exact reviewed round2 geometry/light sources; fresh production and neutral RGB equality checks bind the named shot to those reviewed images.

Pressure castings use closed stepped/bevelled cross-sections around all eight sectors. Actual submitted-mesh rays after round1 traced the large right mass to the nearest casting's inner reveal, correcting the initial rear-hull hypothesis. Round2 moved that casting from28.4m to24.4m behind the eye, replaced near axial plates with carrier posts and opened the service recess. The remaining principal casting is35.3m; the offset49.2m aperture has a real opening x[-0.7,3.3] and an adjacent recessed utility assembly. Floor plates have two lanes and a central grate; overhead services and the setback equipment cradle provide functional layers.

These are continuous procedural world meshes, with no camera-dependent substitution. The actual hangar, ship and rear wall remain visible through the open route. The physical opening still reads too narrowly/ambiguously in the selected image; a successful ray test does not resolve that artistic finding.

## Rejected third round and controlled lighting A/B

Round3 moved the director eye to44.5m/FOV40, staged a frame at53.7m and enlarged the actual71.6m exit. It improved aperture size but lost dominant near framing and made the distant ship a stronger competing subject. Independent review found two critical shortcomings in C3: missing foreground/depth hierarchy and a near-global red veil. Both the author comparison and independent review prefer C2. This rejected proposal is documented in [round3](round-3/DECISION.md); it is not the runtime delivered on main.

Round3 also changed existing light directions/powers, with positions/colors and the P0 red key held fixed. Its old-light diagnostic built final geometry first, then restored only old renderer light inputs before shadow/probe baking. Full vertex, position/normal and surface hashes match, including fixed final fixture emission. This is an explicitly scoped photometric A/B, not a comparison of two different visible meshes. [Images](round-3/comparison-old-final-lights.png) and the [independent addendum](round-3/LIGHTING-REVIEW.md) show no meaningful gain: the tuned version is flatter and loses localized metal reflections. That tuning was rejected.

No extra reflection probes, more expensive shadow technique or new effect was adopted. Material polish was deferred because major composition findings consumed the three-round budget. Selection of the already-reviewed C2 plus pixel-identical access/provenance integration is not a fourth art round.

## Preserved renderer and diagnostic scope

Production lighting, material/post shaders, HDR and atmosphere are unchanged from4A. The pipeline retains two cached2048² depth maps with receiver-plane-corrected2×2 PCF; one128px HDR cubemap with8mips and128-sample GGX convolution; linear HDR surface/scattering composition; and one final AgX transfer at exposure1.35. The corrected red pendant aperture and genuine caster occlusion are retained.

Neutral uses a separate derived diagnostic HTML: rough gray nonmetal, white versions of existing lights, real directional shadows, weak neutral ambient, detail/IBL/emission/fog/bloom disabled. It is a true GPU render, not image desaturation. Since directional light and shadows remain, a dark edge in neutral is not automatically a geometry defect. Geometry hashes bind neutral to production. No-fog, fog-without-bloom and final HDR images are retained for inspection. Inherited shadow/probe switches have [explicit cached-contribution limits](../iteration-3/ABLATION-SCOPE.md).

All captured pictures are actual native WebGPU/WGSL pixels rendered through SwiftShader and explicit CPU readback. Chromium's cloud swapchain limitation is not a license to synthesize/retouch the scene. Comparison layouts only resize, crop, label and place original pixels; no generative image assets enter runtime or QA.

## Physical checks, scope and reproducibility

Selected corridor geometry has118,064triangles; submitted architecture149,558triangles,5,860more than4A. Geometry/surface buffers grow1,406,400bytes. Estimated persistent GPU allocation269,774,608bytes is not measured peak VRAM. Resident legacy geometry still includes the deliberately undrawn old corridor; resident and submitted counts are distinguished in browser reports.

4,801 actual-mesh route samples plus an analytic Catmull speed bound establish continuous clearance≥0.6943m for a0.45m camera. Walking centreline clearance≥0.6750m; selected eye1.6351m; historical hero1.2687m. Tests retain original shoulder regression points, signed jamb collision, upper shoulders/soffits, real low/high portal rays, closed structural sectors and all saved cameras. Obsolete absolute assertions about moved geometry were adapted to actual new jamb locations, not disabled. Pre-adaptation failures are archived.

Only `src/corridor.js` and `src/main.js` differ from4A. Twelve runtime sources—including light table, material/post shaders, renderer/HDR, legacy scene/geometry/math, template and styles—are byte-identical. World RNG, route and original poses remain unchanged. See [source identity](verification/source-scope.json); exact pixel regression is assessed separately, including visible corridor content from hangar view6.

Standalone HTML:155,723bytes raw /50,660bytes gzip (Node zlib level9, matching build). SHA256:`0fc1512a4a9083893a30235dbe4cd35e20f9fe7f1833ff5dd73200b69c5e6e87`. Reference images and QA archives are documentation only; there are no external runtime assets. Source snapshots, served HTML hashes, browser state, complete logs and manifests bind evidence to each candidate. Historical capture-time PENDING statuses are superseded by separate later review/decision files without rewriting original data.

## Upstream decisions and remaining limits

| Technique | Decision |
| --- | --- |
| Abyssal Garden: negative space, authored density, near/mid/far hierarchy | Adapt to industrial camera/set design; judge the actual images, not object count. |
| Abyssal Garden: source/view absorption and filtered detail | Preserve ECHO-9's existing extinction and filtered procedural detail; no replacement established as necessary. |
| Web Ocean: coherent direct/environment light and filtered surface response | Preserve shared light table, actual-room GGX probe and detail/specular AA. |
| Web Ocean: linear HDR, restrained bloom and AgX | Already adapted in iteration3; preserve existing implementation and MIT attribution. No new substantial upstream code imported in4B. |
| Marine coefficients, caustics, ocean/organic simulation | Reject as unsuitable for this corridor. |
| More probes, shadow cost or new effects | Not adopted; no controlled image benefit earned that complexity. |

The single probe's box projection does not cover all deep recesses faithfully. Frame wear still uses box-based primitive coordinates. Materials remain too smooth/regular, near lighting competes with depth, and the far passage is weak. These visible gaps explain the failed art gate; no evidence establishes that native WGSL or procedural assets impose a hard film-quality ceiling. Hardware GPU absence blocks FPS and temporal verification, **not static artistic judgment**.

**ART DIRECTION:NOT ACCEPTED. Hardware GPU /60FPS /native temporal:BLOCKED.** No fourth round or later phase is authorized. See RESULTS.md for actual final checks and owner handoff.
