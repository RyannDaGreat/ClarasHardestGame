#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../environment.sh"
python_source="$runtime_dir/.cache/patched/Python-2.6.2"
emcc "$runtime_dir/python/smoke.c" "$runtime_dir/build/python/libpython2.6.a" \
    -I"$python_source/Include" -I"$runtime_dir/build/python" \
    -O2 -g2 -sALLOW_MEMORY_GROWTH=1 -sSTACK_SIZE=16777216 \
    -sEMULATE_FUNCTION_POINTER_CASTS=1 \
    --preload-file "$python_source/Lib@/python/lib/python2.6" \
    -sENVIRONMENT=node -sASSERTIONS=2 -o "$runtime_dir/build/python/smoke.js"
cd "$runtime_dir/build/python"
node smoke.js
