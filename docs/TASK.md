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
On 2026-11-16 Adrian rejected the achieved art direction (despite clean unit/browser checks). [Issue #2](https://github.com/adixoncode/project-echo-9/issues/2) governs a reference-first cinematic service-corridor proof of look. The comparison images are documented in [docs/references/](../references/README.md). No runtime implementation change or hardware acceptance is implied by reference upload.
