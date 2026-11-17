# Technical defect before independent review

Source SHA256: `ba393412194922422935c9cd493252e2d0bb3f3990df112bda11dce62c6d0abb`.

Actual FullHD captures reveal curved bands on the red-lit left wall. The bands persist with atmosphere disabled and disappear with shadow lookups disabled. A ray test against actual triangles confirms unobstructed primary-light visibility at pixels [290,480], [300,490], [310,510] and [320,520], on the flat panel around worldx3.82/z45.06–46.38. The curved pattern is erroneous receiver self-shadowing, not valid occlusion or volume banding.

Preserved before the independent final art review. The targeted repair separates geometric/shading normals and corrects PCF receiver-plane depth. It must retain actual caster shadows, authored lighting, camera and route. These files are failure evidence, not a second art submission or iteration3.

The reproducible CPU ray diagnostic was regenerated against the repaired artifact (see its explicit source hash) using unchanged corridor geometry and light data. It is a triangle-visibility check, not a GPU render or a timing measurement.
