#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/environment.sh"
bash "$runtime_dir/setup.sh"
"$PYTHON" "$runtime_dir/prepare.py"
bash "$runtime_dir/python/build.sh"
bash "$runtime_dir/graphics/build.sh"

mkdir -p "$runtime_dir/build/tiff"
if [[ ! -f "$runtime_dir/build/tiff/libtiff/tif_config.h" ]]; then
  (
    cd "$runtime_dir/build/tiff"
    trap 'if [[ -f config.log ]]; then mv config.log "$project_dir/.claude_logs/runtime-tiff-configure.log"; fi' EXIT
    # Historical config.sub lacks wasm32. emconfigure still selects actual WASM tools.
    emconfigure "$runtime_dir/.cache/upstream/tiff-3.9.7/configure" --host=i686-unknown-linux \
      --disable-shared --disable-cxx --disable-jpeg --disable-zlib
  )
fi

blender_source="$runtime_dir/.cache/patched/blender-2.49b"
emcc -std=gnu89 -funsigned-char -sNODERAWFS=1 -sEXIT_RUNTIME=1 \
  -I"$blender_source/intern/guardedalloc" -I"$blender_source/source/blender/makesdna" \
  "$blender_source/source/blender/makesdna/intern/makesdna.c" \
  "$blender_source/intern/guardedalloc/intern/mallocn.c" \
  "$blender_source/intern/guardedalloc/intern/mmap_win.c" \
  -o "$runtime_dir/build/makesdna.js"
node "$runtime_dir/build/makesdna.js" "$runtime_dir/build/dna-wasm32.c" "$blender_source/source/blender/makesdna/"
emcmake cmake -S "$runtime_dir" -B "$runtime_dir/build/engine" -DCMAKE_BUILD_TYPE=Release
cmake --build "$runtime_dir/build/engine" -j "$JOBS" --target player
printf '\nBuilt %s\n' "$runtime_dir/build/engine/player.js" "$runtime_dir/build/engine/player.wasm" "$runtime_dir/build/engine/player.data"
