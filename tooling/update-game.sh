#!/usr/bin/env bash
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
if [ "$#" -ne 1 ]; then
  echo 'Usage: bash tooling/update-game.sh path/to/edited.blend' >&2
  exit 1
fi
if [ -n "${PYTHON:-}" ]; then
  interpreter="$PYTHON"
elif [ -x /opt/homebrew/opt/python@3.10/bin/python3.10 ]; then
  interpreter=/opt/homebrew/opt/python@3.10/bin/python3.10
else
  interpreter=python3
fi
mkdir -p "$root/.cache"
stage=$(mktemp -d "$root/.cache/assets.XXXXXX")
trap 'rm -rf "$stage"' EXIT
"$interpreter" "$root/tooling/asset-pack/package_assets.py" --blend "$1" --output "$stage" --config "$root/tooling/asset-pack/project-paths.json"
# Replace generated delivery data only after every source file has passed verification.
rm -rf "$root/assets/published"
mv "$stage" "$root/assets/published"
bash "$root/tooling/build-site.sh"
echo 'Updated game data. Test build/ locally, then commit assets/published and push master to publish.'
