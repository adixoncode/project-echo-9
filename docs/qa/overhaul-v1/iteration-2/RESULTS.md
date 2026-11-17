# Issue #2 — iteration 2 results

**Iteration 2 only: Cinematic Lighting & HDR Overhaul. ART DIRECTION: NOT ACCEPTED until Adrian evaluates the images. No iteration 3 or observatory/hangar overhaul is authorized.**

## Candidate and actual media

The final candidate adds a linear HDR corridor pipeline, selective cool/red relighting, a single shared light table, shadowed depth-aware scattering, broader rough-metal reflections and bright-only HDR bloom. It retains native WebGPU/WGSL, procedural runtime content and one offline HTML. Read the [pipeline and approximation notes](HDR-PIPELINE.md), [construction checkpoints](checkpoints/README.md), and [reproduction commands](REPRODUCE.md).

- HTML: **128,893 raw bytes /41,027 gzip bytes** (Node zlib level 9), versus iteration 1's 105,761 /34,927. Growth:23,132 raw /6,100 gzip. The optional100KB goal remains exceeded in favor of the approved visual scope.
- SHA256: `8d0da9eb540d3373eee1a33fecd49381d46e64c797afb6dd28c0c76ebe8a3e08`; final captures and feature-off diagnostics match this exact build. See `artifact-manifest.json`.
- Actual1920×1080 WebGPU output, High, DPR1,4×MSAA, seed15515657, time12s. Camera[-2.35,1.72,27.5] → [-13.5,1.78,61], verticalFOV64°. Software offscreen readback is explicit; scene pixels were neither retouched nor image-generated.
- [Clean render](after-clean.png), [HUD](after-hud.png), [reference comparison](comparison-reference.png), [iteration1/iteration2 comparison](comparison-baseline.png), [comparison page](comparison.html).

## Verification

| Check | Actual result |
| --- | --- |
| Build / RunAllTests | **PASS**,24/24, all15 previous tests retained plus fixed-scope and HDR/light/coverage tests; `verification/build-and-tests.txt` |
| Browser smoke | **PASS**,17/17, controls/pointer lock/menu/presets/audio API/offline standalone file/no external runtime requests; `verification/smoke-report.json` |
| Missing API / null adapter / device rejection | **PASS**,3/3; `verification/fallback-report.json` |
| Real RGBA16F/MSAA calibration | **PASS**, known HDR values survive and known final display/bypass match; `hdr-capability-probe.json` |
| Actual final HDR texture copies | **PASS**, scene maximum33.4375 with19,682 RGB values>1; composite maximum25.703125 with16,462 values>1; zero negative/nonfinite RGB values in both1920×1080 buffers; `after-capture.json` |
| Legacy geometry/material/RNG, all6 saved poses and full route definition | **PASS**, exact baseline guards preserved |
| Other-sector pixels | **PASS with disclosed corridor visibility**: views1/2/3/5 exactly identical. View6 changes56,314 pixels(2.716%) only in visible corridor doorway/mixed-MSAA edge[1520,409,1795,644]; every pixel outside is identical. Hash-bound manual scope classification is separate from raw comparison. |
| Full browser route | **PASS**,6/6 nonblank views and complete fixed High1920×1080 route;63.2297s wall clock,12 rendered frames, no errors/requests. This is functional completion only; `route/browser-report.json` |
| Capture runtime errors / external requests | **PASS**, none in final capture |
| Hardware/native presentation /60FPS /temporal acceptance | **BLOCKED**, no physical reference GPU/native presentation verified; software readback timings are not acceptance measurements |
| Independent reference-relative art review | **FAIL** against reference; five major and three minor findings, no critical defect. Owner acceptance remains pending; `INDEPENDENT-REVIEW.md` |

## Recovery and final verification

The same Cloud workspace was recovered after an executor disconnection. Before any build, all required modules, tests, review, JSON/PNG evidence and checkpoint archives were validated. Source-generated HTML matched the preserved candidate byte for byte. A local backup of the workspace and binary diff was saved under `.git/echo9-recovery/` (not part of the published tree); its archive was verified.

Fresh commands and evidence are under [verification/](verification/README.md): explicit build, RunAllTests 24/24, smoke 17/17, fallback 3/3, all five regression captures, clean/HUD and all four feature-off captures. Fresh sector images and clean/HUD are exactly pixel-identical to the preserved reviewed candidate. The 35 runtime/script/test/package/index files are unchanged from the recovery snapshot. The actual 60-second route report from before interruption is retained and hash-matches the same application; it was not misrepresented as a fresh hardware benchmark.

No application source, tests, lighting, geometry or artistic direction changed during recovery. Earlier root smoke/fallback files remain historical; the final reports are explicitly the files under `verification/`. The interrupted feature-off series was completed using fresh captures with source identity and flag checks. Original failure evidence was retained.

## Technical corrections and evidence

The construction pass caught overbright/banded near-source volume integration before the candidate was frozen. The final approximation uses24 samples, a finite quadrature footprint and lower scattering albedo, while keeping a bounded spatial medium and fixed exposure. Practical source visibility and the primary red receiver cone were corrected using the same source table; no mass geometry was added. The final cool key is weaker than the relighting checkpoint, not a global exposure increase.

FullHD feature-off diagnostics then exposed curved self-shadow bands on a flat red-lit wall. Actual mesh rays established that the sampled points had clear source visibility; atmosphere-off retained the bands and shadow-off removed them. The targeted repair uses unperturbed triangle-face normals and analytically corrects receiver depth at each bilinear PCF texel. Normal offset and constant bias, all authored lights, geometry and poses stay unchanged. Tests now verify a sloping unobstructed plane stays lit while a nearer caster still shadows it. Actual renders and source from the defect are preserved under `technical-qa/shadow-acne/`. This technical repair preceded the independent art review.

The first smoke run's short fixed-duration key presses yielded unchanged positions while concurrent software rendering was busy. That original15/17 report is retained in `technical-qa/smoke-fixed-wait-failure.json`. The collector now holds input across three actual presented frames: W movesz16→15.25 and E movesy5.80→6.55, with no application source change. The final report is17/17 PASS.

The first full-route collection timed out waiting for completion under concurrent SwiftShader load; it recorded no runtime errors. The original failure/log are retained under `technical-qa/route-concurrent-timeout.*`. The collector now preserves intermediate state and failure diagnostics and grants software completion more time; native timing criteria are unchanged. The isolated rerun completes in63.2297s with12 rendered frames and no runtime errors or unexpected requests. Scene time and configuration stay fixed to the original route. The sparse software frames do not verify smooth traversal or60FPS; GPU timestamp samples during the route are0.

## Image evidence and limits

The fraction below encoded display-luma 24/255 moves from **91.77%** in iteration 1 to **66.46%** in iteration 2; the reference is **60.51%**. Mean encoded display luma is 0.11439 versus 0.09033 in the reference. Pixels above 220/255 are 0.616% versus 0.058% in the reference, consistent with the reviewer's concern about broad bright surfaces. These are descriptive, unnormalized statistics, not a similarity or acceptance score. Regional measurements show the near-right dark frame remains close to its baseline value; this was not a global exposure lift.

| Same-candidate diagnostic | Changed pixels | Mean absolute RGB difference (0–255) |
| --- | --- | --- |
| no-shadows | 5.240% | 0.881272 |
| no-environment | 97.936% | 7.481883 |
| no-atmosphere | 54.465% | 3.261467 |
| no-bloom | 0.405% | 0.005307 |

All four switches disable the intended feature and contribute real pixels. Shadow-off holds the cached probe constant; these numbers isolate live receiver lookups, not every captured shadow in reflections. Bloom remains localized. See `feature-ablations.json`, `image-measurements.json` and `verification/feature-contribution-checks.json`. These technical contributions do not overturn the artistic FAIL.

The local cubemap is a cached one-probe approximation, not GI. Only the two primary lights have geometric shadow maps; weaker fills are unshadowed. Fog is half-resolution single-scattering approximation without source-to-sample extinction or multiple scattering. Static images cannot prove temporal smoothness. Explicit GPU allocation estimate is259,883,344 bytes plus8,294,400 CPU image bytes; browser/driver internal allocations are excluded. Raw/gzip file size is not GPU memory.

The optional architecture inspiration did not import code/assets from another project. References remain documentation-only. Full historical first-iteration evidence is preserved separately. No hardware limitation explains away an artistic finding in these stills.

## Independent review and stop

The independent GPT-6 Astra reviewer received only the actual reference and final clean/HUD images. Composition, cool/red separation and HUD are readable, but reference match is **FAIL**: smooth uniform materials, competing broad white/red light blocks, dominant repetitive geometry, insufficient atmospheric depth and uneven shadow modelling remain major differences. The complete unabridged review is preserved in [INDEPENDENT-REVIEW.md](INDEPENDENT-REVIEW.md). No artistic source changes follow that review. **ART DIRECTION: NOT ACCEPTED. STOP before iteration 3.**

Owner artistic acceptance remains pending. After the independent review, no artistic correction is applied; further work requires Adrian's separate approval. Issue #1 remains open on hardware/temporal gates. Final closeout updates AGENTS, task documentation and Issue #2 and delivers the source/evidence on main.
