#!/bin/sh
set -eu
umask 077
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
BIN_DIR="${SECRET_BIN_DIR:-$HOME/.local/bin}"
case "$BIN_DIR" in /*) ;; *) printf 'SECRET_BIN_DIR must be absolute.\n' >&2; exit 1 ;; esac
if [ ! -x "$ROOT/localotp/bin/localotp" ]; then
  "$ROOT/localotp/scripts/build.sh"
fi
/usr/bin/codesign --verify --strict "$ROOT/localotp/bin/localotp"
/bin/bash -n "$ROOT/secret"
mkdir -p "$BIN_DIR"
install -m 700 "$ROOT/localotp/bin/localotp" "$BIN_DIR/localotp"
install -m 700 "$ROOT/secret" "$BIN_DIR/secret"
printf 'Installed secret and localotp. Local configuration and vault data were not changed.\n'
