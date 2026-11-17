# First-candidate review protocol

Only iteration 1 is authorized. The implementation agent prepares and technically validates a single candidate; shader/initialization defects are corrected before independent review. No second artistic iteration follows the review without owner approval.

The independent reviewer receives the actual target-red-corridor reference and the exact final clean render, plus HUD render/comparison if useful. No source, feature descriptions or author rationale are sent. Assess the relative artistic gap in architecture, composition/scale, lighting/shadows, material/environment-reflection credibility and atmosphere. Separate that judgment from technical defects.

The owner alone accepts the art direction. Even a positive reviewer assessment is not owner sign-off. Record concrete remaining gaps and do not describe the visual overhaul as artistically complete.

Technical checks: build and RunAllTests; exact observatory/hangar geometry/material hashes and world RNG; five matched old/new sector images; browser controls/presets/offline/error handling. Differences in a visible corridor doorway may be an intentional consequence of the approved corridor changes; classify their spatial footprint explicitly. Any unexplained changes outside that footprint are failures.

Feature-off images demonstrate actual shadow and actual-room environment contributions at identical camera/time. They are diagnostics of the same build, not alternate artistic candidates. Luminance measurements describe images; they do not establish visual acceptance.

Native hardware60 FPS and temporal acceptance remain BLOCKED. All static candidate evidence is actual WebGPU rendering through the documented software offscreen readback mode.
