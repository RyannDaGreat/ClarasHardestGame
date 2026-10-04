# Ryan's Hardest Game: original-engine browser port

## Objective
Run the actual Blender game in a static browser deployment suitable for GitHub Pages, at 1920×1080, preserving original gameplay, physics, music, and keyboard behavior. Begin with evidence-driven research and asset inspection. An engine port is the leading hypothesis, not a proven implementation. A recreated game is not acceptable.

## Glossary
- BGE: Blender Game Engine, the runtime embedded in historical Blender releases.
- WASM: WebAssembly, browser-executable compiled code.
- GHOST: Blender's platform/window/input abstraction.
- SDNA: the structure schema embedded in a `.blend` file.
- Fidelity: agreement with original runtime behavior, measured rather than assumed.
- Research frenzy: ten independent research angles; run in batches within the available three worker slots.
- Manifest: this self-contained record of requirements, decisions, and reconstruction instructions.

## User requirements (verbatim)
Initial request:
> › /Users/ryan/Library/Mobile Documents/com~apple~CloudDocs/RyansHardestGame <--- This is an old blender game I made in blender 2.49. Your challenge: Port it to WASM + WebGPU or whatever so I can host it on github pages as a static site! It must emulate blender's
>   game engine. Idk how we'll do this so start a research frenzy first. No approximations of teh game are acceptable - its gott abe the real deal, music, keyboard and all. 1080p. You up for the task?
>
> Off the bat how would u do it? It was originally made on windows blender lol

Follow-up:
> u r in a dump btw - please follow dump protocol. that means git commit and keep manifest/concerns file.

Further requirements:
> Make sure to use ur VLM to make sure it works on all levels. Ideally, we can just have a blender game emulator and send over the .blend file so I can edit it and update easily
>
> (on github pages as a static site))
>
> ENTER BULLDOG AUTOPILOT MODE (do u know what that means)
>
> NWD

Interpretation: persistent autonomous implementation after research; keep retrying viable approaches until completion or a genuine external blocker. Notify when fully done using speech and ntfy if available, with no unfinished agents/jobs. Deliver a reusable runtime loading replaceable `.blend` data, not a one-off game conversion. Visually inspect every level using image tools, and verify nonvisual behavior independently.

Additional backup supplied:
> /Users/ryan/Downloads/Ryan's Hardest Game-20261004T081520Z-1-001.zip this is a duplicate of the game i saved on a flash drive btw i made it in 2008 so i made backuops

Interpretation: compare the backup with the current input, preserving both. Inspect archive metadata and hashes before selecting any older asset or runtime. The archive location is provenance, not a runtime dependency.

Hosting setup:
> i set up an origin + github pages that looks for ./index.html. If we wanna keep the toplevel clean and make a build/ folder or something with github actions plz use the api key in the origin

Interpretation: use existing origin authentication for repository/Pages setup and deployment. Keep credentials out of displayed remote URLs, logs and committed files. Build static output in `build/` and deploy through GitHub Actions; credentials remain outside artifacts. Inspect existing configuration before changes.

Completion notification:
> once it's online and ready for me to play with notify me
>
> (with the URL)

Interpretation: completion requires a live, playable deployment, and the notification must include its public URL.

## Working rules
- Treat this repository as a movable, self-contained dump. Runtime paths must be relative to the repository; the historical source location above is provenance only.
- Preserve originals. Inspect binary `.blend` content without opening/resaving it in modern Blender.
- Update this manifest before code changes. Append lessons and progress to `concerns.md`; never remove its history.
- Keep `.claude_todo.md` synchronized and commit meaningful milestones with `[C] ` prefix, using the existing Git identity.
- Research artifacts belong in `.frenzy/`. Logs belong in `.claude_logs/`.
- Python on this Mac uses the installed Homebrew Python 3.10. No `python -c`. Scripts must have clear errors and documented examples; pure helpers need doctests.
- No game remake, new physics engine, or silent missing-asset fallback.

## Initial investigation and planned structure
- `web/`: maintained static game shell and loader, with explicit load/play audio gesture, fullscreen, original controls, hash-verified chunk loading and relative URLs for GitHub project Pages.
- `assets/published/`: losslessly chunked authoritative game and external files, produced by `tooling/asset-pack/`; tracked chunks stay below GitHub's per-file limit. `runtime/` contains maintained original-engine build recipes; published runtime binaries will be separate from game assets. `build/` is generated site output deployed by Actions.
- `tooling/asset-pack/` discovers asset references from the actual input `.blend` through a pinned read-only SDNA parser. Explicit path overrides recover original external files without rewriting game data. Packaging verifies every chunk plus full reassembly hash, and reports original missing assets. The original file is never resaved.
- `.frenzy/browser-port/index.html`, `loader.js`, and `prepare-assets.py`: local browser integration harness. Load unchanged game data separately from the engine, verify its SHA-256, stage external files and exact-path aliases in Emscripten FS, and start on a user gesture for audio. Missing assets remain explicit. Browser automation captures console errors and every level; production packaging follows a working runtime.
- `.frenzy/browser-port/player.cpp`: browser platform entry adapted from original GPG standalone startup. Uses original BLO loader, Ketsji engine, scene converter, renderer, OpenAL and CPython. Only canvas/context, clock, browser event dispatch and asynchronous frame scheduling are new. No level-specific gameplay logic. Initial integration must expose unsupported runtime exit requests clearly until restart/load handling is completed.
- CPython smoke demonstrated `RuntimeError: null function or function signature mismatch` inside `PyCFunction_Call` during standard-library import. Use Emscripten `EMULATE_FUNCTION_POINTER_CASTS=1` for initial integration: original x86 C callback conventions permit ignored extra arguments while WASM checks signatures. This is an explicit ABI adapter; measure cost and replace targeted callbacks if necessary.
- CPython runtime also needs its pure-Python standard library (e.g. `struct.py` wraps `_struct`). Mount original release `Lib` under `/python/lib/python2.6` with Python home `/python`; an archive alone does not provide standard module files.
- `.frenzy/python-probe/smoke.sh` links the real CPython archive into Node-compatible WASM; no dynamic interpreter replacement. Smoke uses a 16 MiB stack and explicit growing memory because original recursion/frame layout predates WASM's default small stack.
- `.frenzy/graphics-port/`: isolated pinned gl4es/GLU build experiment, owned by backup-audit agent after completing tenth research angle. Do not overlap engine build edits. The broad `.frenzy` ignore currently keeps experiments local; promote final reproducible sources into maintained tooling before delivery.
- Configure's cross-target facts must also be exported during `make`, because its automatic configure reruns otherwise infer the macOS host and corrupt `pyconfig.h`. Browser CPython uses upstream `dynload_stub.o` (explicit unavailable native extensions) with required standard modules statically built.
- CPython's internal `posix_close` callback must be renamed to avoid a newly standardized libc symbol with a different signature; this leaves Python `os.close` behavior unchanged. Compile with `-fno-strict-aliasing` as CPython's historical build expects.
- `.frenzy/python-probe/build-wasm.sh` builds the exact CPython 2.6.2 static archive using unchanged release grammar/AST generated files; enables common standard modules statically, because browser loading cannot use native extension DLLs. `smoke.c` embeds the real interpreter to verify bytecode execution under Node before engine integration.
- `.frenzy/engine-port/`: full original player-library build graph experiment; use authentic SCons player libraries, preserve upstream standalone-player editor exclusions, and document every compatibility patch. Root supplies exact CPython 2.6.2; agent supplies engine archives and eventually browser platform adapter.
- CPython configure adaptations must explicitly set target ABI sizes (including modern Emscripten 64-bit time/off_t), disable unavailable chflags APIs, and retain original generated grammar/AST files. These are build/platform adaptations, not interpreter rewrites.
- `.frenzy/github-inspect.py`: read-only GitHub API inspection using origin credentials held only in memory; prints safe repository and Pages metadata, never raw origin or credentials.
- `assets/flash-backup/`: verbatim ZIP extraction, separate from original current copy. Archive contains Windows Runtime.exe, python26.dll, and additional textures, including power.png. Its main `.blend` differs in size by 344 bytes; selection awaits block/asset comparison.
- `.frenzy/python-probe/`: isolated CPython 2.6.2 static WASM embedding experiment. Backup python26.dll explicitly identifies 2.6.2/r262 and MSC v.1500 32-bit, so pin that exact interpreter. Use existing local Emscripten SDK and original CPython source, with explicit cross-compilation adaptations only.
- `.frenzy/baseline/`: reproducible Docker/Xvfb experiment using official original i386 player, native screenshots and keyboard automation. Container `rhg-baseline` is disposable; assets mounted read-only. This is a Linux reference, not proof of exact original Windows equivalence.
- `.frenzy/build-probe/`: isolated original-source Emscripten compilation experiment and locally installed SDK; no system dependency is assumed without setup instructions.
- `.frenzy/audit_blend.py`: read-only binary block/SDNA inspection, emits a JSON inventory without executing embedded code. Uses declared field sizes (including explicit padding) and validates structure sizes. Temporary research tooling, not a game reimplementation.
- Confirmed input header `BLENDER_v249`: 32-bit little-endian Blender 2.49. Official 2.49b source downloaded for inspection; patch-level baseline still needs verification.
- `assets/original/`: local unchanged copy of the main game and external sound/texture folders, excluded from Git because the main file exceeds GitHub's file size limit. Asset delivery strategy remains research work.
- `.frenzy/`: ten research briefs, binary asset audit, and temporary research programs.
- `claude_instructions.md`: current project state and reproduction guidance.
- `concerns.md`: append-only investigation history.
- `.claude_todo.md`: task state.
- First inspect header/version, embedded schema, scenes, logic bricks, scripts, asset references, and packed assets. Hash the input to establish identity.
- Research source-engine compilation, emulation alternatives, physics/Python/audio fidelity, graphics, static hosting constraints, preservation baselines, and validation.

## Success criteria and unresolved work
Research identified Blender 2.49b and CPython 2.6.2. Original Bullet and Python execute in WASM, 43 original engine archives compile, and GL4ES/GLU render their 1080p browser probe correctly. Full-game browser execution is now being integrated. Success still requires native-versus-browser behavior checks, audio and keyboard support, every level visually inspected, and a live static deployment. Component probes alone do not establish game fidelity.
