# Final verification after Cloud recovery

The original workspace was recovered intact. The runtime is the exact reviewed candidate, SHA256 `8d0da9eb540d3373eee1a33fecd49381d46e64c797afb6dd28c0c76ebe8a3e08`; no implementation/art changes were made during recovery.

- `source-integrity.json`: 35 source/script/test/package/index files match the preserved workspace snapshot byte for byte.
- `build.txt`, `build-and-tests.txt`: explicit build and RunAllTests, 24 PASS.
- `smoke-report.json`, `fallback-report.json`: 17 and 3 PASS, respectively; actual command logs are alongside them.
- `after-capture.json`: fresh High/DPR1/4×MSAA/1920×1080 renders at the approved camera/seed/time, HDR texture diagnostics and zero runtime/external-request errors.
- `sector-recheck.json`: five fresh sector frames exactly match the preserved candidate; four are also identical to iteration 1 and view6 changes only in the previously inspected corridor doorway.
- `hero-recheck.json`: fresh clean/HUD images exactly match the preserved images supplied to the independent reviewer.
- `feature-ablations.json`, `feature-contribution-checks.json`: four actual feature-off renders; source hash, intended flag and nonzero pixel contribution verified.
- `closeout-checks.json`: final audit of the source/evidence identity and required results.

The parent `route/browser-report.json` preserves the actual same-source 60-second route: functional completion in 63.2297s with 12 rendered software frames. This is not a hardware FPS or smoothness PASS. The unabridged independent review remains reference-match FAIL. ART DIRECTION: NOT ACCEPTED; Hardware GPU / 60 FPS / temporal gates: BLOCKED. STOP before iteration3.
