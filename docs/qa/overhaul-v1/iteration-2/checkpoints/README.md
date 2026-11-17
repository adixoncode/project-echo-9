# Actual construction checkpoints

These are unchanged native WebGPU captures at the approved camera, seed 15515657, time 12 s, High, DPR 1, 4× MSAA and 1920×1080. They document construction within the authorized iteration 2; they are not separate art submissions or iteration 3. No scene pixels were retouched. Software offscreen readback cannot establish hardware or temporal acceptance.

| Stage | Standalone source SHA256 | Actual HDR readback | Images |
| --- | --- | --- | --- |
| Iteration 1 baseline | `aeb80e7100df3c58c4e916426285f6140c3b2e49882edc85972f43ffd7277db6` | Previous display-space composition; no matching scene-buffer diagnostic | [clean](../before-clean.png), [HUD](../before-hud.png) |
| HDR only | `a3d14e1f792053f0c9e9c965df76bfd26e7af84d448626c432e4d5362324e43e` | Maximum 81.9375; 1,929 RGB values >1; zero nonfinite/negative values | [clean](hdr-clean.png), [HUD](hdr-hud.png), [capture metadata](hdr-capture.json) |
| Relighting, before atmosphere/bloom | `041d16c3dcc0a859407cdc1b3a6cc13183ffa7409d74a91526d0ab0a6e21e7de` | Maximum 16.734375; 30,455 RGB values >1; zero nonfinite/negative values | [clean](relit-clean.png), [HUD](relit-hud.png), [capture metadata](relit-capture.json) |
| Final candidate | See final manifest | See final capture metadata | [clean](../after-clean.png), [HUD](../after-hud.png), [metadata](../after-capture.json) |

HDR-only removes per-material tone mapping and display-space corridor fog while retaining the old lighting/materials/geometry/probe. Relighting changes the source placement and energy using one light table; atmosphere and bloom are still off. Both stages use fixed exposure 1.35, and their actual scene/composite RGB readbacks match before post effects. The maximum alone is not a quality score: broad illumination can increase the number of HDR samples while reducing a tiny emitter peak.

`hdr-source.html.gz` and `relit-source.html.gz` contain the exact standalone files served for the captures, gzip-compressed with deterministic metadata. Decompress and serve them locally to inspect a stage. Their hashes refer to decompressed HTML. The accompanying JSON records source identity and flags.

HDR-only views 1/2/3/5 remain exactly pixel-identical to the baseline; view 6 changes in the visible corridor doorway. Final sector classification is recorded separately against the final artifact and image hashes. The independent final reviewer receives only the reference and final clean/HUD images, without this implementation rationale.
