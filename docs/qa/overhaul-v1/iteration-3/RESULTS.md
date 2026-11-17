# Iteration 3 — candidate delivered for Adrian's assessment

2026-11-17. Approved scope: [Issue #3 snapshot](ISSUE-3-APPROVED.md), corridor only. Implementation: GPT-6.1 Sol/high. **ART DIRECTION: NOT ACCEPTED. Hardware GPU /60FPS /native temporal acceptance: BLOCKED.** No iteration4 is authorized. Issue #1 remains open.

## View the actual images

- [Final clean1920×1080](after-clean.png) · [final HUD1920×1080](after-hud.png).
- [Reference / final](comparison-reference.png) · [iteration2 / iteration3](comparison-baseline.png).
- [Matched P0 red-edge crops](comparison-p0.png), [diagnosis](p0/DIAGNOSIS.md) and [final shadow-depth verification](p0/final-shadow-verification.json).
- [Same-light material comparison: wall, pipes, grate](comparison-materials.png), [raw crop provenance](details/crop-provenance.json) and [frozen P0/materials checkpoints](checkpoints/README.md).
- [Legacy transfer / AgX](comparison-grade.png) · [detail-AA off / on](comparison-aa.png), with [actual settings, source identity and restore equality](final-ab.json).
- [Independent media-only review](INDEPENDENT-REVIEW.md). Adrian retains the acceptance decision; technical PASS is not art PASS.

The target remains `target-red-corridor.jpg`. Baseline images are exact copies of actual iteration2 output at main56b0255, not a fabricated reconstruction. Final captures retain the same hero[-2.35,1.72,27.5]→[-13.5,1.78,61], verticalFOV64°, seed15515657, t12s, High/DPR1/4×MSAA. Comparison layouts only place unchanged images beside one another; linked originals are FullHD. Earlier construction previews are explicitly labeled960×540 and not final evidence.

## Independent artistic result

Fresh **GPT-6 Astra/high** received only the reference and actual final clean/HUD images, after technical QA, with no source or author rationale. **Reference-match: FAIL;0critical,4major,3minor.** Major findings: materials still too clean/uniform; architectural mid-scale detail too schematic; light hierarchy and angular red glow too graphic; atmospheric depth weaker than the reference. Composition, perspective and cool/red direction are strengths. See the unedited [complete independent review](INDEPENDENT-REVIEW.md) for image locations and qualifications.

The original P0 near-clipped mounting shadow is technically corrected, but the reviewer still sees angular boundaries in the overall red glow. The targeted regression PASS does not establish that every light transition is artistically convincing. **ART DIRECTION remains NOT ACCEPTED.** No application/art changes followed this review; the candidate is frozen for Adrian. Media identities are recorded in [media-manifest.json](media-manifest.json).

## Technical checks

| Check | Actual result | Evidence |
| --- | --- | --- |
| Build and reproducibility | PASS;140,511 raw /45,417 gzip bytes; rebuilding preserves final SHA | [build log](verification/build.txt), [artifact manifest](artifact-manifest.json) |
| `npm run RunAllTests` | **27/27 PASS**,0failed/skipped; includes all24previous guards,6-family stream and twoP0 tests | [actual log](verification/build-and-tests.txt) |
| Browser smoke | **17/17 PASS**, including controls, quality, sector selection and standalone `file:` with network offline | [report](verification/smoke-report.json) |
| Fallback/error handling | **3/3 PASS**: missing API, null adapter, device rejection; visible error and not-ready state | [report](verification/fallback-report.json) |
| Shader/actual HDR buffers | PASS; no runtime/validation errors; scene max7.3671875, composite max5.7578125;1699/780RGB values above1;0negative/nonfinite | [final capture](after-capture.json) |
| Production AgX transfer calibration | PASS; five HDR/gray/black/legacy cases match independent CPU expectation by0LSB; exact legacy bypass | [calibration](tone-capability-probe.json) |
| P0 continuity with genuine occlusion | PASS; actual final depth maps give old-edge visibility1 and real handle/panel visibility0 | [verification](p0/final-shadow-verification.json), [diagnosis](p0/DIAGNOSIS.md) |
| Other-sector pixels | PASS; views1/2/3/5 exactly identical to iteration2. View6 changes56,351pixels only in visible corridor/doorway, bbox[1520,409,1795,644]; all outside pixels identical | [pixel report](sector-image-regressions.json), [hash-bound scope review](sector-scope-review.json) |
| Four feature-off diagnostics | PASS; each contributes actual pixels; cached indirect terms explicitly retained as documented | [captures/flags](feature-ablations.json), [pixel measurements](image-measurements.json), [switch scope](ABLATION-SCOPE.md) |
| Final grade/detail-AA A/B | PASS; actual requested flags confirmed; default=authoritative final, restored=default exactly in RGB | [A/B metadata](final-ab.json), [pixel differences](final-ab-pixels.json) |
| Full route + presented goal | Functional **PASS**;62.4579s wall duration,13software frame samples, fresh goal frame presented at t60, no errors/external requests | [route report](route/browser-report.json), [collector log](verification/route-log.txt) |
| Hardware GPU /60FPS /native temporal quality | **BLOCKED** | No physical adapter in Cloud; explicit SwiftShader/readback only |

[Verification summary with evidence hashes](verification/summary.json). Browser: Chrome151.0.7922.34, Google SwiftShader fallback, actual1920×1080 offscreen WebGPU readback. No external runtime requests were observed. Smoke checks audio interaction, not audibility. The route's13samples have mean4747.24ms, p99/max26682.20ms and0GPU timestamp samples. These are slow software/readback diagnostics, not a hardware benchmark or a smooth flight acceptance. Static rendering deficiencies must not be blamed on missing hardware.

## What changed and what remains approximate

P0 traced the red-light edge to the fixture mounting ear crossing the emission aperture and straddling the0.15m shadow near plane. Correcting its physical mounting removes the artificial edge while retaining real cast shadows. It did not require a global shadow bypass, frustum gain, blur or fog paint.

Six explicit procedural material families, structural wear and filtered microdetail distinguish painted ribs, steel, tubes, grates and cables. Restrained cool/red lighting and continuous source-attenuated atmosphere reduce the block-like presentation. AgX is evaluated through actual same-buffer A/B, with MIT attribution for adapted upstream code. See [technical report](TECHNICAL-REPORT.md), [Web Ocean provenance](WEB-OCEAN-TECHNIQUES.md) and [reproduction](REPRODUCE.md).

There is one static actual-room reflection probe, isotropic GGX, two mapped shadow sources and six unshadowed fills,2×2PCF rather than area-light penumbrae, approximate probe bounce and single scattering. Detail-AA A/B holds the AA-on probe fixed; it cannot establish temporal shimmer suppression. The final159,686triangles and approximately272,205,328persistent GPU buffer/texture bytes plus8,294,400CPU pixel bytes are reported estimates, not measured peak VRAM. Small uniforms, temporary diagnostic buffers and browser/driver overhead are excluded.

Final HTML SHA256: `8e6cec19966228ee8f5a0ec4b39b9a7a7d22be85237e4d5a89b521c38091d281`. This identity binds the final images, feature-off tests, transfer calibration and route. Size change versus iteration2: +11,618raw /+4,390gzip bytes. Native WebGPU/WGSL, procedural runtime assets and one offline HTML are preserved. Observatory/hangar content, legacy geometry/material/RNG data, saved poses, route and collision remain unchanged.

After the first final media-only review, no application/art changes are permitted without Adrian's next approval. Documentation/main commit/push are the authorized closeout. **STOP before iteration4; wait for Adrian's assessment.**
