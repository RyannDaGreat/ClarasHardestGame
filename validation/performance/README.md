# Original-engine performance validation

The optimized runtime rotates a bounded, lazy pool of temporary index buffers instead of repeatedly overwriting one GPU buffer per size. Geometry, index bytes, draw order, the WASM engine, Python data and game data are unchanged. This removes measured graphics backpressure without changing the original simulation clock or reducing resolution.

Chrome/ANGLE Metal on this **Apple M1 Max**, at 1920×1080, measured direct-start Lv10:

| Metric | v0.1.0 | Linked optimized runtime |
|---|---:|---:|
| Rendered frames/second | 16.42 | 59.98 |
| Mean render callback CPU | 8.00 ms | 3.98 ms |
| Mean rendered frame interval | 60.91 ms | 16.67 ms |
| Dispatched key → next render callback end | 28–72 ms | 3.6–16.3 ms |

The keyboard value is a browser instrumentation proxy, **not physical key-to-screen latency**: it excludes hardware input and display scanout. It includes event queue delay. Ten alternating arrow presses were measured per scene. CPU profiles and a controlled allocator-only change support the graphics synchronization diagnosis; no direct GPU timestamp proof is claimed. Refresh scheduling differed between runs (120 versus 60 callbacks/second), so callback rate is recorded separately and never presented as rendered FPS.

All twelve level scenes were profiled and individually VLM reviewed again. Eleven measured 59.2–60.0 rendered FPS; direct-start Lv2 measured 50.1, matching its saved 50 Hz world. Normal Intro startup establishes 60 Hz with different catch-up limits, so diagnostic and normal entry routes must not be compared as identical simulation conditions. The normal-menu/audio smoke is separate. Visual checks are startup/brief-play checks, not completed playthroughs, synchronized pixel equality or Windows parity.

`evidence/results.json` retains exact metrics and artifact hashes; `evidence/*.png` retains candidate captures and the Lv10 baseline. Full CPU profiles/raw frames are generated in ignored `validation/output/`. Existing `validation/levels/` captures retain the first-release all-level/native comparison.

## Reproduce

Install `npm ci --prefix validation`, assemble the site, and serve the repository root on port 8765. Then:

```sh
node validation/performance/profile.mjs http://127.0.0.1:8765/build/ Lv10
```

Repeat with Lv1–Lv10, Lv1A and Lv2A. `HEADFUL=1` selects a visible browser; `BROWSER_EXECUTABLE` selects a Chromium executable. The profiler warms up for three seconds, records real GL draws and engine callbacks, sends ten 60 ms arrow presses separated by 700 ms, and saves JSON/CPU profile/PNG. Exceptions are recorded in JSON and must be inspected; startup failures throw.

For the exact linked helper's correctness regression, open:

```text
http://127.0.0.1:8765/validation/performance/index-ring-regression.html
```

It must report `passed: true`: 3,072 exact indexed pixel checks, two contexts, two size classes, three phases and pool wraps. It verifies bounded/lazy allocation and preservation of the caller's element-buffer binding. The test intentionally changes index-selected vertex colors to expose stale uploads. It passed Chrome 150 with no GL errors.

`index-ring.js` is the original diagnostic injection, used only with `PERF_PATCH` against the baseline. `draw-stats.js` is an optional one-frame draw census. Neither is injected during linked-release measurements. `DETACH_LOG=1` records the rejected DOM-log hypothesis; it did not explain the slowdown.

The accumulation experiment is deliberately excluded: the measured native player has zero accumulation bits. See `../graphics/native-accum/README.md`.

After deployment, a fresh browser loaded the real GitHub Pages URL and measured Lv10 at59.64FPS, with ten arrow presses and no page exceptions. The live JavaScript hash exactly matched the linked candidate. `evidence/live-results.json` preserves that independent deployment check.
