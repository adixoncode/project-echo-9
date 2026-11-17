# What each diagnostic actually switches

All four final feature-off images are actual fixed1920×1080 renders of the same HTML. They isolate contributions rather than promise that a named subsystem has no indirect cached influence.

| Image / switch | Disabled | Retained |
| --- | --- | --- |
| `no-shadows.png`, `shadows=0` | Live direct-surface and volumetric shadow-map lookups | The startup room probe is baked with geometric shadows before the live flag is applied. Thus reflected/probe-bounce shadow information remains. |
| `no-environment.png`, `probe=0` | Surface specular/diffuse environment IBL | Low-energy probe-derived volume bounce. This is receiver IBL off, not every environment term off. |
| `no-atmosphere.png`, `fog=0` | Volume composition/transmittance/scattering | Surface lights, shadows, probe and bloom. |
| `no-bloom.png`, `bloom=0` | Final HDR bloom contribution | Other lighting, atmosphere and display transfer. |

These switch scopes were checked against source at final SHA8e6cec19… without changing the frozen candidate. `image-measurements.json` establishes that each contributes actual pixels; it does not award artistic acceptance. The targeted P0 emitter-only/atmosphere-off/shadow-off evidence separately identifies the direct-light edge, actual shadow depth and real casters. It is not inferred solely from a full-scene feature toggle.

The grade/detail-AA A/B uses runtime diagnostic setters and waits for two freshly presented frames after each state. Grade changes only the final curve. Detail AA changes live procedural filtering/GGX widening while holding the same AA-on baked environment constant. Restoring default yields exact RGB equality. Motion shimmer and hardware performance are not tested by this static A/B.
