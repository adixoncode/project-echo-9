# Red-wall edge: proven cause and targeted correction

Fixed hero, seed15515657, t12, High,1920×1080,DPR1,4×MSAA. These are actual native WebGPU offscreen renders through SwiftShader and CPU readback; hardware/temporal acceptance remains BLOCKED.

The abrupt diagonal is caused by an opaque mounting ear crossing the pendant's flood aperture, combined with the shadow camera's0.15m near clipping plane slicing that ear. It is **not** the outside-UV return0 hypothesis. The receiver is covered by the shadow projection, its cone/range are continuous, and actual geometric shadow depth changes at the observed edge. Fog adds a small local veil but does not create the boundary.

`before-measurements.json` combines actual GPU depth32float texels, receiver-plane-corrected PCF comparisons, independent ray/triangle intersections, source cone/radiance and projection. `before-gpu.json` binds screenshots and depth copies to the exact HTML SHA. CPU mesh rays are diagnostic calculations, not GPU image substitutes.

At adjacent pixels(300,530)/(300,540), the same wall triangle46585 receives the red key. World points are approximately[3.82,1.912,45.480]/[3.82,1.737,45.480]. Cone weights are0.988554/0.999353. Shadow UVs[.343995,.470630]/[.352106,.474038] are inside the frustum, depths.955252/.957785 are valid, range fade is1. The mounting ear triangle123847 intersects their source rays at forward depths.144747/.152685m: opposite sides of the.15m near plane. The first intersection is clipped from the map; the second is recorded. GPU PCF visibility is1/0. The independent pair(320,520)/(320,530) repeats this with ear depths.146367/.154756m and GPU visibility1/0.

The isolated red-emitter render reproduces the diagonal. Disabling atmosphere retains it: encoded RGB at(300,530)/(300,540) is[170,17,11]/[1,2,2]. Disabling shadows restores continuous illumination:[170,17,11]/[167,17,11]. Atmosphere-on isolated RGB is[152,15,10]/[14,3,2]. These encoded differences measure feature contribution in display values; they are not presented as linear scattering energy.

The correction moves the existing pendant mounting ears above the visible diffuser, from source-centred0.40m height to source+0.20m centre with0.12m height. This exposes its flood aperture coherently. It leaves source positions, power, color, cone, range, shadow cameras, near plane, frustum rejection, receiver bias and PCF unchanged. It does not exempt any object or distance from shadow casting. The same construction correction applies consistently to all pendant fixtures.

The corrected isolated image has no diagonal. At(300,530)/(300,540), atmosphere-on RGB is[159,15,10]/[156,15,10]; at(320,520)/(320,530) it is[152,14,10]/[150,14,9]. The real nearby handle remains dark at(280,540),[41,5,4], and still intersects the actual source ray at triangle46768. Panel-edge contact triangle46601 is also retained. The new tests sample42 unoccluded points across both old boundaries, assert valid projection and continuous falloff, then independently require actual handle/panel occlusion. Full after-depth evidence is in `after-measurements.json`.

Reproduce: `node scripts/red-edge-diagnostic.mjs` (CPU mesh); `node scripts/red-edge-gpu.mjs` (real fixed FullHD GPU features); `node scripts/red-edge-analysis.mjs` (combine actual GPU texels with independent geometry/projection). Use `QA_TAG=after` for after capture/analysis and retain the matching mesh-after JSON. The P0-only source is frozen separately before material/lighting work.


## Image comparison provenance

The authoritative matched crops are `before-red-only-crop.png` / `after-red-only-crop.png` and `before-red-no-atmosphere-crop.png` / `after-red-no-atmosphere-crop.png`. They extract the identical rectangle [160,420,420,640] from matching FullHD diagnostic modes without resampling or color adjustment. `matched-crop-provenance.json` records source-image SHA, source-HTML SHA, flags and bounds.

The earlier `before-crop.png` is an iteration2 all-lights context zoom, while `after-crop.png` is an isolated-red context zoom. Both were enlarged4× from [170,440,365,595] for inspection; they are retained as exploratory context and must NOT be treated as a controlled before/after pair. The full default-light P0 hero is a separate checkpoint.

Exact HTML for the before-instrumented diagnostic was reconstructed only in memory from frozen P0 sources plus the untouched baseline fixture module. Its SHA matches the actual before-depth/render metadata (`0c74856a…`); no runtime checkout rollback occurred. Both before and corrected P0 standalone sources are archived alongside their source-identity records.
