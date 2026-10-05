# Embedded authoring probe

From the repository root, run `node validation/reforged/python-probe.mjs` after building the candidate runtime and static game assets. It serves `build/` through an ephemeral local server, replacing only runtime URLs with `runtime/build/engine/player.*`.

Passed in Chromium: actual CPython 2.6.2 imports JSON/Mathutils/GameLogic, parses a level-shaped JSON document, clones the original inactive player, changes placement and a game property, schedules deletion, and verifies deletion during the fifth original-engine callback. The script prints two PASS markers; the harness rejects exceptions or missing markers. This is an integration test, not complete editor or gameplay validation.

# Editor and challenge validation

Install `npm ci --prefix validation`, build the candidate runtime and static assets, then run the scripts below from the repository root. Each browser harness closes its browser/server. Run serially to avoid distorting gameplay timing.

| Script | Evidence |
|---|---|
| `authoring-checks.mjs` | GUI carve removes visible and hidden collision; intact wall blocks, carved wall allows actual finish; JSON save/reload/import and layout |
| `connections-motion.mjs` | GUI grid/origin/height edits, switch-to-field link changing original `On` 0→1, authored IPO gives actual 90° rotation |
| `coverage.mjs` | Every audited gameplay root in six late scenes can be selected, duplicated and undone; child properties/animation available |
| `late-scenes.mjs` | Six original-engine reconstructions with explicit properties and animation; captures VLM-reviewed |
| `themes.mjs` | Fifteen themes, cross-tab synchronization, reload persistence and layout |
| `catalog-smoke.mjs` | Three named playable routes, visible previews, edit handoff; set `SITE_URL` to check the published site |
| `switchback-route.mjs` | Real keyboard victory, four lanes/eight teeth/three original patrols |
| `crossfire-route.mjs` | Real keyboard victory, three firing lanes/six original turrets, shelter pauses |
| `parallax-route.mjs` | Real keyboard victory through three original portal transfers |

Each script's `.json` and screenshots contain results. Earlier failures remain named explicitly. No test teleports the player or substitutes physics to obtain a win. `connections-motion.mjs` adds read-only telemetry for internal properties. Win reporting observes original sensor contact before its normal end-of-frame cleanup.

Coverage: 175/175 audited gameplay component roots (Lv7 32, Lv8 31, Lv9 30, Lv10 33, Lv1A 18, Lv2A 31) pass GUI reconstruction operations. Cameras/lights/presentation are excluded from this denominator and assessed separately in six scene captures. This exceeds the requested 95% for that inventory; it is not a claim that every Blender feature, arbitrary new logic-brick type, or complete late-level playthrough was tested. See `coverage.json` for each ID and exclusion, and the construction research for the separate feature evidence.

`perspective.mjs` verifies the default-off view toggle, actual object picking/dragging in perspective, grid-origin snapping and reload behavior. VLM-reviewed orthographic/perspective captures are beside the script. The editing canvas previews geometry and source textures; use Playtest for final original-engine materials, animation and physics.
