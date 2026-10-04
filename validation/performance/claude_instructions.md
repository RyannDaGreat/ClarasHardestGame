# Browser performance regressions

The original game must retain its data, graphics, physics and timing while eliminating avoidable host stalls. Root owns game performance profiling (`profile.mjs`, `draw-stats.js`, diagnostic `index-ring.js`) and coordinates browser runs so tests do not compete for GPU time.

`index-ring-regression.html` with `index-ring-regression.js` loads the exact `runtime/browser-support.js` implementation and verifies the renderer adaptation using real WebGL contexts. It checks rendered pixels after queued indexed draws, ring wrap/reuse, multiple power-of-two buffer size classes, caller binding preservation, lazy bounded allocation, and context switching. No engine source or game data is changed by this probe. Browser runners inspect `window.indexRingRegression` for a structured result and retain any thrown error.
