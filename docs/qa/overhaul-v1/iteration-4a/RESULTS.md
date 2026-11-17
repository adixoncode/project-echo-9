# Phase4A — architectural candidate for Adrian's assessment

2026-11-17. Approved scope: [Issue #4](ISSUE-4-APPROVED.md). Coding: GPT-6.1 Sol/high. **ART DIRECTION: NOT ACCEPTED. Physical GPU /60FPS /native temporal acceptance: BLOCKED. STOP before4B.** Issue #1 remains open.

## Actual image evidence

- FullHD originals: [production clean](after-clean.png) · [production HUD](after-hud.png) · [neutral blockout](neutral-clean.png) · [neutral HUD](neutral-hud.png).
- [Neutral / production](comparison-blockout.png) · [iteration3 /4A clean](comparison-baseline.png) · [iteration3 /4A HUD](comparison-baseline-hud.png) · [film reference /4A](comparison-reference.png).
- [320px comparison](comparison-thumbnail.png) · [near](comparison-near.png) · [middle](comparison-middle.png) · [far](comparison-far.png) · [crop/thumbnail provenance](image-detail-provenance.json).
- [Independent image-only review](INDEPENDENT-REVIEW.md), [technical report](TECHNICAL-REPORT.md), [reproduction](REPRODUCE.md), [construction/failure history](construction/HISTORY.md).

All final originals are1920×1080, High/DPR1/4×MSAA, seed15515657, t12s. Canonical hero remains[−2.35,1.72,27.5]→[−13.5,1.78,61], verticalFOV64°. Baseline images are exact actual iteration3 files, not fabricated reconstructions. Layouts only place unchanged images beside one another.320px thumbnails use declared resampling; closeups are exact raw pixel crops. Earlier960×540 construction previews are explicitly separate from final evidence.

The neutral image is a true WebGPU render of the same geometry with uniform gray rough nonmetallic material, white existing-position lights, real shadows and a small neutral ambient. Fog/bloom and procedural material/IBL/emission are disabled only in that separate diagnostic HTML. The inherited legacy background stays colored. No production material/light/HDR changes are hidden in this diagnostic; [runtime geometry identity](verification/neutral-geometry-equality.json) and [source/overrides](neutral-source.json) bind it to the actual production mesh.

## Independent geometry/composition result

Fresh **GPT-6 Astra/high** viewed only the actual reference, final neutral/production clean/HUD and their320px thumbnails: seven image files, no source, earlier candidate, Issues or author rationale. **GEOMETRY: FAIL. COMPOSITION: FAIL. Basic spatial depth: PASS with limitations.** There are0critical,3major and2minor findings. The complete [independent review](INDEPENDENT-REVIEW.md) is preserved without author edits.

The remaining major issues are a large nearly blank right foreground mass, uneven hierarchy between large and middle forms, and a far architectural passage that does not read convincingly at320px. The critic recognizes thick octagonal language, volumetric equipment and perspective depth, but those strengths do not satisfy the complete4A gates. Material/light polish is discussed separately and was not used alone to fail geometry. No alternate camera was substituted for the canonical framing.

**ART DIRECTION: NOT ACCEPTED.** No application or artwork changes follow this first final review. The candidate is delivered for Adrian's decision, not presented as successful film-reference matching. **STOP before4B and before any further artistic revision.**

## Technical gates — actual final results

| Check | Result | Evidence |
| --- | --- | --- |
| Build / reproducibility | PASS;149,436raw /48,619gzip bytes; final SHA unchanged | [build](verification/build.txt), [artifact manifest](artifact-manifest.json) |
| `npm run RunAllTests` | **31/31 PASS**,0failed/skipped; prior27guards retained, removed-cabinet contact relocated to real replacement jamb | [final log](verification/build-and-tests.txt) |
| Browser smoke | **17/17 PASS**, including movement/pointer/menu/quality, audio interaction and offline `file:` | [report](verification/smoke-report.json) |
| Missing API /adapter /device rejection | **3/3 PASS**, visible errors and not-ready state | [fallback](verification/fallback-report.json) |
| Production/neutral FullHD and served identity | PASS; actual served SHA equals recorded HTML; no runtime/validation errors or external requests | [production](after-capture.json), [neutral](neutral-capture.json) |
| Neutral geometry matches production | PASS; runtime position/normal and surface-stream hashes match production identities | [identity proof](verification/neutral-geometry-equality.json) |
| Locked pipeline /other-sector content | PASS; all13locked runtime/style/template files byte-identical to iteration3; fixture mounting block identical | [source locks](verification/locked-sources.json), [fixture](construction/fixture-preservation.json) |
| Actual corridor clearance | PASS;4801route samples plus analytic guard give continuous lower bound0.6943m, greater than0.45m sphere; all saved poses and hero clear | [mesh distances](construction/actual-mesh-clearance.json), final test log |
| New upper-frame collision regression | PASS;1187manual cases, including exact mirrored discovered points checked against the whole corridor;1050shoulder/135soffit cases against changed frames | final test log, [history and scope](construction/HISTORY.md) |
| Other-sector image regression | PASS; views1/2/3/5 exactly identical. View6 differs29,644pixels only inside visible corridor, bbox[1521,410,1794,641]; outside pixels identical | [pixel report](sector-image-regressions.json), [hash-bound scope review](sector-scope-review.json) |
| Collider repair preserves artwork | PASS; all7actual final FullHD frames are RGB-identical to the superseded pre-collider capture | [exact comparison](verification/collider-only-image-equality.json) |
| Full route /presented goal | Functional **PASS**;65.8483s,13software frame samples, fresh goal presented at t60; no errors/requests | [route](route/browser-report.json), [log](verification/route-log.txt) |
| Physical GPU /60FPS /native temporal | **BLOCKED** | Explicit Google SwiftShader fallback/readback; no verified physical reference GPU |

[Final verification summary](verification/summary.json). Actual browser: Chrome151.0.7922.34,1920×1080 native render resolution/DPR1/4×MSAA, software offscreen WebGPU and CPU readback. Audio audibility is untested. Route intervals mean5001.08ms /p99 and max29548.90ms,0GPU timestamp samples. This is functional completion with sparse diagnostic frames, not smooth hardware performance or60FPS. Static art differences must not be blamed on missing hardware.

Actual linear RGBA16F values remain finite/nonnegative: scene max7.3671875 with1370RGB values>1; composite max5.7578125 with833values>1. Exposure remains1.35. These validate the unchanged HDR path on new geometry; they are not an art score.

## Scope, counts and resolved integration defect

Three layered closed octagonal thresholds, real service recesses, a pump/valve pocket and displaced cover replace the near bays. Quieter ceiling services, smaller/set-back supply runs and broad central walking plates reduce thin repetition. The far transition remains genuinely open into the unchanged hangar. Only corridor geometry/local collider data changes at runtime. Production lights, material shaders, probe, HDR/AgX/atmosphere, controls, seed, camera/FOV, poses and flight remain unchanged.

Root found a manual upper-shoulder collision gap after an initial green30-test run. The controller returned[2.85,4.26,34.77] unchanged within0.23685m of the new flange. The QA chain was deliberately stopped and preserved as [superseded evidence](construction/pre-collider-fix/SUPERSEDED.json), not mislabeled as an infrastructure outage or final PASS. Conservative local shoulder/soffit AABBs fix the new structural contact. Exact mirrored cases now have0.68m clearance to the whole mesh. No rendered geometry changed. All required checks/images were repeated on the final source. Retained small-fitting collision simplifications remain: dense manual-frame tests do not assert exact collision against every old overhead tray.

Drawn architecture:143,698triangles, down15,988from iteration3. Corridor:112,204triangles/336,612vertices,16,157,376geometry +10,771,584surface-buffer bytes. Resident architecture includes7,464undrawn old-corridor triangles deliberately retained/skipped in the unchanged legacy buffer; see technical report. Geometry/surface allocations decrease3,837,120bytes. Browser persistent GPU estimate268,368,208bytes plus8,294,400diagnostic CPU pixels excludes small uniforms, temporary readbacks and driver/browser overhead; it is not measured peak VRAM.

Final HTML SHA256: `872c37fff35e4e273b78c6f55a237df655396660c269ca8e56520fbbe155b412`.149,436raw /48,619gzip bytes (Node zlib level9), +8,925/+3,202versus iteration3. [Media identities](media-manifest.json) bind unchanged real images. Final neutral HTML has a separate identity and gzip archive; it is not the production artifact.

After the first independent final review, preserve this candidate without application/art changes. Documentation, Issue #4, main commit/push and remote identity verification are the authorized closeout. **STOP before4B and wait for Adrian's assessment.**
