# Verification plan

The approved baseline is Issue #1, archived in `docs/ISSUE-1.md`. No reference desktop GPU has been selected. Keep hardware acceptance separate from software diagnostics.

## A — correctness

1. Rebuild twice; compare exact HTML bytes. Confirm no external runtime requests or assets.
2. Run `npm run test:all` / `RunAllTests` and record its actual output.
3. Browser startup with WebGPU, shader validation, six saved camera views and all three sectors.
4. Camera movement, pointer lock, collision bounds, Esc menu, quality presets, audio after interaction, mute and stats.
5. Missing `navigator.gpu`, null adapter and device initialization errors must display actionable messages.
6. Offline reload of the standalone file; no server-side runtime required.

## B — image

Capture six fixed views at 1920×1080 and a short deterministic flight recording. Give a separate critic only the rendered evidence, no source or author commentary. Log concrete severity-ranked defects, fix defects above minor and re-review. A software render review is diagnostic evidence; disclose that hardware stability remains unverified.

## C — performance

Run the deterministic 60-second flight at High, 1920×1080. Record wall duration, sample count, mean/p99/max frame time, browser, adapter, quality, actual render resolution and timestamp-query measurements when available. A fallback adapter never establishes the 60 FPS hardware target. Explicit PASS / FAIL / BLOCKED per gate.

## Initial environment discovery

- Node 24.22.1, npm 11.9.0, Chromium 156.0.8078.79, Playwright available in the managed runtime.
- `/dev/dri` absent. Default Chromium exposes WebGPU but returns no adapter.
- Diagnostic Chromium flags `--enable-unsafe-webgpu --use-angle=swiftshader` provide vendor `google`, architecture `swiftshader`, `isFallbackAdapter: true`; `timestamp-query` is exposed.
- Hardware performance gate: **BLOCKED**. Safe next step: run the committed reproducible benchmark on a named hardware-accelerated desktop Chrome/Edge and attach its report.

## Presentation isolation

A minimal scene-independent magenta clear succeeds in an offscreen texture and fails through the native canvas swapchain in this cloud environment. `scripts/gpu-presentation-probe.mjs` records the expected/actual pixel and error. Both system Chromium 156 and Playwright Chrome for Testing 151 showed the presentation issue. The shared desktop browser tool also returned `Browser runtime unavailable`.

For useful image diagnostics we added explicit `?readback=1`: the same WGSL pipelines render to an offscreen texture with actual GPU pixels copied to a 2D canvas. Frame statistics explicitly include the additional copy/map/conversion/upload overhead. This does not replace native presentation acceptance. Evidence collector now waits for an actually presented frame after each camera switch and rejects nearly uniform/blank images using a pixel-variance probe.
