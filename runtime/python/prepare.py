"""Reconstruct explicit WASM configure answers from pristine CPython 2.6.2."""
from pathlib import Path
import re
import shutil

HERE = Path(__file__).resolve().parents[1]
ORIGINAL = HERE / ".cache/upstream/Python-2.6.2"
SOURCE = HERE / ".cache/patched/Python-2.6.2"
if not SOURCE.exists():
    shutil.copytree(ORIGINAL, SOURCE)

text = (ORIGINAL / "configure").read_text()
pattern = r'  \{ \{ echo "\$as_me:\$LINENO: error: cannot run test program while cross compiling.*?\{ \(exit 1\); exit 1; \}; \}'
matches = list(re.finditer(pattern, text, re.S))
if len(matches) != 3:
    raise RuntimeError('Expected chflags, lchflags and printf cross-build checks')
replacements = [
    '  echo "no (Emscripten has no chflags)"',
    '  echo "no (Emscripten has no lchflags)"',
    '  echo "#define PY_FORMAT_SIZE_T \\"z\\"" >>confdefs.h\n  echo "yes (Emscripten musl supports %zd)"',
]
for match, replacement in reversed(list(zip(matches, replacements))):
    text = text[:match.start()] + replacement + text[match.end():]
destination = SOURCE / "configure"
if destination.read_text() != text:
    destination.write_text(text)
print('CPython: three cross-compile checks use explicit Emscripten answers.')

text = (ORIGINAL / "Modules/posixmodule.c").read_text()
text, count = re.subn(r'\bposix_close\b', 'python_posix_close', text)
if count != 2:
    raise RuntimeError(f'Expected two internal posix_close references; got {count}')
destination = SOURCE / "Modules/posixmodule.c"
if destination.read_text() != text:
    destination.write_text(text)
print('CPython: private posix_close callback renamed to avoid modern libc collision.')
