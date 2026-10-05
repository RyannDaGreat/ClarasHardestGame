# Reforged asset library

Levels are versioned JSON referencing original Blender component IDs. The editor changes transforms, hierarchy, geometry, properties, original brick connections/settings and existing animation keys. The C++ adapter assembles them before Blender converts meshes, collision and logic. Python observes actual finish contacts; it does not supply replacement gameplay physics.

Regenerate the library from the unchanged original file at `assets/original/RyansHardestGame.blend`, from the repository root:

```sh
python3.10 -m pip install -r tooling/reforged/requirements.txt
python3.10 research/reforged/audit-components.py
python3.10 tooling/reforged/export_library.py
python3.10 tooling/reforged/export_settings.py
python3.10 tooling/reforged/export_previews.py
```

Use `/opt/homebrew/opt/python@3.10/bin/python3.10` on this Mac. Preview PNGs are editor-only; the runtime uses original game assets. Exporting also regenerates the C++ primitive-field allowlists. Rebuild the engine if those change. Library generation replaces original blueprints, not custom challenge JSON.

The `create_*.mjs` generators reproduce the bundled authored challenges. Run with Node from the repository root. `Gauntlet` is the initial maze proof. The catalog contains Switchback, Crossfire and Parallax plus ten separately designed levels: Relay, Pinwheel, Undertow, Ricochet, Switchyard, Slingshot, Clockwork, Honeycomb, Afterburn and Crescendo. Their design notes are in `research/reforged/levels/`; validation scope and evidence are under `validation/reforged/`. The original three and Switchyard have real-key winning routes; the remaining new levels have startup, visual and movement checks without complete playthrough claims.

Users can save levels in browser storage, export/import JSON, and playtest in the original runtime. There is no server account or shared upload database. Original templates and their brick types are the component vocabulary; this is not a complete Blender modeling or Python authoring replacement.
