# Graphics regression manifest

Preserve the independent wireframe-quad and texture-combiner regressions using the
portable runtime's existing patched GL4ES archive. Do not modify game data, runtime
patches, or shared build recipes. Root agent owns shared documentation and commits.

`build.sh` compiles both C probes with runtime/.cache/emsdk and the GL4ES headers and
archive in runtime/.cache/patched/gl4es; generated pages live in runtime/build/graphics-tests.
`run.mjs` starts a temporary loopback HTTP server, checks pixel-test PASS output,
captures screenshots, and closes the browser/server. Node dependencies are pinned
by validation/package-lock.json. Reports and historical evidence live here.

All paths derive from the repository; no research scratch dependencies. Failures
must be visible and produce a nonzero exit. These narrowly test two GL defects;
they do not certify arbitrary Blender rendering or replace all-level game checks.

Completed 2026-10-04: both portable probes pass on Chrome150 software WebGL;
evidence/portable-results.json records the exact archive hash and output. Historical
before/after screenshots are labeled in report.txt. No runtime source changes.

Native followup: native-accum/hook.c and README.md preserve original Linux32 context measurement (zeroRGBAaccumbits; diagnostic LOAD GL_INVALID_OPERATION), correcting speculative missingmotionblur claim. No accumulation implementation promoted; root owns publication.
