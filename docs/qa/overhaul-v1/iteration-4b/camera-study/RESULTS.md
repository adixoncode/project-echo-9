# Phase4B camera study — gate1

**CAPTURE PASS; CAMERA SELECTION WAITING.** Actual4production and4neutral FullHD images are archived. No geometry, material, lighting, atmosphere, P0 fixture or other-sector edit has begun. Independent image-only review and parent selection remain required before any artistic scene change.

| Shot | Position | Target | Vertical FOV | Actual-mesh eye clearance |
|---|---|---|---:|---:|
| A / historical4A |[-2.35,1.72,27.5]|[-13.5,1.78,61]|64°|1.2687m|
| B / axial |[0,1.72,26]|[0,1.75,65]|52°|1.6550m|
| C / asymmetric |[-1.2,1.72,25.6]|[-8.5,1.76,62]|52°|1.6425m|
| D / further bay with foreground frame |[1,1.74,32.1]|[-2,1.77,67]|54°|1.6732m|

Each eye has more than0.45m clearance to the exact112204triangle4A corridor mesh. Saved six poses and complete route are unchanged. New `setCameraShot` support in `src/main.js` derives projection and ray tangents from one per-shot vertical FOV; saved views and flythrough reset to64°.

A is **RGB pixel-identical** to historical4A in both production (`after-clean.png`) and neutral (`neutral-clean.png`), proven in `image-provenance.json`. All archived baseline source files are byte-identical except `src/main.js`. Standalone production SHA256: `0cd6ee258c80c7981d825a0310b866414d614decc3a3426beba628a10e8e2da7`.

Actual captures: native WebGPU/WGSL on Chromium151 software SwiftShader,1920×1080, High, DPR1,4MSAA, time12, seed15515657. Both mode reports record zero browser errors and zero external requests. Actual saved-view and route FOV reset checks PASS at64° in both modes. Separate neutral diagnostic retains exact same geometry/source positions/powers/cones/shadows and disables fog/bloom; explicit material/light-color overrides are recorded in `neutral-source.json`.

Media: `production-{A,B,C,D}.png`, `neutral-{A,B,C,D}.png`; `camera-contact-sheet.png`; early media-only `production-contact-sheet.png`; nine320×180 images in `thumbnails/`. No scene-image grading, sharpening or retouching was applied. `source/`, compressed standalone artifacts, source/image hashes, native runtime reports and actual-mesh clearance preserve provenance.

Build/RunAllTests31/31 PASS; raw log: `build-tests.log`. Hardware GPU/60FPS/native temporal acceptance remains **BLOCKED**. These are static software diagnostic renders, with no hardware performance claim.
