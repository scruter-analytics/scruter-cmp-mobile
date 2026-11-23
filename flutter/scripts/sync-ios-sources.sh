#!/usr/bin/env bash
# Copies the iOS module's sources into the plugin (ios/vendor/): under CocoaPods the pod `scruter_cmp_flutter` compiles
# them itself and depends on no pod of the CocoaPods trunk, which turns read-only on 2026-12-02. Run it before
# `dart pub publish` and before any build of the example through CocoaPods; `--check` fails when ios/vendor differs
# from ../ios/Sources. Swift Package Manager does not read ios/vendor (Package.swift).
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
from="$here/../ios/Sources"
to="$here/ios/vendor"
if [[ "${1:-}" == "--check" ]]; then
  diff -r "$from/ScruterCMP" "$to/ScruterCMP"
  exit
fi
rm -rf "$to"
mkdir -p "$to"
cp -R "$from/ScruterCMP" "$to/"
# The pod compiles the module and the plugin's Swift into one module, where a file name may appear once.
twice=$(find "$to/ScruterCMP" "$here/ios/scruter_cmp_flutter/Sources" -name '*.swift' -exec basename {} \; | sort | uniq -d)
if [[ -n "$twice" ]]; then
  echo "Swift file names used twice in one module: $twice" >&2
  exit 1
fi
