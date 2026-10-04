# Ryan's Hardest Game in the browser

This runs the original Blender 2.49b game engine, Bullet 2.74 and CPython 2.6.2 compiled to WebAssembly. The game is the original `.blend`, loaded by Blender's own file reader. Rendering uses GL4ES over WebGL; sound uses the original OpenAL backend through Web Audio.

Published address: **https://ryanndagreat.github.io/ClarasHardestGame/**. The first playable engine baseline is tagged `v0.1.0`. Frame-rate and input-latency optimization is in progress.

Click **Load game**, then **Play**. The first download is approximately 391 MiB. The drawing buffer is 1920×1080; the original game's 4:3 framing is preserved with side bars. Use **Fullscreen** for the full display.

## Edit and publish

Save your changes using Blender 2.49. Install the asset packer's dependency once:

```sh
python3.10 -m pip install -r tooling/asset-pack/requirements.txt
```

Then run, from this repository:

```sh
bash tooling/update-game.sh path/to/edited.blend
python3.10 -m http.server 8765
```

Open `http://localhost:8765/build/` and test your edited game. On this Mac use `/opt/homebrew/opt/python@3.10/bin/python3.10` for the Python commands. The update script selects that interpreter automatically; elsewhere it uses `python3`, or your explicit `PYTHON` environment variable.

Commit `assets/published/` and push `master`. The GitHub Actions workflow validates and publishes `build/`. The engine does not need recompiling for level, logic-brick, material, or sound edits. New external dependencies must be present; the packer reports missing paths. Its explicit mappings live in [`tooling/asset-pack/project-paths.json`](tooling/asset-pack/project-paths.json).

The original 351,865,072-byte game is split losslessly into 21 chunks because it exceeds GitHub's per-file limit. Both packaging and browser loading verify each chunk and the reconstructed file with SHA-256. The authoritative original hash is `e7f047be356346eebd166e1918ab854c9bf1494dbecd81f44174596f598a18ff`.

## Build the engine

```sh
bash runtime/build.sh
cp runtime/build/engine/player.js runtime/build/engine/player.wasm runtime/build/engine/player.data web/runtime/
bash tooling/build-site.sh
```

See [`runtime/claude_instructions.md`](runtime/claude_instructions.md) for pinned inputs, host prerequisites and platform adaptations. Dependencies install locally. `runtime/` contains the browser adapter and reproducible patches; `web/runtime/` contains the distributable build; game assets remain independent.

## Validation

```sh
npm ci --prefix validation
node validation/browser-smoke.mjs http://localhost:8765/build/
```

The smoke test uses a real browser and actual keyboard events. It saves screenshots and audio measurements under `validation/output/`; browser logs go to `.claude_logs/`. Set `BROWSER_EXECUTABLE` to use an installed browser. All 12 saved level scenes were visually inspected against native Blender captures and exercised with keyboard input. See [`validation/levels/README.txt`](validation/levels/README.txt) for evidence and limits. These are startup/motion checks, not completed playthroughs or a claim of Windows bit-for-bit parity.

This is an original-engine port for the supplied game, not a claim of compatibility with every historical Blender project. Arbitrary native Python extensions, physical CD-ROM audio, and external game-file switching need additional platform work. The packer explicitly rejects unsupported dependency forms; see its [README](tooling/asset-pack/README.md). Two references were already absent from the supplied originals and remain reported: `HZR.jpg` and `Untitled.004`. The recovered `power.png` comes unchanged from the supplied flash-drive backup.

The original menu offers levels 1–9. Additional saved scenes, including Lv10, are retained. `?scene=Lv10` is a diagnostic direct launch that omits preceding scene state; it does not alter the original menu or game data.

## Project records

[`claude_instructions.md`](claude_instructions.md) retains requirements and reconstruction instructions. [`concerns.md`](concerns.md) records investigation, failures, fixes and remaining limitations. [`runtime/licenses/`](runtime/licenses/) retains upstream notices; the engine and game are separate artifacts.
