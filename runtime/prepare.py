"""Copy and patch upstream source in isolation; invoked without arguments."""
from pathlib import Path
import shutil
import re
import subprocess

HERE = Path(__file__).resolve().parent
ORIGINAL = HERE / ".cache/upstream/blender-2.49b"
COPIED = HERE / ".cache/patched/blender-2.49b"
GL4ES_ORIGINAL = HERE / ".cache/upstream/gl4es"
GL4ES = HERE / ".cache/patched/gl4es"
if not COPIED.exists():
    shutil.copytree(ORIGINAL, COPIED)
if not GL4ES.exists():
    shutil.copytree(GL4ES_ORIGINAL, GL4ES, ignore=shutil.ignore_patterns(".git"))
# Always start patches from pinned upstream files, never an edited source.
for relative, patch_name in (
        ("src/gl/listdraw.c", "gl4es-wireframe-quads.patch"),
        ("src/gl/glstate.c", "gl4es-combine-defaults.patch")):
    shutil.copyfile(GL4ES_ORIGINAL / relative, GL4ES / relative)
    subprocess.run(["patch", "-p1", "-i", str(HERE / "patches" / patch_name)],
                   cwd=GL4ES, check=True)

PATCHES = [
    ("intern/SoundSystem/SND_DependKludge.h",
     "#elif defined (__linux__) || (__FreeBSD__) || defined(__APPLE__) || defined(__sun)",
     "#elif defined (__linux__) || (__FreeBSD__) || defined(__APPLE__) || defined(__sun) || defined(__EMSCRIPTEN__)",
     "Select actual OpenAL sound device on Emscripten instead of unknown-platform dummy"),
    ("source/blender/blenkernel/bad_level_call_stubs/stubs.c",
     "verify_ipocurve(struct ID *id, short a, char *b, char *d, int e, short f)",
     "verify_ipocurve(struct ID *id, short a, char *b, char *d, char *bonename, int e, short f)",
     "Match canonical seven-argument IPO editor API in authentic player stub"),
    ("source/blender/blenkernel/bad_level_call_stubs/stubs.c",
     "void clear_last_seq(Sequence *seq)", "void clear_last_seq(void)",
     "Match canonical zero-argument sequencer editor API in authentic player stub"),
    ("source/blender/gpu/intern/gpu_codegen.c", "GPU_shader_unbind(shader);", "GPU_shader_unbind();",
     "Match actual zero-argument GPU unbind implementation"),
    ("source/blender/blenkernel/bad_level_call_stubs/stubs.c", "Material defmaterial;",
     "extern Material defmaterial;", "Single authentic defmaterial definition remains in material.c"),
    ("source/blender/include/BIF_gl.h", "#define glMultMatrixf(x)\t\tglMultMatrixf( (float *)(x))\n#define glLoadMatrixf(x)\t\tglLoadMatrixf( (float *)(x))",
     "#ifdef __EMSCRIPTEN__\n#undef glMultMatrixf\n#undef glLoadMatrixf\n#define glMultMatrixf(x) gl4es_glMultMatrixf((float *)(x))\n#define glLoadMatrixf(x) gl4es_glLoadMatrixf((float *)(x))\n#else\n#define glMultMatrixf(x)\t\tglMultMatrixf( (float *)(x))\n#define glLoadMatrixf(x)\t\tglLoadMatrixf( (float *)(x))\n#endif",
     "Preserve float-matrix helper casts with namespaced gl4es entrypoints"),
    ("source/blender/python/api2_2x/bpy_internal_import.c", '"bpy_import_meth", blender_import, METH_KEYWORDS',
     '"bpy_import_meth", (PyCFunction)blender_import, METH_KEYWORDS',
     "Explicit Python C API cast for keyword callback method entry"),
    ("extern/glew/src/glew.c", "#elif !defined(__APPLE__) || defined(GLEW_APPLE_GLX)",
     "#elif (!defined(__APPLE__) || defined(GLEW_APPLE_GLX)) && !defined(__EMSCRIPTEN__)",
     "Exclude host-only GLX loader on browser platform"),
    ("extern/glew/src/glew.c", "#if defined(_WIN32)\n#  define glewGetProcAddress(name)",
     "#if defined(__EMSCRIPTEN__)\nextern void* gl4es_GetProcAddress(const char* name);\n#  define glewGetProcAddress(name) gl4es_GetProcAddress((const char*)(name))\n#elif defined(_WIN32)\n#  define glewGetProcAddress(name)",
     "Use authentic gl4es renderer entrypoint resolver"),
    ("extern/solid/include/MT/Quaternion.h", "return conjugate / length2();",
     "return conjugate() / length2();", "Fix upstream template missing function call"),
    ("extern/solid/src/complex/DT_BBoxTree.h", "template <typename Shape>\nclass DT_RootData",
     "inline DT_CBox computeCBox(const DT_Convex *p);\ninline DT_CBox computeCBox(MT_Scalar margin, const MT_Transform& xform);\n\ntemplate <typename Shape>\nclass DT_RootData",
     "Declare existing overloads before C++ template definition"),
    ("source/blender/blenlib/intern/storage.c",
     "defined (__sun__) || defined (__sun) || defined (__sgi)",
     "defined (__sun__) || defined (__sun) || defined (__sgi) || defined(__EMSCRIPTEN__)",
     "Use existing POSIX statvfs implementation on Emscripten"),
    ("extern/bullet2/src/BulletSoftBody/btSoftBodyInternals.h",
     "static const T\tzerodummy;", "static const T zerodummy = T();",
     "C++98 explicit value initialization required by modern Clang"),
]
patched_files = {}
for relative, before, after, reason in PATCHES:
    original = patched_files.get(relative)
    if original is None:
        original = (ORIGINAL / relative).read_text()
    if before not in original:
        raise RuntimeError(f"Patch precondition failed: {relative}: {before!r}")
    patched_files[relative] = original.replace(before, after)
    print(f"Patched {relative}: {reason}")
for filename in ("constant.c", "euler.c", "matrix.c", "quat.c", "vector.c", "BGL.c"):
    relative = "source/blender/python/api2_2x/" + filename
    original = (ORIGINAL / relative).read_text()
    for before, after in (("intargfunc", "ssizeargfunc"),
                          ("intintargfunc", "ssizessizeargfunc"),
                          ("intobjargproc", "ssizeobjargproc"),
                          ("intintobjargproc", "ssizessizeobjargproc")):
        original = re.sub(r"\b" + before + r"\b", after, original)
    original = re.sub(r"\(\s*inquiry\s*\)(\s*\w+(?:_len|Length)\b)", r"(lenfunc)\1", original)
    patched_files[relative] = original
    print(f"Patched {relative}: CPython2.6 slot casts, unchanged wasm32 i32 ABI")
relative = "source/blender/nodes/intern/SHD_nodes/SHD_dynamic.c"
original = (ORIGINAL / relative).read_text()
original, count = re.subn(
    r"^([ \t]*)(PyGILState_STATE gilstate[^;]*;|gilstate = PyGILState_Ensure\(\);|PyGILState_Release\(gilstate\);)$",
    r"#ifdef WITH_THREAD\n\1\2\n#endif", original, flags=re.M)
if count != 21:
    raise RuntimeError(f"Unexpected dynamic shader GIL guard count: {count}")
patched_files[relative] = original
print(f"Patched {relative}: {count} GIL synchronization lines gated by actual WITH_THREAD config")
for relative, patched in patched_files.items():
    destination = COPIED / relative
    if destination.read_text() != patched:
        destination.write_text(patched)

glew = (ORIGINAL / "extern/glew/include/GL/glew.h").read_text()
owned = set(re.findall(r"^#define\s+(gl\w+)\s+GLEW_GET_FUN", glew, re.M))
mangle = (GL4ES / "include/GL/gl_mangle.h").read_text()
direct = sorted(set(re.findall(r"^#define\s+(gl\w+)\s+MANGLE\(", mangle, re.M)) - owned)
header = "/* Generated direct GL dispatch; GLEW extension slots retain their loader. */\n#ifndef BLENDER_GL4ES_DIRECT_H\n#define BLENDER_GL4ES_DIRECT_H\n"
header += "\n".join(f"#define {name} gl4es_{name}" for name in direct) + "\n#endif\n"
destination = HERE / "build/gl4es-direct.h"
destination.parent.mkdir(parents=True, exist_ok=True)
if not destination.exists() or destination.read_text() != header:
    destination.write_text(header)
print(f"Generated direct gl4es dispatch for {len(direct)} names; {len(owned)} GLEW macros preserved")

# GL4ES's GL mangling must not rename the separate GLU library's entry points.
glu_header = (HERE / ".cache/upstream/GLU/include/GL/glu.h").read_text()
glu_header, count = re.subn(r"#if defined\(USE_MGL_NAMESPACE\).*?#endif", "", glu_header, flags=re.S)
if count != 1:
    raise RuntimeError(f"Expected one legacy GLU namespace stanza, got {count}")
destination = HERE / "build/include/GL/glu.h"
destination.parent.mkdir(parents=True, exist_ok=True)
if not destination.exists() or destination.read_text() != glu_header:
    destination.write_text(glu_header)
