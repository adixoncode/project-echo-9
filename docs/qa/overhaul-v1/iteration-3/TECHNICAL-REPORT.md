# Iteration 3 — technical report

This is one corridor candidate for Adrian's assessment, not artistic acceptance. Implementation: GPT-6.1 Sol, high reasoning. Reference: `docs/references/target-red-corridor.jpg`. The actual fixed-camera images are [clean](after-clean.png) and [HUD](after-hud.png), 1920×1080, High, DPR1, 4×MSAA, seed15515657, t12s. Camera, saved poses, route and original-sector content are preserved. All browser images use real offscreen WebGPU through Google SwiftShader and CPU readback, not an image substitute. Hardware GPU /60FPS /native temporal acceptance remain **BLOCKED**.

## P0: why the red illumination stopped abruptly

An opaque mounting ear intersected the pendant emitter's flood aperture. The shadow camera's 0.15m near plane clipped that ear differently for adjacent receiver rays, producing the false diagonal. The receiver itself was inside shadow UV/depth coverage. Smooth cone/range falloff and fog were not the cause.

At pixels(300,530)/(300,540), the same wall triangle46585 has valid shadow UV/depth and continuous cone weights0.988554/0.999353. Ear triangle123847 intersects source rays at forward depths0.144747/0.152685m, straddling the near plane. Actual GPU depth32float texels, reconstructed receiver-plane PCF and independent CPU ray/triangle calculations give visibility1/0. Isolated-red/atmosphere-off RGB is[170,17,11]/[1,2,2]; shadow-off restores[170,17,11]/[167,17,11]. These are encoded pixel values, not linear radiometric measurements.

The P0-only correction puts the existing mounting ears above the diffuser (source+0.20m centre,0.12m height instead of source-centred0.40m). It preserves light position/power/cone, near plane, bias and PCF, without excluding geometry from shadow casting. The same corrected crop has continuous red illumination; a real handle and panel edge still cast shadows. Forty-two clear receiver samples plus independent real-occluder tests guard that behavior.

See [complete diagnosis](p0/DIAGNOSIS.md), [matched crop provenance](p0/matched-crop-provenance.json), [before](p0/before-red-no-atmosphere-crop.png)/[after](p0/after-red-no-atmosphere-crop.png) and actual GPU/geometry records in `p0/`. The earlier enlarged `before-crop.png`/`after-crop.png` are different diagnostic modes and explicitly retained only as exploratory context, not a controlled pair.

After subsequent relighting, the final production artifact was checked again using its actual GPU shadow depth texels: [final-shadow-verification.json](p0/final-shadow-verification.json). Old-edge pixels(300,530),(300,540),(320,520),(320,530) have visibility1; handle(280,540) and panel(280,560) remain0. Thus the final result does not rely solely on an earlier construction checkpoint.

## Materials and reflections

The original 48-byte geometry stream is retained; a corridor-only 32-byte surface stream supplies explicit family IDs, primitive-local metres and half extents. Six families distinguish dielectric chipped paint, dark steel, brushed tubing, grates, rubber/cables and worn exposed metal. Wear follows primitive edges and joints, with runoff and coarse/middle/fine variation; it is not just global random color noise. Dominant structural flanges use painted material, while tray bars use dark steel.

Procedural detail fades toward its mean according to screen derivatives. Normal-slope variance and unresolved footprint widen GGX roughness, which also selects the appropriate environment mip. This is a practical isotropic GGX material model: brushed variation is directional, but there is no full anisotropic microfacet BRDF, measured material dataset, displacement or physically simulated corrosion.

The inherited reflection system still renders six HDR views of the actual room into a128² cubemap with8mips, then uses128-sample GGX prefiltering and box-projected lookup. It includes actual room geometry/direct lights/shadows, not an unrelated sky image. One cached local probe is an approximation: no dynamic ray tracing, per-object reflection capture or multiple diffuse bounces. It cannot reproduce every local reflection/contact detail in the reference.

The [P0-only and materials-only stages](checkpoints/README.md) have byte-identical authored light/post/exposure modules. Use their clean heroes and [raw wall/pipe/grate crops](details/crop-provenance.json) for the controlled material comparison. Final-versus-iteration2 also includes subsequent relighting, grading and minor family-tag refinements and must not be described as materials alone.

## Lighting and atmosphere

The cool key and red depth key are restrained (powers150/165 instead of280/360), support fills reduced, and red key cone narrowed148°→124° after the isolated P0 proof. Existing source positions are retained; one weak cool far-ceiling fixture adds local distant separation. Two2048² cached shadow maps provide receiver-plane-corrected bilinear2×2PCF for the main cool/red sources. Other fills are unshadowed. There are no area-light soft shadow integrals or global illumination solver; contact and penumbra remain approximations.

The continuous bounded medium uses24 half-resolution view-ray samples, three source-path extinction samples per light, Beer–Lambert transmittance, a finite source footprint, and low-energy bounce sampled from the actual-room probe. Receiver-distance bilateral reconstruction and full-resolution optical-depth integration reduce depth-edge leakage. The density changes continuously along the corridor; no camera switch or painted screen-space fog wall is introduced. This is single-scattering plus a probe-based bounce approximation, not multiple-scattering transport or a turbulent fluid simulation. Far geometry can still read as a designed endpoint.

The inherited `probe=0` / `no-environment` diagnostic disables surface environment reflection/diffuse IBL. The new low-energy probe contribution to volume scattering remains enabled; this ablation is therefore **receiver IBL off**, not removal of every environment-derived term. `fog=0` removes the volume composition. `shadows=0` disables live surface/volume lookups but retains shadow information in the startup probe. See [exact ablation scopes](ABLATION-SCOPE.md). Feature contribution is not an art score.

## AgX, detail AA and Web Ocean provenance

Selected [Noniv/web-ocean concepts](WEB-OCEAN-TECHNIQUES.md) were evaluated, excluding FFT water, clouds and sky LUTs. Derivative/footprint filtering is an original industrial-material adaptation. AgX inset/outset matrices and polynomial contrast fit are substantially adapted from upstream `post.js` at commit`a07c7fd522ef0a897601c114f927a49d93d95520`; the complete MIT notice is in source, embedded offline HTML and [THIRD_PARTY_NOTICES](../../../../THIRD_PARTY_NOTICES.md).

The final path is linear RGBA16F scene → shadowed scattering → linear bright-only bloom → one exposure/AgX transfer →8-bit unorm display. AgX output is already display encoded; no second gamma transform is applied. A pixel-anchored triangular dither has quarter-code-value amplitude. Original-sector display bypass is exact.

[FullHD A/B](final-ab.json) changes only final grade or live receiver detail filtering, with actual diagnostic-state assertions. `default-ab.png` exactly equals `after-clean.png`; restoration exactly equals the initial default. Compare [AgX](default-ab.png)/[legacy](legacy-grade.png) and [AA on](default-ab.png)/[AA off](no-detail-aa.png). The same AA-on cached probe is intentionally held constant: this isolates live receiver filtering, not an entire probe rebake. Static images cannot verify temporal shimmer suppression.

[Production-function calibration](tone-capability-probe.json) runs the exact production `agxDisplay` through RGBA16F4×MSAA resolve and RGBA8unorm, against independent CPU calculations with half-float input rounding. Five HDR/gray/black/legacy cases differ by0LSB; a deliberately incorrect second gamma would differ by59LSB on gray. Calibration checks transfer correctness, not artistic merit.

## Cost and limits

Final HTML SHA256:`8e6cec19966228ee8f5a0ec4b39b9a7a7d22be85237e4d5a89b521c38091d281`;140,511 raw /45,417 gzip bytes (Node zlib level9), up11,618/4,390 from iteration2. No runtime dependencies/assets/network services. High reports159,686 triangles and272,205,328 approximately estimated persistent GPU buffer/texture bytes plus8,294,400 diagnostic CPU pixel bytes. This is not measured VRAM or peak allocation: small retained uniform buffers (~1,840bytes), temporary diagnostic readbacks and driver/browser allocations are excluded.

Procedural surface evaluation and volumetric source-path integration add work; software capture is very slow. Native hardware cost,60FPS and temporal quality are unverified. Missing physical GPU does not excuse static artistic differences from the reference. See [RESULTS](RESULTS.md) for actual test outcomes, regression evidence, independent review and remaining gates. After the reviewed candidate, STOP before iteration4.
