# Phase 4B — approved scope and execution ledger

Owner: Adrian. Authorization: explicit chat approval on2026-11-17 following the read-only 4B plan. Baseline main:d51f4f55a3c1eeb753bda92e518ec2700db8d1ac. Initial working tree was clean.

## Additional owner conditions

1. First render four cameras on the existing geometry with unchanged production materials/lighting; show actual FullHD,320px thumbnails and independent reference comparison. Only then select the composition redesign.
2. Additional probes, expensive shadows and new effects require a controlled A/B demonstrating meaningful visible improvement. Renderer complexity is not the objective.

The first camera study is a prerequisite within the composition work, not permission for an extra fourth artistic round. At most three reviewed artistic rounds are authorized. If composition fails, spend the remaining round(s) on it before material polish. Stop after delivery, even if the art gate remains FAIL.

## Intended sequence

- Camera study: historical, axial, reference-inspired asymmetric and director framing; eyeheight approximately1.65–1.80m; coherent FOV/projection/ray reconstruction; four unchanged-scene production and neutral images at1920x1080. Fixed seed15515657,time12,High,DPR1,4xMSAA.
- Round1: choose direction based on these images and independent review; redesign actual near/mid construction hierarchy and far passage while preserving route. Judge neutral and production at FullHD and320px.
- Round2: only after composition gate, improve cool/red tonal hierarchy, actual light visibility/reflections and restrained atmosphere. Otherwise repair remaining major composition findings.
- Round3: only after earlier gates, structural material wear, differentiated roughness/metal response and filtered detail. Otherwise resolve earlier major findings. Archive failure honestly if the limit is reached.

Preserve existing linear HDR, GGX, AgX, geometric shadows, source/view-path atmospheric extinction and P0 emitter fix. Candidate targeted improvements include local probe coverage and semantic wear masks, but extra probes/shadow cost/effects are not adopted without A/B evidence. Keep all prior images/source archives.

## Reference/source analysis informing the plan

- Current4A large empty right mass and ambiguous far passage remain visible in neutral imagery. Camera64deg vertical FOV exacerbates near/far scale differences. Large frame faces need middle-scale construction and actual edge shaping.
- Eight lights have two shadowed keys; one local cubemap covers the long corridor and excludes parts of new recesses from its projection bounds. Octagonal frames currently use box-based edge-wear coordinates. These are diagnosed limitations, not proof that any proposed new feature will improve the image.
- Noniv/abyssal-garden: adopt authored composition, negative space and scale hierarchy; adapt filtered procedural detail, local ambient visibility and depth-consistent scattering. Reject marine coefficients, caustics and organic world generators.
- Noniv/web-ocean: adopt consistent direct/environment light and distance-filtered surface detail; preserve already-adapted AgX/GGX workflow. Reject ocean simulation and replacing GGX convolution with simpler cubemap mip filtering. Preserve MIT attribution for copied substantial code.

## Review and acceptance

Implementation:GPT-6.1 Sol/high. Independent critic:GPT-6 Astra, fresh image-only context. Inputs:original reference, true clean render,320px thumbnail, needed crops; no author explanations/code. Assess composition, three planes, functional architecture/human scale, distant portal, light/reflections, material credibility and atmosphere. No critical/major finding is required for an artistic recommendation. Only Adrian can accept art.

## Required final verification

Build;RunAllTests;smoke;fallback;full route/actual mesh clearance and manual collision checks; six saved views and sector regressions; fixed-camera and selected-camera images; linear HDR/transfer and P0 checks as affected; coherent FOV; precise A/B switch/cache scope; reproducible source/served HTML hashes; HTML/gzip sizes and resource estimates. Keep physical GPU/60FPS/temporal BLOCKED without physical evidence.

Final process:QA and task docs →AGENTS.md→Issue#4→commit on main→push→verify remote SHA and HTML identity. Issue#1/#4 stay open. ART DIRECTION:NOT ACCEPTED until owner assessment.
