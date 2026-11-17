# Phase 4B — technical report

This is a corridor candidate, not accepted art. The [artistic ledger](ARTISTIC-LEDGER.md) records why the three-round budget was spent on composition instead of material microdetail. Final image review and browser results are reported separately in RESULTS.md.

## Camera and actual world geometry

The mandatory four-camera study used unchanged 4A geometry, materials and lighting. Independent image review selected C; the historical A image remained pixel-identical to 4A. Raster projection and screen-ray reconstruction now share the same per-shot vertical FOV. The six saved poses and fly-through restore the historical 64° FOV.

The final optional director shot is available with `?shot=4b`: eye `[1.4,1.72,44.5]`, target `[-13.2,1.76,80]`, vertical FOV40°. It has its own HUD caption and does not silently replace saved view4. The default observatory start is preserved. `setCameraShot`, `setDirectorShot` and diagnostic state support reproducible inspection; no camera-dependent geometry swap exists.

Actual submitted-mesh rays after round1 identified the broad right foreground as the inner reveal of the nearest pressure casting, rather than the rear hull initially suspected. Round2 moved that threshold behind the eye and exposed the maintenance recess. Its intermediate offset portal still read as a small slit: physical openness did not produce a clear visual destination. Round3 removes that obstruction, stages the principal visible casting at53.7m and places the final aperture at the real71.6m corridor exit. A six-metre opening and5.9m headroom preserve the left-bending original flight. The unchanged hangar remains visible through it; there is no fake occluding wall.

Pressure castings use a closed stepped/bevelled cross-section around all eight octagon sectors. The near recess includes carrier posts, service equipment and a setback cradle; floor plates have clearer lanes and a central grate. Geometry is continuous and procedural. Materials retain their earlier authored primitive coordinates; the box-based wear mask on octagonal frames is a known remaining limitation.

## Existing lighting, controlled comparison and unchanged pipeline

Only existing corridor light directions and powers are tuned. Source positions/colors, the red-depth key and its corrected pendant aperture remain unchanged. The cold key and middle light aim toward the relocated main frame, middle/far red power is redistributed, and the exit source aims into the actual portal. No global exposure, tone mapping, bloom or atmosphere parameter is changed.

The renderer still uses two cached2048² depth maps with receiver-plane-corrected2×2 PCF, one128px HDR cubemap with8mips and128-sample GGX convolution, linear HDR surface/scattering composition and one final AgX transfer at exposure1.35. No additional probe, higher-cost shadow technique or new effect is adopted. Thus there is no unproven renderer cost increase hidden behind the image changes.

The old-light diagnostic builds the **final** geometry first, then restores only old renderer light-table inputs before shadows/probe are baked. This intentionally holds final visible fixture geometry/emission fixed. Full vertex, position/normal and surface-stream hashes must match across production and old-light captures. It is a photometric A/B on identical visible surfaces, not a claim that the earlier complete scene was identical. Lighting adoption is judged from those actual images.

Neutral is a separate derived diagnostic HTML: gray rough nonmetal, white versions of the same lights, existing real directional shadows, small neutral ambient, detail/IBL/emission/fog/bloom disabled. It is not a grayscale image edit. Because it retains directional lighting and shadows, a harsh edge visible in neutral is not automatically a geometry defect. Geometry hashes bind it to production.

The requested no-fog, fog-without-bloom and final-HDR views isolate existing features; inherited shadow/probe switches retain their [documented cached-contribution limits](../iteration-3/ABLATION-SCOPE.md). No claim of hardware smoothness follows from static captures.

## Safety, regression and provenance

The final actual corridor mesh contains116,840triangles; total submitted architecture148,334triangles,4,636more than4A. The resident legacy buffer still contains the deliberately undrawn old corridor; submitted and resident geometry counts must not be conflated.

4,801 route samples plus an analytic Catmull speed bound give continuous actual-mesh clearance≥0.6682m for a0.45m camera radius. Walking centreline clearance≥1.4300m; director eye1.6551m; historical hero1.2687m. Tests cover all saved views, real low/high portal rays, closed structural sectors, recessed webs, signed jamb collision and upper shoulder/soffit collision. A stale test for the removed intermediate portal failed during staging; it was replaced by checks against the actual exit's enclosing jambs, rather than disabled. The original discovered shoulder regression is retained.

Runtime source changes are limited to `corridor.js`, `corridor-lights.js` and `main.js`. Eleven other runtime sources are byte-identical to4A, including material/post shaders, renderer/HDR, legacy scene/geometry/math, template and styles. Original world RNG, routes and saved poses are retained. See [source identity](verification/source-scope.json); pixel regression is a separate check, including the visible corridor entrance from the hangar.

Final standalone HTML is155,597bytes raw /50,622bytes gzip (Node zlib level9, matching build). SHA256:`a24b68c1331414c1b1f395e4af551e9b804fbbab5575e75ef473a290ad6a7b1b`. It has no external runtime assets. Reference pictures, capture archives and QA code are documentation only.

## Upstream techniques and practical limits

| Source technique | Decision in this phase |
| --- | --- |
| Abyssal Garden: authored negative space, scale hierarchy, near/mid/far separation | Adapt to industrial architecture and camera staging; actual images determine whether it succeeds. |
| Abyssal Garden: depth-consistent absorption/scattering and filtered detail | Preserve ECHO-9's existing source/view-path extinction and filtered procedural detail; no replacement justified by current evidence. |
| Web Ocean: consistent direct/environment lighting and distance-filtered surface response | Preserve the shared light table, actual-room GGX probe and existing detail/specular AA. |
| Web Ocean: linear HDR, restrained bloom and AgX | Already adapted in iteration3; preserve the existing implementation and MIT notice. No new substantial upstream code imported in4B. |
| Marine coefficients, ocean simulation, caustics, organic world generation | Reject as inappropriate for this corridor. |
| Additional local probes / more costly shadows / new effects | Not adopted. No controlled image evidence has earned their additional cost. |

The one room probe's box projection does not cover every deep recess faithfully; frame wear still uses primitive-box coordinates. These are limitations, not proof that adding systems would solve the composition. Micro-material polish was deferred because earlier reviews retained major composition problems.

Software WebGPU provides actual shader pixels and supports static review. Lack of a physical GPU blocks hardware FPS and temporal acceptance; it does **not** excuse a weak still image. The current images do not establish that native WGSL or procedural assets impose a hard ceiling on film quality. Remaining art gaps must be attributed to the visible staging, lighting and surface treatment, with the independent review stating their severity.

**ART DIRECTION: NOT ACCEPTED. Hardware GPU /60FPS /native temporal: BLOCKED.** No further art pass is authorized after the third reviewed round.
