# Noniv/web-ocean — evaluated techniques and provenance

Source reviewed read-only at commit `a07c7fd522ef0a897601c114f927a49d93d95520` of [Noniv/web-ocean](https://github.com/Noniv/web-ocean/tree/a07c7fd522ef0a897601c114f927a49d93d95520). Its LICENSE is MIT, copyright (c) 2026 Maksymilian Dendura. No upstream checkout is modified and no upstream runtime asset is used.

| Source | Relevant principle | Implemented ECHO-9 evaluation |
| --- | --- | --- |
| `js/wgsl/ocean.js`, lines 141–155 | Unresolved slope variance and screen derivatives widen the specular distribution when detail becomes subpixel | Surface-specific metal roughness and specular AA; compare against AA disabled at identical lighting. Do not copy ocean-specific LEAN coefficients or water Fresnel. |
| `js/wgsl/sky.js`, lines 238–254 | Suppress procedural octaves according to projected pixel footprint before they alias | Filter grime/brushing/micro-normal detail rather than add arbitrary high-frequency noise. |
| `js/wgsl/sky.js`, lines 323–378 | Footprint-aware edge reconstruction and gradual transmittance/contrast loss | Evaluate bounded corridor air and receiver-aware reconstruction, without cloud geometry or sky LUTs. |
| `js/wgsl/post.js`, lines 78–127 | AgX highlight handling, saturation/white balance, small triangular dither | Actual same-candidate A/B against existing ECHO-9 tone curve, after lighting/material work. Restrict to corridor; retain exact legacy display bypass. Prefer spatially stable dither for deterministic captures. |

The FFT waves, seawater transport, cloud layers and sky/atmosphere LUTs are unrelated to this enclosed station and are excluded. Source inspiration is not proof of better art. Final FullHD comparisons are bound to source SHA8e6cec19… in [final-ab.json](final-ab.json): [AgX / legacy](comparison-grade.png), [detail AA on / off](comparison-aa.png). The restored default is pixel-identical to the initial default and authoritative final clean image. AA comparison holds the same AA-on room probe constant and isolates live receiver filtering; temporal stability remains BLOCKED.

AgX inset/outset matrices and polynomial contrast fit are substantially adapted from the pinned upstream post.js. The complete MIT notice is retained in src/corridor-post-shaders.js, the generated offline HTML and [THIRD_PARTY_NOTICES](../../../../THIRD_PARTY_NOTICES.md). The industrial-material derivative/footprint filtering, bounded medium and source-path integration are original ECHO-9 adaptations of principles, not copied ocean/sky simulation.

AgX is retained for this candidate after actual same-buffer A/B; the transfer changes highlight/color relationships but does not establish reference-relative artistic success or repair geometry/material shortcomings. Encoded RGB differences are in [final-ab-pixels.json](final-ab-pixels.json); these are contribution measurements, not scores. The production transfer function also passed [GPU calibration](tone-capability-probe.json) against independent CPU expectations with no double gamma. No claim about hardware performance or motion shimmer follows from these static images.
