#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../environment.sh"
"$PYTHON" "$runtime_dir/python/prepare.py"
python_source="$runtime_dir/.cache/patched/Python-2.6.2"
mkdir -p "$runtime_dir/build/python"
cd "$runtime_dir/build/python"
# Preserve target facts even if make reruns configure after a source patch.
export MACHDEP=emscripten ac_sys_system=Emscripten ac_sys_release=1 DYNLOADFILE=dynload_stub.o
export ac_cv_sizeof_time_t=8 ac_cv_sizeof_off_t=8 ac_cv_c_bigendian=no
export ac_cv_file__dev_ptmx=no ac_cv_file__dev_ptc=no
trap 'if [[ -f config.log ]]; then mv config.log "$project_dir/.claude_logs/runtime-python-configure.log"; fi' EXIT
if [[ ! -f Makefile ]]; then
  build_machine="$(uname -m)-unknown-$(uname -s | tr '[:upper:]' '[:lower:]')"
  env -u PYTHON emconfigure "$python_source/configure" \
    --host=i686-pc-linux-gnu --build="$build_machine" \
    --without-threads --without-pymalloc --without-signal-module \
    --disable-ipv6 --disable-shared \
    CFLAGS='-O2 -Wno-implicit-function-declaration -Wno-int-conversion -Wno-incompatible-pointer-types'
fi
cat >Modules/Setup.local <<'EOF'
*static*
array arraymodule.c
cmath cmathmodule.c
math mathmodule.c
_struct _struct.c
time timemodule.c
operator operator.c
_weakref _weakref.c
_random _randommodule.c
_collections _collectionsmodule.c
itertools itertoolsmodule.c
binascii binascii.c
EOF
# Shipped grammar and AST sources are already generated; no host Python needed.
env -u PYTHON make -j "$JOBS" libpython2.6.a OPT='-DNDEBUG -O2 -fno-strict-aliasing' \
    -o "$python_source/Include/graminit.h" -o "$python_source/Python/graminit.c" \
    -o "$python_source/Include/Python-ast.h" -o "$python_source/Python/Python-ast.c"
