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

## Working rules
- Treat this repository as a movable, self-contained dump. Runtime paths must be relative to the repository; the historical source location above is provenance only.
- Preserve originals. Inspect binary `.blend` content without opening/resaving it in modern Blender.
- Update this manifest before code changes. Append lessons and progress to `concerns.md`; never remove its history.
- Keep `.claude_todo.md` synchronized and commit meaningful milestones with `[C] ` prefix, using the existing Git identity.
- Research artifacts belong in `.frenzy/`. Logs belong in `.claude_logs/`.
- Python on this Mac uses the installed Homebrew Python 3.10. No `python -c`. Scripts must have clear errors and documented examples; pure helpers need doctests.
- No game remake, new physics engine, or silent missing-asset fallback.

## Initial investigation and planned structure
- `assets/original/`: local unchanged copy of the main game and external sound/texture folders, excluded from Git because the main file exceeds GitHub's file size limit. Asset delivery strategy remains research work.
- `.frenzy/`: ten research briefs, binary asset audit, and temporary research programs.
- `claude_instructions.md`: current project state and reproduction guidance.
- `concerns.md`: append-only investigation history.
- `.claude_todo.md`: task state.
- First inspect header/version, embedded schema, scenes, logic bricks, scripts, asset references, and packed assets. Hash the input to establish identity.
- Research source-engine compilation, emulation alternatives, physics/Python/audio fidelity, graphics, static hosting constraints, preservation baselines, and validation.

## Success criteria and unresolved work
Research must identify the actual on-disk Blender version and a defensible feasibility path. Implementation ultimately must execute original game data in its compatible original engine, pass native-versus-browser behavior checks, deliver audio and keyboard support, render at 1080p without altering timing, and deploy as static files. No browser runtime or compatibility proof exists yet.
