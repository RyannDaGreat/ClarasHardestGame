# Parallax native validation

2026-10-04: `node validation/reforged/parallax-route.mjs` passed against the locally built original Blender 2.49 WASM runtime. JSON is injected before launch via the editor's `reforged-play-v1` storage contract. Thereafter the harness uses only real browser WASD keyboard events, while the runtime observer reads player positions and original finish collision sensors. No coordinates, forces, hit states, or game objects are changed during validation.

- Three original portal transfers observed, in order: southwest → northeast (63,72), northeast → northwest (-72,61.30), northwest → southeast (63,-73.35). Small offsets after the nominal exit positions reflect actual simulation between observer samples.
- Original BGE finish contact: `('REFORGED_WIN', 596, 'OBFinish.002', 'OBWalrus.013')`.
- Final observer: tick 613, `won: true`, one original `OBWalrus.013`; zero browser page errors.
- 57 position/status samples cover eight movement stages; all stages reached.
- Route proof establishes at least one winning path through the unchanged authored level. It does not guarantee arbitrary edits, all keyboard timings, or every browser/device.

## Visual review

The VLM inspected `validation/reforged/parallax-start.png` and `validation/reforged/parallax-win.png` at 1920×1180 browser viewport. The game is centered, all four sealed chambers and portal pairs fit within the image, bright laser seams and square junctions render continuously, animated blue push pads point in their original directions, the original player appears in the southwest start room, and the gold finish is in the southeast room. The winning screenshot shows the player trail passing through the finish and the page's Level complete message. Portal meshes retain the original dark blue material; no replacement art was introduced.

This is an introductory-to-moderate portal traversal challenge, designed to complement the other agents' combat/endurance levels. Its challenge is reading spatial connections and controlling the original push mechanics around corners, rather than sustained projectile avoidance.

## Artifacts

- `tooling/reforged/create_parallax.mjs`: reproducible authoring script.
- `web/reforged/levels/Parallax.json`: editable/playable level, 143 original-template instances, three fully rewired portal pairs, four push pads, ten laser wall segments.
- `validation/reforged/parallax-route.mjs`: keyboard-only winning route harness.
- `validation/reforged/parallax-route.json`: status trace, route, exact native win event.
- `validation/reforged/parallax-start.png`, `validation/reforged/parallax-stage-0.png` through `validation/reforged/parallax-stage-7.png`, and `validation/reforged/parallax-win.png`: visual evidence.
