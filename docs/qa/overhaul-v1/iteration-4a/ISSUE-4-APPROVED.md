# PROJECT ECHO-9 — Iteracja 4A: Cinematic Corridor Set Design & Architectural Blockout

**STATUS: APPROVED FOR PHASE 4A by Adrian on 2026-11-17.** This approval follows the owner's review of iteration 3 and authorizes **a substantial, corridor-only set-design/geometry redesign**, still using native procedural WebGPU/WGSL. It supersedes iteration-3 STOP **only for this limited phase**. It does **not** authorize a subsequent materials/lighting Phase 4B, iteration 5, observatory/hangar overhaul, external assets, or an artistic PASS.

## Baseline and artistic objective

- Current code: [main 8726d38](https://github.com/adixoncode/project-echo-9/commit/8726d3817ccebc3cb1d4e132bb0dc9a8a515b990).
- Current actual still: [iteration-3 clean](https://github.com/adixoncode/project-echo-9/blob/main/docs/qa/overhaul-v1/iteration-3/after-clean.png); [target side by side](https://github.com/adixoncode/project-echo-9/blob/main/docs/qa/overhaul-v1/iteration-3/comparison-reference.png); [independent FAIL review](https://github.com/adixoncode/project-echo-9/blob/main/docs/qa/overhaul-v1/iteration-3/INDEPENDENT-REVIEW.md).
- Target photo: `docs/references/target-red-corridor.jpg` (reference only, never runtime).
- **Problem:** despite three successful technical iterations, the actual composition is too regular, too clean and visually shallow. A large blank dark right mass, repeated thin panels/grilles and long pipes compete with the deeper, thick octagonal structural silhouette and layered industrial complexity of the target.
- **Goal of this phase:** one compelling **architectural silhouette and spatial composition** (large/medium shapes) that works even in an untextured blockout. No claim of film-quality completion until Adrian approves a real image.

## Boundaries — essential

- **Only corridor scene geometry and immediately necessary local staging**. Preserve legacy observatory/hangar mesh, lights/materials/RNG and image pixels, existing controls, navigation/collisions, six saved poses, 60-second flight, offline one-file output and no external/network assets.
- Keep native WebGPU/WGSL/JS; procedural geometry. Existing HDR/AgX, red-light P0 fix, material families and atmospheric pipeline are **technical baselines**; do not embark on another lighting/materials/shader overhaul in Phase 4A. Correct minor integration issues only if necessary and document them.
- Do not hide geometry swaps behind a camera threshold. The redesigned set must be genuine traversable world geometry compatible with the flight path. Maintain real occlusion, camera clearance and collisions.
- Current canonical comparison: seed **15515657**, t=**12s**, High, DPR1, 4×MSAA, **1920×1080**, hero camera position **[-2.35,1.72,27.5]** toward **[-13.5,1.78,61]**, vertical FOV**64°**. Preserve this exact camera for reproducible before/after. **Optional** alternate art-direction camera/framing may be proposed separately, with images and route compatibility, but may **not silently replace** the original saved hero or other six poses without owner approval.
- Prior evidence under `docs/qa/overhaul-v1/iteration-{1,2,3}/` stays untouched. High-quality art takes priority over optional 100KB gzip/raw goals; still record sizes.
- Before edits read AGENTS, Issues #1–#4 and source/reference image(s). Record the new owner authorization in AGENTS during implementation; keep historical STOPs as history.

## Step 0 — visual breakdown before geometry

Write a concise image-first breakdown of the actual target and actual iteration-3 screenshot, independent of code rationale:
- Large shapes / silhouette: thick octagonal entry and nested pressure ribs, inset side cavities, strong foreground framing.
- Middle forms: believable utility cabinets, pipe risers/valves, service hatches and cable trays arranged by function, not merely repeated as ornament.
- Negative space and scale: path width/height, clear traversable center, near/mid/far separation; foreground darkness should frame meaningful depth, not consume a blank half-frame.
- Direction of attention: perspective lines and occasional lights lead from a heavy near threshold toward a softer distant vanishing region; no flat visible terminus.
- State a 3–5-item art-direction checklist to review at **thumbnail size**, before small scratches or fog are considered.

## Phase 4A implementation — cinematic blockout / set construction

- Rebuild the **nearest 2–3 meaningful corridor bays** as hero-quality procedural architectural forms. Thick physically layered octagonal pressure frames with web/flange depth, inset mechanical channels, diagonal transitions and asymmetrical, functional service details.
- Carefully reduce, reroute or consolidate visually dominating **thin repeated ceiling bars**, giant polished pipe bundles and uniform floor striping. Do not simply multiply polygons or add random 'greebles'. Preserve functional plausibility and human scale.
- Introduce intentional non-repetition: one open service recess / maintenance cavity, a believable damaged cover, a junction/valve cluster or other grounded landmark (choose only what supports composition). The rest of the corridor may reuse lower-cost modules with consistent structure.
- Place a credible layered depth/transition toward the far end without a visually flat hard 'wall' or fake matte-painting; preserve real corridor clearance through to the other sector.
- Maintain industrial dark blue/steel + cool/red **only for comparison**, not as a substitute for silhouette. Use a **neutral/untextured or neutral-material diagnostic render** plus a second render using the existing production lighting/materials. The neutral image must reveal silhouette, actual mass, occlusion and near/mid/far shapes.
- Do not change the hero look by globally increasing HDR, bloom, fog, exposure or post effects.

## Objective visual gates

1. **Geometry gate (primary):** at 320px thumbnail the near frame, middle structural layers and distant passage are distinguishable. At full HD the first bays show real thickness, recessed voids, functional layering and cast occlusion, instead of flat panels + rails.
2. **Composition gate:** no visually dead giant featureless foreground slab; the eye is guided into the red distant space. The pressure arch/octagon reads as a defining silhouette rather than narrow bright edges. Show whether current framing prevents this and provide an optional alternate camera only as a documented proposal.
3. **Depth gate:** at least 3 readable spatial planes from geometry/contrast before adding stronger fog.
4. **Scope/regression:** no non-corridor changes except the visible corridor entrance in adjacent views, preserved deterministic scene and route/collision.
5. **Review:** an independent critic gets only the true reference and true neutral/final images, without implementation rationale. Evaluate geometry and composition *separately* from surface/shader polish. Technical PASS is not visual acceptance.

## Deliverables for one approved candidate — then STOP

Archive to `docs/qa/overhaul-v1/iteration-4a/`:
- original iteration-3 vs redesigned same-camera 1920×1080 **clean** and **HUD**;
- true neutral/material-reduced blockout and production-lit result (not generated/retouched stills);
- side-by-side to original target and 320px thumbnail comparison, plus focused near/mid/far closeups;
- shape/occlusion/clearance notes, counts of triangles/bytes/expected GPU memory and practical performance limits;
- independent image-only reviewer report with `PASS/FAIL` on **geometry/composition**, and a separate noncommittal note about remaining material/lighting gaps.

Required technical closeout per AGENTS:
- `npm run build` → green `npm run RunAllTests`, smoke/fallback, reference QA, six view/regression comparison, actual route and collision checks; no unverified performance promises.
- Update `AGENTS.md`, Issue #4 and relevant task/QA documentation; commit approved code to `main`, `git push`, verify remote commit SHA and final HTML hash. Mark native physical GPU/60FPS/temporal **BLOCKED** until measured.
- **STOP after first reviewed blockout candidate** for Adrian's explicit assessment. Even if all technical gates pass, no Phase 4B material/lighting refinements or another art iteration without owner sign-off.

## Assigned workflow
GPT-6.1 Sol high reasoning for implementation. A distinct GPT-6 Astra reviewer receives only actual images and reference. The owner, Adrian, is final art director. Do not describe the iteration-4A image as film-quality / approved until Adrian actually reviews it.
