Original-engine level validation — 2026-10-04

Scope and result
All12 playable level scenes (Lv1–Lv10,Lv1A,Lv2A) start in the real Blender2.49b WASM engine at a1920x1080 internal canvas. Each receives ArrowUp100ms and ArrowRight100ms, with300ms coast after each. Every scene has4 different screenshot hashes,4 recorded key events and0 uncaught page exceptions or failed requests. Each scene's animated/right screenshots was individually visually reviewed. This is startup, animation and brief-input coverage, NOT completed levels, all collisions or all transitions.

Reproduce from repository root
npm --prefix validation ci
node validation/levels/capture-motion.mjs
Optional scene arguments: node validation/levels/capture-motion.mjs Lv1 Lv10
Optional environment: RHG_TEST_URL=http://127.0.0.1:8765/build/ and BROWSER_EXECUTABLE=/path/to/chrome.
Serve the repository on port8765 first. Default browser is Puppeteer's managed installation. Script imports Puppeteer from validation/package.json; no global install or operating-system-specific browser path required. All screenshots/reports are relative to repository root. Logs go to .claude_logs.

Evidence
SCENE-browser-motion-{initial,animated,up,right}.png: full browser screenshots,1920x1180 viewport; canvas1920x1080 displays slightly scaled within browser margins.
SCENE-browser-motion.json: exact keydown/keyup times, error list, frame hashes and runtime hashes.
SCENE-native.png: original Linux Blender2.49b at1920x1080 using QEMU32bit/Xvfb/Mesa llvmpipe. Only starting-scene pointer was changed in disposable fixture; game logic/content unchanged. Original textures and recovered power.png paths mapped. Native screenshots are not synchronized with browser simulation ticks.
summary.json:12scene validation index plus original blend hash and native screenshot hashes.

Runtime tested
player.js SHA256 a0c3bdc00f65b43fda5c6d5bcf61a02461f6832d85380493b5edafaff904b702
player.wasm SHA256 7b3defa8466aa777cb57d485719d61ba6de8a17d526402866d2282abb90a9821
Original blend SHA256 e7f047be356346eebd166e1918ab854c9bf1494dbecd81f44174596f598a18ff
Sweep2026-10-04T09:02–09:04UTC. GL4ES reports buildOct4 2026 05:00:16.

Visual observations after GL default-combine and polygon-line fixes
Lv1: orange corridor, green hazards and pink dots restored; ship moves upward and rotates; death counter unchanged00000.
Lv2: starfield/orange maze, red hazards, pink/green dots correct; ship moves upward and rotates. Stars visible through corner blocks and finish are also in native reference.
Lv3: nested maze with green/pink hazards correct; ship moves upward and rotates.
Lv4: three maze bands and green/pink hazards correct; ship moves slightly down and rotates. Moving barriers/hazards animate.
Lv5: chevrons, blue gems, turrets, colored hazards and green projectiles correct; ship moves upward and rotates.
Lv6: blue/brown floor, switches, gems, cannons and colored hazards match native appearance; ship moves right and rotates.
Lv7: crossed rotating lasers, blue/brown floors, gems and ring cannons correct; ship moves upward and rotates in final test. Earlier unexplained large displacement did not reproduce.
Lv8: correct blue/brown floor regions, cannons, switches and hazards; ship moves upward and rotates.
Lv9: brown floor and repeated laser bands correct; ship moves upward and rotates.
Lv10: all4 blue floor quadrants, blue upper-left balls, colored hazards, lasers and gems correct; ship rotates clearly, but translational movement is not established by these brief frames.
Lv1A: wide corridor, green/pink hazards and blue chevrons correct; ship moves upward and rotates.
Lv2A: segmented maze, red/green/pink hazards, ring cannon and switch correct; ship moves upward and rotates in final test. Earlier large displaced hull anomaly did not reproduce.

Limits and remaining observations
- Browser blue ring streams and Lv10 blue-ball streams are much denser than slow native screenshots. Native QEMU/softwareGL cannot maintain realtime. Captures are not tick-synchronized, so density alone does not identify a browser bug or prove parity. A fixed-tick numerical/native replay remains necessary for exact simulation equivalence.
- VLM supports scene layout, asset/color presence and visible response. It does not establish pixel identity, Windows-original equivalence, numerical physics parity, every death/goal transition or completion of every level.
- Direct-scene startup bypasses earlier-scene state, notably Music/DeathsCam overlays. Normal menu/audio tests are separate in validation/browser-smoke.mjs.
- Console still reports missing original IMHZR.jpg/IMUntitled.004, deprecated alDopplerVelocity, no SDL CDROM support and WebGL invalid-capability disable. None produced an uncaught page exception in this sweep.
- Early white hazards were a GL4ES default texture-combine defect and are fixed in this tested build. Earlier qualitative concerns about broadly brighter floors/starfield are withdrawn after reopening the exact native captures alongside the patched browser: comparable native textures and star-overlaid surfaces are present.
