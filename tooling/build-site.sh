#!/usr/bin/env bash
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$root/.cache"
stage=$(mktemp -d "$root/.cache/site.XXXXXX")
trap 'rm -rf "$stage"' EXIT
cp -R "$root/web/." "$stage/"
mkdir -p "$stage/assets"
cp -R "$root/assets/published/." "$stage/assets/"
touch "$stage/.nojekyll"
node "$root/tooling/validate-site.mjs" "$stage"
# build/ is exclusively generated output, never original game input.
rm -rf "$root/build"
mv "$stage" "$root/build"
echo 'Static site ready in build/'
