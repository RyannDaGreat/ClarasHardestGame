#!/usr/bin/env bash
set -euo pipefail
graphics_dir=$(cd "$(dirname "$0")" && pwd)
source "$graphics_dir/../../runtime/environment.sh"
gl4es_dir="$runtime_dir/.cache/patched/gl4es"
output_dir="$runtime_dir/build/graphics-tests"
test -f "$gl4es_dir/lib/libGL.a"
mkdir -p "$output_dir"
for probe in wireframe combine-defaults; do
  echo "Compiling graphics regression: $probe"
  emcc "$graphics_dir/$probe.c" "$gl4es_dir/lib/libGL.a" \
    -I"$gl4es_dir/include" -O2 \
    -sFULL_ES2=1 -sGL_ENABLE_GET_PROC_ADDRESS=1 -sALLOW_MEMORY_GROWTH=1 \
    -sEXIT_RUNTIME=1 -o "$output_dir/$probe.js"
  sed "s/PROBE_NAME/$probe/g" "$graphics_dir/probe.html" | tee "$output_dir/$probe.html"
done
