#!/usr/bin/env python3
"""Configuration routing checks; no enrolled data or real Keychain entries."""
import os
from pathlib import Path
import subprocess
import tempfile

root = Path(__file__).resolve().parents[1]
cli = root / "secret"
native = root / "localotp/bin/localotp"

def run(args, env):
    return subprocess.run(args, env=env, capture_output=True, text=True, timeout=15)

with tempfile.TemporaryDirectory(prefix="secret-config-") as temp:
    folder = Path(temp)
    engine = folder / "engine with spaces"
    engine.write_text('#!/bin/sh\n[ "$LOCALOTP_VAULT_DIR" = "$EXPECTED_VAULT" ] || exit 41\n[ "$#" -eq 3 ] && [ "$1" = code ] && [ "$2" = "alias with spaces" ] && [ "$3" = --stdout ] || exit 42\nprintf "PUBLIC_ROUTING_OK\\n"\n')
    engine.chmod(0o700)
    config = folder / "config"
    index = folder / "index"
    vault = folder / "vault with spaces"
    config.write_text(f'SECRET_OTP_BIN="{engine}"\nSECRET_INDEX_DIR="{index}"\nLOCALOTP_VAULT_DIR="{vault}"\n')
    env = dict(os.environ, SECRET_CONFIG_FILE=str(config), EXPECTED_VAULT=str(vault))
    result = run([str(cli), "otp", "code", "alias with spaces"], env)
    assert result.returncode == 0 and result.stdout == "PUBLIC_ROUTING_OK\n", "Configured routing failed"
    assert (index / "index").is_file(), "Configured credential index not selected"
    result = run([str(cli), "list"], env)
    assert result.returncode == 0, "Names listing failed"
    # Default rc discovery, independent of the user's real HOME.
    (folder / ".secretrc").write_text(config.read_text())
    default_env = dict(env, HOME=str(folder))
    default_env.pop("SECRET_CONFIG_FILE", None)
    result = run([str(cli), "otp", "alias with spaces"], default_env)
    assert result.returncode == 0 and result.stdout == "PUBLIC_ROUTING_OK\n", "Default rc discovery failed"
    # Native path validation and empty-store listing do not create Keychain keys.
    native_env = dict(os.environ, LOCALOTP_VAULT_DIR=str(vault))
    result = run([str(native), "list"], native_env)
    assert result.returncode == 0 and result.stdout == "" and vault.is_dir(), "Native vault routing failed"
    for value in ("", "relative-private-path"):
        result = run([str(native), "list"], dict(native_env, LOCALOTP_VAULT_DIR=value))
        assert result.returncode != 0 and "configuration" in result.stderr, "Invalid vault config accepted"
        assert not value or value not in result.stderr, "Config value reflected in error"
print("RC discovery, override routing, argument boundaries, and native vault configuration checks passed.")
