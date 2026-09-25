#!/bin/sh
set -eu
umask 077
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
mkdir -p "$HOME/Library/Caches/codex-builds"
TEST_DIR="$(mktemp -d "$HOME/Library/Caches/codex-builds/localotp-tests.XXXXXXXX")"
trap 'rm -rf "$TEST_DIR"' EXIT HUP INT TERM
node "$ROOT/scripts/transfer-fixture.mjs" "$TEST_DIR/transfer.json"
LOCALOTP_TRANSFER_FIXTURE="$TEST_DIR/transfer.json" LOCALOTP_TEST_KEYCHAIN_DIR="$TEST_DIR/keychains" swift test --package-path "$ROOT" --scratch-path "$TEST_DIR/build"
BIN_DIR="$(swift build --package-path "$ROOT" --scratch-path "$TEST_DIR/build" --show-bin-path)"
xcrun clang -I "$ROOT/Sources/SecureInput/include" "$ROOT/Sources/SecureInput/SecureInput.c" "$ROOT/scripts/input-probe.c" -o "$TEST_DIR/input-probe"
python3 "$ROOT/scripts/check-cli.py" "$BIN_DIR/localotp" "$TEST_DIR/input-probe"
