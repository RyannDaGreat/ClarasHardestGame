Player shell validation, 2026-10-04
Reproduce after building/serving: node validation/player-ui.mjs http://localhost:8765/build/
Chrome test covers automatic preparation without click, cache-only reload with game asset requests blocked, corruption repair, reported storage denial, one-click start, fullscreen, and mobile width bounds.
Desktop 1440x1100 and mobile 390x844 screenshots individually VLM reviewed: centered Play overlay, visible keyboard requirement, GitHub/keyboard/fullscreen icons and no clipped controls.
Game still requires a keyboard; mobile layout support does not add touch gameplay.
First load has two cache hits because multiple original virtual paths share identical asset bytes. Second visit has 38 hits and zero asset downloads. Runtime/page HTTP caching is separate; this does not test offline page loading or browser eviction policy.
Live Pages verification additionally closed Chrome completely and reopened the same profile: 38 saved hits, zero asset downloads, game/audio started. Reproduce with node validation/browser-cache-restart.mjs URL OUTPUT_DIRECTORY. The profile is stored under the output directory; game asset network requests are blocked in the reopened browser. live-results.json and live-ready.png record the deployed result.
