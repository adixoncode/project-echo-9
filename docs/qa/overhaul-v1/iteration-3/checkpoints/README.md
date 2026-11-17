# Actual construction checkpoints — iteration3

Baseline is iteration2/main56b0255 with the same camera/seed/time/quality. `before-*` images preserve its actual FullHD output. P0 corrects only the near-emitter mounting geometry proven to cause the red-edge defect; source positions, power, cone, exposure and shadow algorithms remain unchanged.

The P0-only artifact SHA is `590d86735e840cad1fa4d116c4d17ab38913329c4d46be35239bd95ee789a51a`. Its clean/HUD captures are actual1920×1080. The subsequent materials-only artifact SHA is `106514e36fab72a46d890aee7bbe4bd3fe9df66c382a8ad2c5fe766f532c5e1d`. Authored light table, postprocessing and exposure source files were verified byte-identical between those stages. This controls the material/AA comparison under identical lights. Both standalone sources are gzip-archived here with metadata.

Raw wall/pipe/grate crops are under `../details/`, with source hashes and exact bounds in `crop-provenance.json`. They are extracted pixels with no resizing or grading. Compare p0→materials for material response; iteration2→final also includes lighting/depth/grade changes.

These engineering checkpoints are not independently accepted artistic candidates. The final candidate alone goes to a fresh media-only Astra review; after that review STOP before iteration4. Software WebGPU/readback is diagnostic; hardware/temporal gates stay BLOCKED.

Files named `*-construction*` are earlier960×540 engineering previews, with their own source identities and settings in adjacent JSON. They are preserved as history and are not the delivered FullHD candidate. The last refined construction preview precedes a technical far-fixture cable anchoring correction. The authoritative final8e6cec19…1920×1080 images and same-artifact FullHD A/B are in the parent directory; do not attach a construction-preview hash to them.
