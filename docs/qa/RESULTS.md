# QA results — PROJECT ECHO-9

**Acceptance remains BLOCKED.** Build/unit checks and software browser diagnostics have passed. Native presentation, hardware temporal stability and the agreed desktop 60 FPS target are not verified. Do not close Issue #1 as complete on this evidence.

## Verified checks

- Reproducible standalone build; no external runtime resources.
- `RunAllTests` / `npm run test:all`: 10 tests passed on the final source, including repeated wall-collision pushes and safe route clearance.
- Browser smoke: 17 checks passed, including actual pointer lock, mouse look, movement/ascent, menu, telemetry, quality switching, audio toggle and standalone `file:` execution with network offline. Audio audibility was not tested in the muted headless environment.
- Missing WebGPU API, null adapter and failed device creation: 3 browser checks passed with visible diagnostic messages.
- Six actual 1920×1080 High images and a full 60-second diagnostic flight collected. All three sectors appear in recorded route states; no runtime errors or external requests were observed.

The final native startup check also confirms the presentation failure is visible and `ready` stays false (`native-startup-report.json`). Initial shader syntax and flight-obstruction defects were caught in actual browser/media review and fixed; earlier failures remain archived. The collector now waits for route completion explicitly rather than assuming a 60-second timer means the last slow frame has completed.

Evidence is machine-readable in `browser-report.json`, `smoke-report.json`, `fallback-report.json` and the archived iteration reports. Image/recording reviews and fixes are tracked in `VISUAL-REVIEW.md`.

## Environment limitation, independently isolated

Cloud Linux exposes no `/dev/dri`. Default Chromium has no WebGPU adapter. Explicit diagnostic flags expose Google SwiftShader (`isFallbackAdapter: true`). System Chromium156 and bundled Chrome for Testing151 both fail the native canvas swapchain. The minimal reproduction in `scripts/gpu-presentation-probe.mjs` uses no scene code: an offscreen magenta clear returns the exact expected pixel, while the swapchain path fails with `A valid external Instance reference no longer exists`. Shared desktop access returned `Browser runtime unavailable`.

Actual diagnostic images use explicit offscreen readback of the same WGSL shaders. This adds GPU copy, mapping, CPU BGRA conversion and canvas upload. It preserves scene content but cannot establish native hardware performance. The application does not silently select this mode for users.

## Measured diagnostic performance

Final artifact: Chrome for Testing151.0.7922.34, headless, Linux, Google SwiftShader, High, 1920×1080 CSS and render resolution, DPR1, scale1.0, 4× MSAA; offscreen readback enabled. One QA browser ran the benchmark; recording was enabled. Encoding and other browser smoke checks ran afterward.

| Measurement | Actual value |
| --- | --- |
| Route wall duration | 60.1838 s |
| Frame samples | 41 |
| Mean frame interval | 1447.10 ms |
| p99 frame interval | 2716.60 ms |
| Maximum frame interval | 2716.60 ms |
| GPU timestamp samples | 2, sampled every 30 rendered frames |
| GPU mean / p99 / max | 1120.20 / 1586.80 / 1586.80 ms |
| Hardware60 FPS acceptance | **BLOCKED** |

The two timestamp samples are sparse diagnostic observations, not a robust GPU percentile estimate. The route's `status: PASS` means it completed; it does not mean the 60 FPS or visual temporal gate passed. The visibly stepped recording remains an unresolved above-minor visual finding in this environment.

## Follow-up required

Run default native presentation on a named hardware-accelerated desktop Chrome/Edge. Select that GPU as the reference, capture six fixed views and a smooth flight, re-run the independent image/temporal review, and attach the 60-second report with mean/p99/max and timestamps when available. Evaluate the 60 FPS target against that real setup. Keep gates open until the evidence supports PASS.


## Artifact and remaining visual findings

`index.html`: **68,058 raw bytes / 24,346 gzip bytes**, SHA256 `5452f9efca7e83dc52dfb293522f297ff8172aab8df3491b04317160b9b68f2e`. The final report matches this exact artifact. Estimated explicit GPU allocation in High/readback: 88,567,712 bytes; preallocated diagnostic CPU ImageData: 8,294,400 bytes. Browser/driver internal allocations are not measured by these estimates.

Three independent media-review rounds resolved ring moiré, HUD readability, stale flight labels and camera obstruction. Final still images have only minor findings. The moderate stepped-motion finding remains BLOCKED for hardware follow-up; no overall visual gate PASS is claimed. Full capture includes six-view setup then the route; short MP4 is a 5× speed excerpt without frame interpolation.
