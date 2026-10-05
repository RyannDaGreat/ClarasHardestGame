# Switchback validation

Generate with `node tooling/reforged/create_switchback.mjs`, then run `node validation/reforged/switchback-route.mjs` from the repository root after building the original-engine runtime and game assets.

The level uses fifteen textured laser-wall segments (four boundaries, three alternating dividers, eight slalom teeth) and three clones of the original `OBDot.116` patrol. The patrols retain their original motion, Wall-ray sensing, turning, and Ball collision property. Neither the level nor its test supplies replacement game physics.

A real Chromium keyboard run completed at original-engine tick 1963, with the ship at `[-77.25067901611328, 90.52704620361328, 0]`. The finish observer reported `won: true` from the actual Blender finish contact. This successful attempt has 167 telemetry samples, no respawns, no JavaScript page errors, and no gameplay-state writes. All control inputs were genuine WASD events. Full evidence: `switchback-route.json`.

VLM inspected `switchback-start.png` and `switchback-win.png`: all four alternating lanes and eight teeth are visible, the green patrol lights remain inside the playable field, the ship starts at bottom left and reaches the top-left golden finish, and the page displays “Level complete!”.

Limitations: this is an existence proof of solvability, not a guarantee that arbitrary timing wins. An earlier attempt was killed by a genuine patrol in lane three; its trace is retained as `switchback-first-attempt.json`. The harness can retry from a fresh level with different initial waits because these moving hazards require timing. The run above succeeded on the first attempt of the revised harness. Browser validation used local Chromium at a 1920-pixel viewport and the original-engine runtime; mobile usability and other browser engines were outside this level-design task.
