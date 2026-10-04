# GL4ES graphics regressions

After the portable runtime is built, run from the repository root:

```sh
npm ci --prefix validation
PYTHON=python3 bash validation/graphics/build.sh
node validation/graphics/run.mjs
```

On this project's macOS development machine use
`PYTHON=/opt/homebrew/opt/python@3.10/bin/python3.10` for the build command.
Puppeteer uses its installed browser by default; `BROWSER_EXECUTABLE` may select
another Chromium executable. The runner enables Chromium's software WebGL backend
for headless reproducibility and starts and stops its own loopback server.

Both probes must print PASS, return zero, and produce no browser errors. Outputs,
current screenshots, and `results.json` (including the tested GL4ES archive hash)
are generated under `runtime/build/graphics-tests/`. No runtime source or patch is
modified. Historical before/after screenshots are retained in `evidence/`.

See `report.txt` for the exact defects, observations, and remaining limitations.
