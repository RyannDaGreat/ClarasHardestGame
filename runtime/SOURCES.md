# Original engine runtime

The browser player compiles Blender 2.49b's real game engine, `.blend` reader, logic bricks, Bullet 2.74, Python 2.6.2, image loaders, and OpenAL sound subsystem. GL4ES translates desktop OpenGL to WebGL; the real SGI GLU supplies mipmaps, image scaling, tessellation and NURBS. The browser adapter replaces window creation, clocks, event delivery and the host loop. Game objects and logic are loaded from the user's original file.

## Rebuild

Install Python 3.10+, Node.js, Git, curl, patch, CMake, make and a host C/C++ toolchain. On macOS, Homebrew can provide these; Linux equivalents are the distribution's development packages. Select your desired Python through `PYTHON`, then run from the repository root:

```sh
PYTHON=python3 bash runtime/build.sh
PYTHON=python3 bash runtime/python/smoke.sh
PYTHON=python3 python3 runtime/source_bundle.py
```

`build.sh` bootstraps an isolated, pinned Emscripten 3.1.74 SDK, checks upstream revisions/hashes, builds all dependencies and outputs `runtime/build/engine/player.js`, `player.wasm`, and `player.data`. `player.data` contains the original Python standard library; the game file is loaded separately. `JOBS=6` is the default build parallelism. Generated CMake/configuration files contain local paths: after moving the dump, remove the disposable `runtime/build/` and run the recipe again. Setup reactivates the SDK at its current location.

Sources and caches occupy several GiB. First compilation requires network access for SDK and sources. `runtime/.cache/` and `runtime/build/` are ignored; nothing in the tracked recipe depends on research scratch files or an absolute developer path.

## Pins and licenses

Exact archive SHA-256 values and repository revisions are machine-readable in [sources.json](sources.json). Source notices remain in [licenses](licenses/); the full source archives also retain per-file notices.

| Component | Exact input | Source and notice |
| --- | --- | --- |
| Blender | 2.49b source archive | [Blender source](https://download.blender.org/source/blender-2.49b.tar.gz), GPL v2; included third-party notices remain applicable |
| CPython | 2.6.2 | [Python archive](https://www.python.org/ftp/python/2.6.2/Python-2.6.2.tgz), PSF and historical notices |
| GL4ES | `a444cc94b17c672c66c3e6ce07428dc603034db1` | [Source](https://github.com/ptitSeb/gl4es/tree/a444cc94b17c672c66c3e6ce07428dc603034db1), MIT and bundled per-file notices |
| GLU | `2fed2bda2b725d2b9e32c435b48d5141cc95827f` | [Source](https://github.com/ptitSeb/GLU/tree/2fed2bda2b725d2b9e32c435b48d5141cc95827f), SGI Free Software License B 2.0 |
| Emsdk | `96c657fc60920d2a6a82318aa50e0abf82749604` | [Source](https://github.com/emscripten-core/emsdk/tree/96c657fc60920d2a6a82318aa50e0abf82749604), MIT |
| Emscripten | 3.1.74, source `1092ec30a3fb1d46b1782ff1b4db5094d3d06ae5` | [Source](https://github.com/emscripten-core/emscripten/tree/1092ec30a3fb1d46b1782ff1b4db5094d3d06ae5), MIT/NCSA and bundled system-library notices |
| TIFF headers | 3.9.7 | [Archive](https://download.osgeo.org/libtiff/tiff-3.9.7.tar.gz), libtiff notices |
| Emscripten ports | libpng 1.6.39, JPEG 9c, zlib 1.2.13 | Versions and SHA-512 pinned by this Emscripten SDK; included source notices |
| Blender bundled physics | Bullet 2.74, SOLID, QHull | Original Blender archive, zlib-style Bullet / GPL SOLID / QHull notices |

`source_bundle.py` produces `runtime/build/runtime-source.tar.gz` for distribution alongside binaries. It contains build recipes, exact upstream inputs, renderer patch and runtime-library sources. The SDK compiler can be retrieved by the pinned setup recipe; compiler executables are not duplicated in the source archive. Runtime port modifications and the browser adapter are distributed under GPL v2; upstream component licenses remain unchanged. This does not grant rights to the user's game artwork or music.

## Compatibility scope

This port preserves the original engine implementation but is not yet a universal Blender-game emulator. It currently uses one browser runtime thread, static Python modules, OpenAL file audio and the original standalone-player editor exclusions. Python-created OS threads, dynamic native extensions and SDL CD-ROM support are unavailable. Optional FFmpeg, OpenEXR, OpenJPEG, QuickTime, Verse, international fonts and fluid-simulation paths are disabled in the build graph. TIFF headers compile Blender's original dynamic TIFF binder, but no TIFF dynamic codec is supplied; audited game images are PNG, JPEG and TGA. Replacing a game with new dependencies requires revisiting that scope.

`prepare.py` records every source patch with its reason, including modern compiler compatibility, exact ABI declarations, GL dispatch, OpenAL platform recognition, and GIL synchronization guards matching the threadless Python build. `python/prepare.py` patches three legacy configure checks and one private libc-name collision. The renderer patches restore wireframe-quad perimeters and the desktop GL default MODULATE RGB/alpha combiner state. Both are separate and reviewable. No player physics, game logic bricks or object data are rewritten.

The Python smoke executes actual 2.6.2 bytecode and imports static modules. Game-level keyboard, sound, scene transitions and pixel comparisons require separate browser/native reference evidence; a successful build alone does not establish parity.
