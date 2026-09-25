#!/bin/sh
set -eu
umask 077
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
mkdir -p "$HOME/Library/Caches/codex-builds"
BUILD_DIR="$(mktemp -d "$HOME/Library/Caches/codex-builds/localotp-build.XXXXXXXX")"
trap 'rm -rf "$BUILD_DIR"' EXIT HUP INT TERM
swift build --package-path "$ROOT" --scratch-path "$BUILD_DIR" -c release
BIN_DIR="$(swift build --package-path "$ROOT" --scratch-path "$BUILD_DIR" -c release --show-bin-path)"
mkdir -p "$ROOT/bin"
install -m 700 "$BIN_DIR/localotp" "$ROOT/bin/localotp"
codesign --verify "$ROOT/bin/localotp"
printf 'Built %s/bin/localotp\n' "$ROOT"
