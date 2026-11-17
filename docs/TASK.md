# Issue #1 — implementation record

Source: https://github.com/adixoncode/project-echo-9/issues/1

**Status: IMPLEMENTED — ACCEPTANCE BLOCKED.** Keep the GitHub issue open until the required hardware evidence is verified.

Owner approval: autonomous implementation and plan approved in the task conversation, including commit on `main` and push. Historical DRAFT labels in the archived specification do not revoke that approval.

## Delivered scope

- Original procedural native WebGPU/WGSL observatory, service spine and hangar in one continuous world; giant banded planet/rings, research instruments, catwalks, ship, gantry, dust and subtle drifting debris.
- Standalone offline HTML; readable source modules, deterministic world seed, build and `RunAllTests` alias, no external runtime libraries/assets.
- WASD/mouse/Q/E/Shift navigation, major-solid collision, Esc menu, six views, M audio, H telemetry, Low/Medium/High and deterministic60-second route.
- Real full-HD images, recorded diagnostic flight, independent media-only visual review with iterative fixes and actual timing reports.

## Gates

| Gate | Status | Evidence |
| --- | --- | --- |
| Build and RunAllTests | PASS | Reproducible build and actual test log in `qa/build-and-tests.txt` |
| Software browser smoke | PASS | `qa/smoke-report.json`:17 checks; `qa/fallback-report.json`:3 checks |
| Native GPU presentation smoke | BLOCKED | `qa/presentation-probe.json`:scene-independent offscreen clear passes, swapchain fails in cloud |
| B — independent visual/temporal acceptance | BLOCKED | Three independent review rounds; final stills only minor, camera obstruction fixed; smooth hardware flight unverified; see `qa/VISUAL-REVIEW.md` |
| C — reference desktop 60 FPS | BLOCKED | No hardware adapter/reference GPU; diagnostic metrics explicitly include CPU readback |
| Documentation, main commit and push | PASS | Delivered on `main`; Git history and Issue #1 contain the final commit reference |

## Deviations and limits

Explicit diagnostic `?readback=1` was added because both available headless Chromium versions failed native canvas presentation; it shows real pixels from the same WebGPU pipelines but adds substantial overhead. The shared desktop browser was unavailable. No hardware or60 FPS success is claimed. The hardware GPU remains unselected. Audio API interaction was tested; audible playback was not assessed in the muted headless browser. Artistic simplifications and remaining minor findings are documented in README and the visual review.

## Required follow-up

Select a named hardware-accelerated desktop GPU, run the default swapchain path at High/1920×1080, collect the six views and a smooth flight, repeat independent visual/temporal review, and attach the full60-second report. Only then resolve the required gates and close Issue #1.

Final artifact: 68,058 raw bytes / 24,346 gzip bytes. The SHA256 and measurements are recorded in `qa/artifact-manifest.json` and `qa/browser-report.json`. The final route completed in 60.1838s; no runtime errors were observed.

## Visual-direction follow-up — Issue #2
On 2026-11-16 Adrian rejected the achieved art direction (despite clean unit/browser checks). [Issue #2](https://github.com/adixoncode/project-echo-9/issues/2) governs a reference-first cinematic service-corridor proof of look. The comparison images are documented in [docs/references/](references/README.md). No runtime implementation change or hardware acceptance is implied by reference upload.


## Issue #2 — first candidate delivered, 2026-11-17

Only corridor iteration 1 was approved. It adds independently generated heavy architecture, geometric shadows and actual-room GGX environment reflections. Original flight and other-sector geometry/material/RNG data are preserved. Four sector frames are identical; the remaining hangar frame differs only at the visible corridor entrance.

Build/RunAllTests 15/15, browser smoke 17/17 and fallback 3/3 PASS. Artifact105,761 raw / 34,927 gzip. Actual1920×1080 clean/HUD renders, reference comparison, regression evidence and independent review: [iteration 1 results](qa/overhaul-v1/iteration-1/RESULTS.md).

**Reference-match review FAIL; ART DIRECTION NOT ACCEPTED.** Architecture improved, but exposure/light hierarchy and the visual effect of shadows/reflections remain below reference. This static image shortcoming is not attributed to missing hardware. GPU/temporal gates remain BLOCKED. This historical first-candidate stop was lifted only for iteration 2 by Adrian on 2026-11-17. The first image remains unaccepted. Issue #1 remains open.


## Issue #2 — iteration 2 delivered for owner review, 2026-11-17

Cinematic Lighting & HDR Overhaul is preserved and verified after recovering the same Cloud environment. No source/art changes followed the independent review. The final artifact is 128,893 raw /41,027 gzip bytes; source SHA256 and all actual captures are recorded in [iteration2 results](qa/overhaul-v1/iteration-2/RESULTS.md).

Fresh build/RunAllTests 24/24, smoke 17/17, fallback 3/3 and four feature-off diagnostics PASS. Fresh clean/HUD and all five sector captures are pixel-identical to the preserved candidate. Four sector views remain identical to iteration1; view6 differs only at the visible corridor entrance. Legacy content/RNG, all saved poses and flight remain unchanged. The same-source full route completed functionally in63.2297s with12 software frames.

**Reference-match: FAIL. ART DIRECTION: NOT ACCEPTED. Hardware GPU /60FPS /temporal acceptance: BLOCKED.** The independent reviewer identified five major and three minor artistic differences; full review is preserved. Documentation, AGENTS and Issue #2 record these limits. Both issues remain open. STOP before iteration3 and wait for Adrian's assessment.

## Issue #3 — iteration 3 delivered for owner review, 2026-11-17

Adrian separately approved iteration3, superseding the historical iteration2 stop only for this corridor candidate. The P0 red-wall discontinuity was traced with actual GPU shadow depth and geometric diagnostics to a mounting ear clipped at the shadow near plane. Its physical correction preserves real occlusion. Six procedural material families, structural wear, filtered detail/GGX AA, restrained relighting, source-attenuated atmosphere and evaluated AgX transfer remain native WebGPU/WGSL in one offline HTML. No observatory/hangar overhaul, camera/route/collision or legacy content/RNG changes.

Build/RunAllTests27/27, smoke17/17, fallback3/3, transfer calibration, final P0 verification, four feature-off cases and scope-reviewed sector pixels PASS. Four other-sector views are identical; view6 changes only the visible corridor entrance. Full route functional PASS62.4579s/13software frames and a confirmed presented t60goal. ActualFullHD clean/HUD, matched P0 crops, same-light material stages, final grade/AA A/B, source hashes and limits are in [iteration3 results](qa/overhaul-v1/iteration-3/RESULTS.md). Artifact140,511 raw /45,417 gzip bytes.

Fresh media-only GPT-6 Astra/high review: **reference-match FAIL**,0critical/4major/3minor. Main remaining gaps: clean materials, schematic architecture, graphic lighting/glow and atmospheric depth. No application/art changes follow that review. **ART DIRECTION: NOT ACCEPTED. Hardware GPU /60FPS /native temporal acceptance: BLOCKED.** Issue #1 and Issue #3 remain open. Approved closeout: main commit/push and Issue #3 update. **STOP before iteration4; wait for Adrian's assessment.**

## Issue #4 — phase4A candidate delivered for owner assessment, 2026-11-17

Adrian separately approved corridor set-design phase4A, superseding the historical iteration3 stop only for geometry/local integration. Three thick layered octagonal thresholds, real maintenance recesses/pump/valve/cover, calmer floor/ceiling and set-back services preserve the exact hero/seed/poses/route and native procedural offline HTML. Production material shaders, lighting/HDR/atmosphere, renderer and other-sector content are unchanged.

Build/RunAllTests31/31, smoke17/17, fallback3/3, source/neutral-geometry identity and scope-reviewed pixel regressions PASS. An upper-frame manual-collision gap was found, preserved and fixed before finalQA without changing pixels;1187manual regression samples supplement continuous route clearance>0.6943m for0.45m camera. Full route functional PASS65.8483s/13software samples and confirmed presented goal. Four other-sector views are identical; view6 changes only29,644visible-corridor pixels. Artifact149,436raw /48,619gzip bytes;143,698drawn architecture triangles. See [actual FullHD neutral/production evidence and QA](qa/overhaul-v1/iteration-4a/RESULTS.md).

Fresh image-only GPT-6 Astra/high: **GEOMETRY FAIL, COMPOSITION FAIL; basic depth PASS with limitations**,0critical/3major/2minor. Dead right foreground mass, uneven form hierarchy and weak distant-passage readability remain. Material/light commentary is separate. No art/application changes follow this first final review. **ART DIRECTION: NOT ACCEPTED. Physical GPU /60FPS /native temporal: BLOCKED.** Issue #1 and Issue #4 stay open. Approved closeout: main commit/push, verified remote identities and Issue4update. **STOP before4B; wait for Adrian.**

## Issue #4 — phase4B, three-round handoff for Adrian, 2026-11-17

Adrian explicitly authorized4B and superseded the historical4A stop. Four unchanged-scene camera alternatives and their neutral/320px images were independently compared first. Three subsequent artistic rounds were reviewed and archived. **The cinematic target remains unmet.** Fresh image-only Astra rejects round3/C3 and prefers the stronger existing round2/C2; its major composition/material shortcomings remain. The third-round same-mesh lighting A/B also failed to justify adoption. No fourth round was started; material microdetail was deferred while major composition problems remained.

Selected C2 integrates closed stepped castings, a deeper service recess, revised floor/ceiling hierarchy, near-frame restaging and an offset intermediate portal. `?shot=4b` opens the selected52° shot without replacing the original six64° views or route. Final production/neutral PNGs exactly reproduce the reviewedC2 pixels. Only corridor geometry and main camera/provenance code change; all production lights/material/HDR/post and legacy content remain byte-identical to4A. No additional renderer complexity adopted.

Literal build/RunAllTests32/32, smoke17/17, fallback3/3, actual mesh/route/P0/HDR checks and sector regressions PASS. Views1/2/3/5 are identical; view6 changes23,937pixels only within the visible corridor entrance. Functional full route66.6215s/12software samples and a presentedt60goal; no hardware performance claim. Artifact155,723raw/50,660gzip bytes, SHA256`0fc1512a4a9083893a30235dbe4cd35e20f9fe7f1833ff5dd73200b69c5e6e87`.

See [full QA and actual renders](qa/overhaul-v1/iteration-4b/RESULTS.md), [artistic ledger](qa/overhaul-v1/iteration-4b/ARTISTIC-LEDGER.md), [technical report](qa/overhaul-v1/iteration-4b/TECHNICAL-REPORT.md) and [reproduction](qa/overhaul-v1/iteration-4b/REPRODUCE.md). All candidates and failed/rejected experiments remain available. A brief environment transport interruption recovered without resetting or losing work.

**Independent reference review:FAIL. ART DIRECTION:NOT ACCEPTED. Hardware GPU/60FPS/native temporal:BLOCKED.** Issue#1 and#4 remain open. Authorized closeout:documentation/Issue4 update, main commit/push and SHA verification. **STOP for Adrian; no fourth round or later phase without separate approval.**
