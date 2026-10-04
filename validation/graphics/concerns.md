# Graphics regression concerns

- 2026-10-04: Scope is two independently reproduced GL4ES bugs. Successful tests
  do not prove universal Blender compatibility. Historical screenshots precede
  this portable harness; new captures must be labeled separately.
- 2026-10-04: Browser game still warns about GL_INDEX_LOGIC_OP and default texture
  object zero. Neither warning is suppressed or patched by this test suite.
- 2026-10-04: Portable probes both passed. Temporarily forcing the generated
  wireframe page's reported exit to1 made run.mjs fail with AssertionError despite
  PASS text, confirming exit-status enforcement. Generated page was restored;
  no source/archive change. Current combiner screenshot visually verified.
