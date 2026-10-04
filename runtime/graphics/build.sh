#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/../environment.sh"
emcmake cmake -S "$runtime_dir/.cache/patched/gl4es" -B "$runtime_dir/build/gl4es" \
  -DCMAKE_BUILD_TYPE=RelWithDebInfo -DNOX11=ON -DNOEGL=ON -DSTATICLIB=ON
cmake --build "$runtime_dir/build/gl4es" -j "$JOBS"
emcmake cmake -S "$runtime_dir/graphics" -B "$runtime_dir/build/glu" -DCMAKE_BUILD_TYPE=Release
cmake --build "$runtime_dir/build/glu" -j "$JOBS"
