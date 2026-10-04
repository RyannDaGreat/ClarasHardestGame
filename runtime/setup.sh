#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/environment.sh"
for command in "$PYTHON" git curl patch cmake make node; do
  command -v "$command" || { echo "Missing host requirement: $command" >&2; exit 1; }
done
"$PYTHON" "$runtime_dir/fetch.py"
cd "$runtime_dir/.cache/emsdk"
./emsdk install 3.1.74
./emsdk activate 3.1.74
emcc --version
