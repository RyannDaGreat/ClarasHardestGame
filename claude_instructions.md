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

Validation and release continuation: `validation/` will retain portable browser smoke/replay tooling, reviewed evidence and explicit fidelity limits. Native/browser helper `.frenzy/baseline/capture-browser-motion.mjs` records before/after real keyboard input for each level; diagnostic direct-scene startup does not establish full progression equivalence. `README.md` documents play/update/build/deploy instructions. `.github/workflows/pages.yml` publishes the verified `tooling/build-site.sh` output through GitHub Pages Actions on master. No new hosting provider is introduced.

Browser platform hardening: retain pressed-key state only to release keys on window blur (browser focus changes otherwise lose key-up events), scale pointer coordinates to the actual 1920×1080 drawing buffer, and expose engine startup/exit status so the page never labels a failed launch as playing. These are platform adapters, with no game logic edits.

Editing workflow: `tooling/update-game.sh <edited.blend>` packages into a fresh temporary directory, then promotes the verified data to `assets/published/`; the reusable engine is not rebuilt. `tooling/asset-pack/fixtures/original.json` will retain the independent original asset audit needed for portable packaging regression tests, instead of depending on ignored research output. The source/recovered assets stay local and unchanged.

Performance and baseline release requirements (verbatim):
> its good but the framerate is low and keyboard lags by .1 sec which is hard for this game....can we optimimze it? its from 2008 and we're running on 2026 M1 pro lol surely it can be optimized
>
> push to github the first version and tag it tho

Interpretation: publish and tag the working first version before performance changes, then profile and improve frame rate/input latency without replacing original gameplay or physics. Preserve the baseline for comparisons and rollback. Performance becomes an additional required objective; completion notification still waits until authorized work is complete.

Performance investigation plan: `validation/performance/` will hold repeatable browser frame-time, event-queue and CPU profiles of the tagged baseline and candidate builds. Measure before optimizing; retain original physics scheduling, geometry, effects and 1080p. Separate CPU work, browser/GPU presentation and input delivery so improvements address measured causes. `validation/graphics/` retains portable pixel regressions for the two existing GL compatibility fixes.

Performance findings after v0.1.0: actual Lv10 render cadence is ~16 FPS on Chrome/ANGLE M1 Max although callback CPU work is ~8 ms. Original gl4es implements glAccum as a stub: original motion-blur actuators therefore need a genuine accumulation implementation for fidelity. Investigating both repeated log DOM updates and GPU pacing before selecting a fix. Diagnostic profiler distinguishes rAF callbacks from actual draws. Live Pages deployment and remote browser smoke passed at https://ryanndagreat.github.io/ClarasHardestGame/.

Additional user request (verbatim, 2026-10-04):
> /Users/ryan/CleanCode/Personal/Website plz add it to my 404 page
> and pus
> push

Add a project card linking the live game to the existing website's 404 project list, append at the end per its existing convention, and commit/push that separate repository. This does not replace the ongoing game performance/fidelity work.

Performance implementation decision: replace Emscripten's single scratch index buffer per size with a bounded, lazily allocated128-buffer ring per size and WebGL context. This mirrors the existing temporary vertex-buffer rotation strategy and prevents repeatedly modifying an in-flight index buffer. Keep all geometry/indices, resolution, original simulation timing and materials. Use a small post-JS adapter and verify pixel correctness through ring wrap/reuse plus game performance/all-level regression. The controlled Lv10 test improved16.42→60.10 renderedFPS on Chrome M1 Max.

Additional user request (verbatim, 2026-10-04):
> add this too https://github.com/RyannDaGreat/JXL-Art

Interpretation: append JXL-Art to the same website 404 project list and push, under the prior push authorization. Its README describes art computed from compact JPEG XL decision trees; use the exact repository link supplied by the user.

Final performance validation plan: copy the linked browser-support candidate into `web/runtime/`, reassemble the site, and run the existing performance profiler separately for all twelve playable scenes. Preserve baseline VLM captures; promote compact performance results and candidate captures into `validation/performance/evidence/`. Run the normal-menu/audio smoke again. Regenerate the corresponding-source archive after final runtime documentation changes before deploying. The original WASM and Python data hashes must remain unchanged for this buffer-only optimization.

Accumulation investigation correction: original GHOST Win32 requests zero accumulation bits and X11 requests no accumulation buffer. A stubbed glAccum cannot yet be called an observed visual regression: the original framebuffer may have no accumulation storage either. The isolated implementation remains research-only until actual native context bits/errors are measured; enabling motion blur without that evidence could change original behavior.

Optimized candidate validation completed: linked JS hash 4a3890539ce09c41fe16f68d55e50c97deefdc208d93c18a39bbfa84d874f0fb; WASM and Python data unchanged. All twelve level scenes individually VLM inspected after ten real arrow presses; zero page exceptions. Performance report and compact hash-bound evidence are under `validation/performance/`. Lv10 measured 59.98FPS vs16.42 baseline; next-render-end proxy3.6–16.3ms vs28–72ms, not physical input latency. Release as v0.1.1 while retaining immutable v0.1.0. Native accumulation probe found zero actual bits; preserve that appearance, no experimental blur integration.

Release delivery: v0.1.1 commit655f1f1c8eee9e21c3d24c1c825f8d832e912c8f pushed; Pages workflow37192871078 completed successfully. The live player.js SHA-256 exactly matches the validated candidate. A fresh browser loaded the actual Pages assets and profiled Lv10 at59.64FPS with zero page exceptions and ten arrow presses. Compact evidence: `validation/performance/evidence/live-results.json`. Native probe container and this task's loopback server stopped; all child agents completed. The unrelated webkokoro server was preserved. The final action after this delivery record is the requested spoken/phone NWD notification containing the playable URL.

Website side tasks are complete: game card pushed asf1af939 and JXL-Art card asb8bf5ae in the personal website repository; the live404 page contains both links.

User request (verbatim): "why doesnt it download automatically + save into browser the download? And why play on top left, why not make but play overlay on the game like a video game to people just click and plays it. ? And linnk to github repo. And use symbols instead of text where it makes beauty  - like from iconify"

Implementation plan: auto-load verified game assets after runtime initialization; explicitly persist content-addressed chunks/external dependencies in a pathname-scoped Cache API store, verify cached bytes on every use, and report storage/quota failures visibly while allowing already downloaded data to play. Request persistent storage on Play; browser eviction policy still applies. This caches game files, not an offline application shell. Keep a user gesture for engine/audio startup. Redesign index.html/styles.css around a centered play overlay, actual original-game title poster, progress meter, icon buttons with accessible labels for fullscreen/GitHub/help, and compact controls. Vendor Lucide SVGs from Iconify with license notice, no runtime CDN dependency. Preserve original engine/game bytes. Adapt existing validation startup to the one-click flow and test first load, cached reload without asset network access, cache corruption repair, storage denial, keyboard/audio, and desktop/mobile layout. Existing push/Pages authorization applies to this site update.

Automatic-player implementation: `web/styles.css`, `web/poster.png`, locally vendored Lucide/Iconify SVGs and notices under `web/icons/`; `web/loader.js` now automatically loads into original MEMFS and stores SHA-256-verified content in Cache API. `validation/player-ui.mjs` tests automatic preparation, cache-only reload with network blocked, corruption repair, storage denial, one-click start, fullscreen, and responsive bounds. Existing gameplay, level and performance runners now wait for automatic asset preparation before one Play click. Original runtime artifacts are unchanged.

Live deployment verified: player commit `e969632dfaf4fb5cf36ae0c96aa2376b5a3da4be`, Pages workflow `37226200196` successful. Published loader SHA-256 `cb685426079b79adf97609cb135b8de1161fe261db234e290f0591440c247b21` matches the tested file. Full browser close/reopen test on the public URL retained all 38 game entries with zero downloads; one Play click started original engine and running audio. Preserve the cross-process test as `validation/browser-cache-restart.mjs` and its live result/ready screenshot in `validation/player-ui-evidence/`. Original engine/game bytes remain unchanged. Final delivery includes the authorized NWD notification and URL.

## Reforged level builder request
User request (verbatim): "So I have a challenge for you. Um... Towards the later levels, I really kind of hit a rhythm. And I knew what I was making. The first few levels, not so much. But the later ones, yeah. There's a grid. I carve things out of the grid. I add the, you know, the laser wall textures and then the junctions and... Well, with your VLM, are you able to understand how these levels work? All the different components in them? Well, I was thinking, what if we make a level builder? Do you think you'd be capable of doing that? A GUI-based level builder? And build me a level of your own and see if you can solve it too. Although, maybe that second part... Just build the level. But make sure you can guarantee that it's solvable. And use those different components to make it a challenge. Once you did it and you have a screenshot, like, and I can play it, let me know. Because then we can have the original one and then we can have the... Uh... Oh no. We gotta think of a new name for this new version. It would be... The \"re-vamp\". No, the \"extension\". No, the... \"resurrection\". No, uh, I don't know. Think of a cool one-word name for it and then notify me when you're done. And make the website able to play both. But make sure that it's actually real. Like, I need to be able to save levels as well, perhaps in JSON form, and load them too. How feasible is this?"

Plan: inspect original later-level geometry/materials/logic together with VLM evidence; determine a practical original-component authoring interface. Build a genuine grid GUI with JSON save/load, local persistence, playable custom level and original/new edition navigation. Working one-word name: Reforged (assistant choice). Verify a winning route against the actual playable simulation; distinguish verified authored-level solvability from arbitrary user edits. Preserve the original edition and original files. Retain screenshot, tests, source, deployment and NWD URL.
User refinement (verbatim): "Follow all the good principles of user interface design. Do research on this kind of thing. How are other level editors built? The language and design should be easy for one to understand, but allow for basically everything that I do here, is just the placement of objects and like the connections of portals and stuff. Portals always come in pairs or directionals or whatever. And you know, yeah, a wizzy big editor is what we need for that. You know, that Python does- that blender file does support Python, so like, make sure that is tested though, before you notify me."
User refinement (verbatim): "Really, when we store a level, it should just be in JSON form, right?"
Interpretation: authored levels are versioned JSON only; shared component library holds original meshes/textures/sounds and reusable Python behavior. Editor and runtime consume the same data. Explicitly test embedded Python in the browser. Research: Tiled object/template workflows (https://doc.mapeditor.org/en/stable/manual/objects/, https://doc.mapeditor.org/en/stable/manual/using-templates/), LDtk entity fields (https://ldtk.io/docs/general/editor-components/entities/), and NN/g recognition/system-status/undo heuristics (https://www.nngroup.com/articles/ten-usability-heuristics/). Apply visible tool palette, selection/property inspector, direct placement with grid snapping, visible directed links, undo/redo, explicit errors and save/play state.
User refinement (verbatim): "Note that the grid has different resolutions and different levels too. Did you notice that? Make sure you do some heavy research on how these projects are actually built. Confirm all your suspicions before you actually analyze it and make sure that the last few levels, that like 95% of it can be made with our level editor."
Interpretation: measure per-level grid topology and transforms, do not assume one tile spacing. Audit late levels Lv7–10 plus Lv1A/Lv2A against original mesh/modifier/logic/link data and VLM captures. Define editor coverage over structural authoring features as well as placed objects; repeated simple instances must not hide unsupported mechanics. Record observed versus hypothesized behavior, then verify representative reconstructions in the original engine. Research editor source/data formats before freezing JSON schema. Scratch research scripts/evidence remain in .frenzy/reforged until promoted into portable tooling/validation.

Reforged investigation implementation scope: promote read-only scene/grid/component audits and a concise coverage matrix under `research/reforged/`. Treat coverage as unproven until authored JSON round-trips through the engine and the GUI exposes the required operations. Next isolated runtime probe will execute genuine embedded CPython 2.6 JSON parsing and BGE object access in an opt-in authoring path; original startup remains the reference regression. The eventual level assembler must retain original mesh collision flags, hierarchy, IPO motion and cross-object logic connections rather than replacing the game engine.

Reforged implementation decision (after the browser Python probe passed): assemble authored JSON into original Blender object/mesh data before the original converter creates physics and gameplay. Retain original object templates, their logic bricks, animations, sounds and material data. JSON declares instance IDs, template IDs, transforms/hierarchy, editable settings and explicit connections. Original-scene blueprints must expose those fields, not embed an opaque binary scene. Mesh editing must happen before conversion so collision geometry changes with visuals. Preserve original edition startup; opt-in custom arguments only. Build GUI palette/inspector, variable snap grid, direct selection/movement, wall editing, directed link editing, undo/redo, import/export/local saves, and original-engine play preview. Validate bridge and scene round-trips before coverage claims. Runtime source bundle and public artifacts need rebuilding after final source edits.

The embedded Python 2.6.2 probe passed JSON parsing, cloning the inactive original Walrus using scene.addObject, placement, custom properties, deletion, and five active runtime callbacks. BGE object names retain the `OB` prefix in this engine. Portable validation artifacts belong in validation/reforged/; browser execution uses a candidate runtime override without changing the currently shipped original player.

### Editor integration verification
The first Lv10 JSON reconstruction assembled 176 original-template objects and rendered its four chambers. This is a runtime proof, not the coverage result. Verify editor loading, actual placement/geometry/connections, persistence and playtest with automated browser interactions and VLM captures. Add an opt-in Python status callback observing original collision sensors to verify authored finishes; do not replace original movement or physics. Editor preview uses original mesh geometry transformed into a top-down map; original-engine playtest is the rendering oracle.

### Editable wall topology
Extend geometry JSON with explicit faces referencing an original template face for its material, UV defaults, vertex colors and collision flags. Reallocate original Blender CustomData layers through its own APIs, then recalculate normals/bounds before conversion. This allows drawn walls and junctions with real collision; arbitrary pointer or material addresses are never accepted. Preserve simple same-topology vertex edits. Face removal remains explicit and undoable.

### Map appearance and component editing
Extract original packed/external image pixels into PNG previews for the editor; retain exact original mesh UVs for top-down textured triangles. This is a preview asset conversion, not a replacement game renderer. Missing original images must remain explicitly recorded. Improve placement to expose distinct component variants rather than one arbitrary representative per category. Portal controls expose destinations by portal instance and direction; retain an advanced view of original logic settings.

### Authored challenge and verification
Create `tooling/reforged/create_challenge.mjs` to assemble a new serpentine challenge JSON from explicit original template instances and the editor's wall geometry helper. Retain original collision, movement and spawning logic. Keep inactive component templates available to original actuators. Verify a complete route using real browser key events and read-only Python position/finish-contact observation; no teleporting or replacement physics in the winning test. Reuse a small local validation server across editor and challenge probes. Continue native JSON bounds validation before release.

### User theme refinement
> https://ryanndagreat.github.io/WebSurge/src/ <--- themes Alright, well you know what's coming. I don't really like the theming of this very much, so I'm gonna say that your theming can add a little bit more spice to it. Take a look at the themes here. In fact, why don't you have a salvation to it, because it's not the most critical task. Your editor theme and project theme really should have the ability to select between things like this. By the way, note that themes on that site was actually kind of sloppily done, but you get the general idea. I want to take the essence, the intention from that, and then transfer it here for those different themes.

Interpretation: inspect the linked theme choices, reproduce their visual character through maintainable shared design tokens and a persistent theme selector on both original game and Reforged editor. Preserve ongoing original-engine coverage and authored-level validation priorities. Do not copy the reference's implementation defects.

### JSON adapter validation refinement
The workshop scene enables original layer20, so choosing layer20 unconditionally for inactive instances is invalid. Select an unused original layer bit explicitly and reject scenes with no free layer. Guard float32 coordinate/UV capacity and original property string capacity before handing values to Blender. Preserve integer and numeric property semantics with complete range-checked parsing. Theme code lives in shared `web/themes.js`/`themes.css`; fifteen reference-inspired choices persist across game/editor/embedded playtest. Theme changes repaint editor chrome and map guides but never change original game framebuffer materials.

Theme validation correction: bring the editor tab to the foreground before its initialization check and use explicit interval polling for cross-tab synchronization. Background tabs can suspend animation-frame polling; this must not be mistaken for failed initialization. Keep launch-overlay contrast tokens centralized with the shared theme variables.

### Three authored levels and level selection — user request
> If you're feeling extra ambitious, why don't you have three agents try to design three levels for me? That way I can try to play them. Of course, there's gotta be obviously some way to select user-generated levels.

Delegate three distinct level designs to three agents, each owning a separate JSON, generator and validation evidence path. Use the actual original-engine JSON pipeline and original components; each should verify a winning route with real keyboard input. Root owns shared runtime/editor fixes and a discoverable level browser supporting bundled authored levels and user-imported JSON, then integrates and validates the set. Avoid agents overwriting shared files or claiming verified completion from loading alone.

Original collision observation: post-frame `hitObject` is cleared by KX_TouchSensor::EndFrame. Add an opt-in browser observation callback immediately before scene->LogicEndFrame in the original engine, calling the authoring script's optional reforged_contacts(scene). This observes genuine sensors while their hit objects still exist; it does not alter sensor conditions, inputs, physics or actuator execution. The normal original edition has no callback. Python latches a confirmed player/finish collision and post-frame status reports it. Callback errors must abort visibly. This preserves original collision predicates instead of replacing victory with proximity.

Level browser implementation: web/levels/ is the shared entry for bundled authored challenges and browser-local imported JSON. A small catalog points at the actual level files. Cards provide Play and Edit actions; imported files are stored under reforged-levels-v1, can be exported or removed, and use the existing exact runtime/editor storage handoffs. The original edition remains reachable. Show author/difficulty/description from catalog, never label a level verified until the keyboard collision proof passes. Use the same theme selector, keyboard-accessible controls, visible import errors and honest browser-local storage wording.

Editable component settings: supplement the preview library with decoded original game-property values/types and object IPO animation curves. Expose property overrides and curve key coordinates in the inspector; native assembly copies the original IPO before applying explicit curve edits, retaining unchanged templates. This addresses moving-hazard paths and stateful switch configuration rather than counting mere object placement as authoring coverage. Validate allowed channels, key counts and finite coordinates; original source files remain untouched.

Native assembly checks will require every original logic brick exactly once, preventing omitted or duplicated JSON entries from retaining copied pointers. IPO edits are optional per-instance copies with the same channel/key layout as the original template, editable times/values/handles and interpolation. Wall carving will remove the selected cell's hidden collision surfaces along with its visible face and support both original and newly drawn topology; validate it through a real keyboard crossing.

Editor finishing work: keep the component palette populated from the selected original blueprint even after an instance is deleted, provide explicit property and original IPO-key editing, preserve both visible and hidden mesh surfaces when carving, wrap the toolbar on smaller desktop windows, and use Reforged-specific movement instructions. Validate actual mouse/import/save/catalog flows and original-engine collision/animation behavior before claiming coverage. Three authored levels now have genuine keyboard-only winning traces; their level JSON and validation evidence will ship together.

Shape editing includes numeric world-space XYZ coordinates for individual original or authored vertices, so multi-height/off-grid geometry is editable rather than only movable in a top-down view. Keep a local module declaration under web/reforged for Node-based geometry/generator validation. Browser validation compares intact versus carved collision with real WASD input and verifies local level save/import persistence.

Final coverage validation will reconstruct all six audited late scenes with explicit original property values and IPO keys through the editable JSON fields, capture their original-engine rendering, and separately exercise GUI edits, native wall collisions, portal transfers, turret timing and completed routes. Round-trip loading alone will be reported as serialization evidence, not as proof of every mechanic or full playthrough equivalence.

Grid origin receives explicit X/Y controls as well as spacing, subdivisions and snap. Validation will exercise palette placement after deletion, vertex height, portal destinations and animation key edits through the displayed controls. The six explicit late-scene captures have now been VLM reviewed: original wall/junction layouts, colored hazards, floor regions, moving projectors and goal placement are present; unsynchronized animation phases are not pixel-equivalence claims.

Connection authoring must support adding and removing connections, including an originally empty switch controller; editing only existing connections is insufficient. Add a compact connector with source brick and destination choices over component hierarchies. Preserve original brick types and expose sensor→controller and controller→actuator connections explicitly. This closes the switch/forcefield composition gap without introducing replacement gameplay logic.

Final authoring verification exercises the actual GUI controls for new connections, grid origin, world-space vertex height, and IPO key values, then loads the resulting JSON in original BGE. A test-only Python observer reports forcefield properties and orientation without changing objects. The production observer remains read-only. Add reciprocal portal pairing using the existing destination as the chosen peer; preserve original spawn logic. Document concrete coverage and limitations before publishing.

Palette placement must work in the authored challenges where original components are retained inactive as runtime templates. Include the original scene's active component blueprints in the palette even when their current instances are inactive, and restore each placed hierarchy's blueprint activation. Otherwise an empty challenge would misleadingly hide turrets and portals. Validate placement after deletion and after deactivation, not only the full original scenes.

Expose a component-part selector for child objects so invisible emitter children and their properties/animation keys are reachable without pixel hunting. Coverage auditing will inspect every active gameplay root and child in the six late scenes through this GUI, exercise duplicate/undo, and record excluded presentation objects separately. Pair the structural inventory with native behavioral tests; do not equate the inventory percentage with full Blender feature coverage or full original-level playthroughs.

Release UI: provide direct URLs for the three bundled levels, while imported user levels still use the browser-local play handoff. Reject unknown bundled names explicitly. Show genuine canvas screenshots as level-card previews (captured directly from the running engine). Expose editor/import failures in the visible status, and document that local saves require JSON export for backup or sharing. Existing original-game startup stays the default route.

### Corner styling refinement
User: "You really gotta cool it with the rounded corners, my man. Rounded corners are only nice to a limit. It's easy to get sick of them. Chamfered corners, on the other hand, those can look pretty nice. But it might be a challenge to implement."
Use mostly square restrained corners instead of pill controls and large card radii. Add small cut corners to primary buttons and level cards without clipping editor menus or focus interaction; inspect the shared themes before publishing.

### Reforged release verification and packaging
The static level browser is `web/levels/`, editor `web/reforged/`, and named challenges use `?reforged=Switchback|Crossfire|Parallax`. JSON assembly runs before original Blender conversion; original physics, sensors, animation and assets execute normally. Six late-scene reconstructions, 175 gameplay-root GUI duplication/inspection checks, native carve collision, GUI switch wiring, edited IPO motion, and all three real-key winning routes are recorded under `validation/reforged/`. Coverage is the audited component inventory and tested authoring families, not every Blender feature. Publish candidate runtime files plus regenerated corresponding-source bundle, build static site, then original-game regression and live catalog smoke before notifying. Local JSON saves must be exported for sharing; no hosted community database is implied.

### Preview and panel-layout refinement
User: "Well don't just use square corners alone. The problem is you got bubbles inside bubbles inside bubbles. Whereas you could have had lines from wall to wall cleanly like Mondrian instead of, you know, Bubble Boy making Web 2.0 bubbly bubbles. This is supposed to look like a professional user interface, not Shopify."
User: "In the meanwhile, how can I... can you create like a second work tree in a private folder or something? And then launch a server so that I can... like on a port that you're not using, just so that I can play with the editor. Keep editing it, I'm just curious to see where you are right now. Notify me when it's up and open it in my browser."
Provide an isolated Git worktree snapshot under a private local directory and loopback-only server on a free port. Open the editor in the user's browser and notify this preview milestone immediately, independently of the final completion notification. Keep the main workspace progressing toward publication. Refine composition into contiguous panels, full-width section rules and compact control rows instead of nested card containers; corner changes alone are insufficient.

### Component previews and perspective
User: "Also, the component symbols are super abstract. Don't we have access to just make actual pictures instead of having these abstract symbols? I mean, of course, have a VLM take a look at them to verify that they actually help. You can use symbols where you can't come up with anything good. But like... yeah. We should also be able to toggle perspective mode inside the editor. By default it could be turned off. But as you can tell, reflections look super ugly when we don't have perspective turned on."
Use recognizable pictures from original component geometry/textures in the palette, verified visually, retaining symbols only when they communicate better than an empty/invisible asset. Add editor perspective toggle default off; keep picking and placement consistent with the selected view and preserve original-engine Playtest as rendering reference.

### Editor camera implementation
Add a default-off overhead perspective camera to the editing canvas, with a modest tilt and a matching inverse ray/plane map for placement and drag operations. Sort visible mesh faces by camera depth, retaining original textures and hidden-face exclusion; this is a geometry preview, while Playtest remains the original material/physics reference. Grid drawing must use the actual grid origin, and snapping must honor that same origin (previous UI exposed origin without applying it). Validate projection round trips, actual perspective selection and movement, and default-off reload behavior.

User: "Hey, you have bigger fish to fry, so have a sub-agent work on all the UI prettiness stuff."
Delegated contiguous panel styling and original-asset palette previews to editor_ui; root owns perspective geometry/input and runtime/release verification. Perspective must respect original OB_RESTRICT_RENDER (restrictflag bit4) and TF_INVISIBLE face flags, verified against original converter source. Export those render restrictions in metadata so collision-only Bounds never obscure the editor view.

### Final editor color integration and delivery
Use exported original per-corner vertex paint in both palette thumbnails and map faces. Canvas authoring previews average colors per face and multiply source textures over that paint; they do not reproduce native lighting. The original-engine playtest remains authoritative. Final checks cover all fifteen themes, default-off perspective and selection, original gameplay/audio, published level catalog and editor, before the requested completion notification.

### Published Reforged release
The original engine, level catalog and workshop are published under https://ryanndagreat.github.io/ClarasHardestGame/ . Catalog: levels/ ; editor: reforged/ . Bundled challenges are Switchback, Crossfire and Parallax, each with a genuine keyboard-only finish recorded. Live catalog validation boots all three through the deployed WASM at 1920×1080 and opens Parallax in the editor with no browser exceptions. `validation/reforged/live-catalog-results.json` and the release screenshots record this check. The private preview remains intentionally available at port 8877 in the requested isolated worktree; no pending builds or agent jobs remain.
