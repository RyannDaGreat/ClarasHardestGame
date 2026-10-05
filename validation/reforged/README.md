# Embedded authoring probe

From the repository root, run `node validation/reforged/python-probe.mjs` after building the candidate runtime and static game assets. It serves `build/` through an ephemeral local server, replacing only runtime URLs with `runtime/build/engine/player.*`.

Passed in Chromium: actual CPython 2.6.2 imports JSON/Mathutils/GameLogic, parses a level-shaped JSON document, clones the original inactive player, changes placement and a game property, schedules deletion, and verifies deletion during the fifth original-engine callback. The script prints two PASS markers; the harness rejects exceptions or missing markers. This is an integration test, not complete editor or gameplay validation.
