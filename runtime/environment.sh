#!/usr/bin/env bash
# Source from runtime scripts; no user's shell startup files are changed.
runtime_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
project_dir=$(cd "$runtime_dir/.." && pwd)
export PYTHON=${PYTHON:-python3}
export EMSDK_PYTHON="$PYTHON"
export JOBS=${JOBS:-6}
export PATH="$runtime_dir/.cache/emsdk/upstream/emscripten:$PATH"
mkdir -p "$runtime_dir/build" "$project_dir/.claude_logs"
