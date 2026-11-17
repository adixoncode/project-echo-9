# Phase 4B — selected C2 handoff, cinematic target not achieved

**Independent artistic verdict:FAIL. ART DIRECTION:NOT ACCEPTED. Hardware GPU /60FPS /native temporal:BLOCKED.**

Three artistic rounds were completed after the mandatory four-camera study. The third candidate was rejected: its larger exit came with poorer framing, depth and a pervasive red veil. Image-only GPT-6 Astra prefers the already-reviewed **round2/C2**, which is retained for Adrian's assessment. No fourth round was started. Material microdetail was deferred because major composition defects consumed the authorized budget. The owner has not accepted the look.

## Actual images

- Selected FullHD1920×1080: [production](selected/production-C2.png), [neutral](selected/neutral-C2.png), [HUD](selected/production-C2-hud.png).
- [Reference comparison](round-2/comparison-reference.png), [selected320px sheet](selected/selected-contact-sheet.png), [near/middle/far crops](round-2/details/).
- [Four-camera production study](camera-study/production-contact-sheet.png), [neutral and production camera study](camera-study/camera-contact-sheet.png), [independent camera ranking](camera-study/INDEPENDENT-REVIEW.md).
- [Round1](round-1/comparison-reference.png), [round2](round-2/comparison-reference.png), [round3 production](round-3/production-C3.png), [round3 neutral](round-3/neutral-C3.png), [C2/C3 comparison](round-3/comparison-R2-C3.png), [rejected same-mesh light A/B](round-3/comparison-old-final-lights.png).
- [Artistic ledger](ARTISTIC-LEDGER.md), [selected candidate review](round-2/INDEPENDENT-REVIEW.md), [final independent comparison](round-3/INDEPENDENT-REVIEW.md), [lighting addendum](round-3/LIGHTING-REVIEW.md).

All are actual WebGPU shader output through explicit software readback, not generated artwork. Comparison sheets only place/resize/crop source images. Reference pictures never enter runtime. The selected production **and neutral** PNGs are byte-identical to their archived round2 counterparts, with zero differing RGB pixels after named-shot integration: [identity evidence](selected/image-provenance.json).

## What is delivered

Closed stepped/bevelled pressure castings, a deeper functional maintenance recess, revised floor/ceiling hierarchy, the near casting moved behind the eye and an offset intermediate portal. The optional `?shot=4b` selects C2/FOV52; six historical views and flight retain64°. Default observatory entry is unchanged. Real geometry remains continuous and traversable.

Only `src/corridor.js` and `src/main.js` change in the selected runtime. Twelve other runtime sources are identical to4A, including lights, materials, shadow/probe/HDR/atmosphere/post processing and legacy content. No added probes, costlier shadow implementation or new effects. The third-round light tuning did not earn adoption in actual A/B and was rejected.

Final HTML SHA256:`0fc1512a4a9083893a30235dbe4cd35e20f9fe7f1833ff5dd73200b69c5e6e87`.
Size:155,723raw /50,660gzip bytes (Node zlib level9).118,064corridor /149,558submitted architecture triangles; persistent GPU estimate269,774,608bytes is an allocation estimate, not measured peak VRAM. Sources and served HTML are hash-bound to the captures. See [technical report](TECHNICAL-REPORT.md), [reproduction](REPRODUCE.md) and [source scope](verification/source-scope.json).

## Actual verification

| Check | Result | Evidence |
| --- | --- | --- |
| Literal `npm run build` | PASS | [log](selected/verification/literal-build.log) |
| Literal `npm run RunAllTests` | PASS32/32 | [log](selected/verification/literal-RunAllTests.log); build reproducibility/standalone, actual mesh/collision, material/HDR/P0/legacy guards |
| Browser smoke | PASS17/17 | [report](verification/smoke-report.json); input, quality, audio API and offline file rendering |
| Fallback | PASS3/3 | [report](verification/fallback-report.json); missing API, null adapter, device rejection |
| Named shot, FOV reset and image identity | PASS | [capture](selected/capture.json), [image identity](selected/image-provenance.json); original six state configurations and flight reset64°, selected52° |
| Actual mesh route/camera/collision | PASS | [clearance](selected/verification/actual-mesh-clearance.json);4801samples plus analytic guard≥0.6943m versus0.45m radius; selected eye1.6351m, walking≥0.6750m |
| Other-sector pixels | PASS with explicit corridor scope | [regression report](verification/sector-image-regressions.json), [scope review](verification/sector-scope-review.json), [view6 comparison/mask](verification/view6-scope-comparison.png) |
| Full route and presented goal | PASS functional only | [browser report](verification/browser-report.json);66.6215s,12software frame samples, fresh presented t60goal, no errors/external requests |
| Actual HDR buffers | PASS numerically | [capture](selected/capture.json); scene maximum7.3671875, composite5.703125, no nonfinite/negative values; one final transfer retained |
| Actual GPU P0 shadow depths | PASS | [verification](selected/verification/p0-gpu-verification.json); four old false-edge receivers lit, actual handle/panel occluded;15fixed world receivers recorded |
| No-fog / fog-without-bloom diagnostics | PASS2/2, no errors | [comparison](selected/diagnostics/comparison-features.png), [reports](selected/diagnostics/feature-ablations.json), [actual pixel contributions](selected/diagnostics/image-measurements.json) |
| Archived candidates | PASS334manifest entries | [integrity](verification/archive-integrity.json); source, images and logs preserved |
| Hardware GPU /60FPS /native temporal | BLOCKED | SwiftShader/readback cannot establish these gates; no physical reference GPU verified |
| Reference-relative art and owner acceptance | FAIL /NOT ACCEPTED | Independent reports above; Adrian retains acceptance |

Views1/2/3/5 are exactly RGB-identical to4A. View6 changes23,937pixels only within the visible corridor entrance, bbox[1521,410,1794,641]; direct image inspection and a hash-bound scope review confirm no changed hangar/ship/floor/sky pixels outside it. Legacy geometry/material/RNG data, six poses and route are unchanged.

The full-route mean sample interval was5478.95ms; p99/max31298.70ms, zero GPU timestamp samples. Those timings include diagnostic readback and are **not** hardware FPS. Audio interaction was tested, not audible output. Static image quality is not excused by missing hardware.

## Failures and limits retained honestly

The selected C2 still has a small/ambiguous distant passage, an overly prominent cool frame, a dark right foreground and smooth regular materials. The round3 reviewer identified critical regression in C3 and preferred C2. The controlled lighting A/B did not rescue C3. The film-quality objective therefore remains unmet; a green test suite does not change that verdict.

Pre-adaptation tests for obsolete moved-jamb locations failed during development; their logs are preserved alongside the corrected actual-geometry checks. A brief exec-server transport disconnect during final QA recovered in the same environment without reset; the test process, working files, HTML SHA and334archived hashes remained intact. No work was recreated or discarded.

Historical capture manifests retain capture-time PENDING statuses; later review/decision files record actual outcomes. Every candidate and rejected experiment remains available. See [authorization](AUTHORIZATION-AND-PLAN.md) and [original brief](OWNER-BRIEF.md) for the three-round limit.

Issue#1 and#4 remain open. Complete the authorized documentation/main commit/push handoff, then **STOP for Adrian. No fourth art round, later phase or observatory/hangar overhaul without separate approval.**
