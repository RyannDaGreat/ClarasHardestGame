# Package unchanged Blender 2.49 game data

From the repository root (Python 3.10+; on this Mac use `/opt/homebrew/opt/python@3.10/bin/python3.10`):

```sh
python3.10 -m pip install -r tooling/asset-pack/requirements.txt
python3.10 tooling/asset-pack/package_assets.py --config tooling/asset-pack/project-paths.json
```

Output is `build/assets/assets.json` and `build/assets/objects/*.bin`. The input `.blend` is read-only and never resaved. Change it in Blender 2.49, save, and rerun; discovery reads the new file each time. Supply `--blend path/to/edited.blend --output path/to/site/assets` for another input/destination. A new standalone project can omit `--config`; unresolved dependencies fail with their IDs and original paths.

The supplied configuration relocates old absolute Windows paths and recovers `power.png` from the flash-drive backup. It explicitly allows only the two known missing original assets, `IMHZR.jpg` and `IMUntitled.004`. Missing assets stay visible in the delivery manifest. No replacement texture is synthesized. Configuration paths resolve relative to the config file, so the repository remains movable. `prefixes` keys are Blender paths with `/` separators; `overrides` keys are normalized browser virtual paths. Optional `extra_files` maps absolute normalized browser paths to local files for dependencies requested dynamically by scripts.

The browser loader should resolve each URL relative to `assets.json`, download `game.chunks` in array order, verify each chunk's SHA256 and bytes, concatenate, and verify the resulting game SHA256 and bytes. Write the result to `/game/game.blend`. Each `files` entry has `url`, `sha256`, `bytes`, and `virtual`; write the verified payload at its `virtual` path. Paths deliberately preserve the engine's normalized original filenames, including `/z/...` absolute Windows paths. The `missing` array is for visible diagnostics; `packed` is informational (those bytes already reside inside the unchanged game).

The original game yields 21 chunks, 17 external virtual paths, 2 known missing references. Twenty chunks are 16 MiB and the last is 16,320,752 bytes. Reassembly is 351,865,072 bytes with SHA256 `e7f047be356346eebd166e1918ab854c9bf1494dbecd81f44174596f598a18ff`. Equal external payloads share one downloaded object. Existing objects are verified before reuse, and the manifest is atomically replaced only after successful source/chunk verification. Old unreferenced objects may accumulate; use a fresh output directory for a clean release. Do not run two packaging processes into the same output directory concurrently. This repository tracks its distributable chunks under `assets/published/` so GitHub Actions can publish without the original oversized file; `build/` remains generated output.

Verification (after packaging, with original browser fixture available):

```sh
python3.10 -m doctest tooling/asset-pack/package_assets.py
python3.10 tooling/asset-pack/verify_pack.py
```

Verification checks every payload, independent reassembly, exact virtual paths/hash/size equivalence to the original browser fixture, byte-identical deterministic repackaging, and dependency discovery after editing only a temporary copy. It confirms that the authoritative input hash did not change. This validates transport and discovery; it does not validate gameplay or rendering.

Supported discovery: Blender 249 images (including movies), sounds and fonts; packed payloads stay embedded. Linked libraries, image sequences, sequencer media and external game-loading actuators currently stop packaging with a clear unsupported-dependency error. Arbitrary Python file access cannot be inferred statically: declare those files in `extra_files`. New missing dependencies fail unless explicitly acknowledged in `allow_missing`. External files above 100 MiB are rejected pending external-file chunk support. No filename guessing, game conversion or asset substitutions occur.

The vendored GPL 2-or-later parser is pinned to [dfelinto/blender-file commit 9366768](https://github.com/dfelinto/blender-file/tree/9366768c4b0a22587d5c5fe0b1f74995ead1c9ae); exact URL/hash are in `vendor/SOURCE.json`, and its source hash is checked on every invocation. `vendor/COPYING` retains the license.
