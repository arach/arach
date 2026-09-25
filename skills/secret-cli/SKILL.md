---
name: secret-cli
description: Use the local macOS secret CLI and LocalOTP for stored credentials and authenticator codes during authorized development or browser tasks. Use when a task needs a Keychain credential or a TOTP code.
---

# Credentials and authenticator codes

Resolve `secret` from PATH. It loads `$HOME/.secretrc` (or `SECRET_CONFIG_FILE`)
for local storage paths and options. Do not print the local configuration file. Installation
and configuration are documented in `tools/secret/README.md` in this repository.
Machine paths and actual account mappings belong in local configuration or the
encrypted vault, not in this skill. If the CLI is missing, report the missing
installation rather than inspecting unrelated credential files.

## Discover and use

```sh
# Names only.
secret list
secret otp list

# Generate a fresh short-lived code for the chosen local alias.
secret otp code "ACCOUNT_ALIAS"

# Deliver a credential to a trusted child without printing it.
secret run CREDENTIAL_KEY -- trusted-consumer

# Map a stored credential name to the variable expected by the consumer.
secret run --map STORED_KEY=EXPECTED_ENV -- trusted-consumer

# Inject a freshly generated OTP without printing it.
secret run --otp 'ACCOUNT_ALIAS:OTP_ENV' -- trusted-consumer
```

Use local instructions and the requested site's identity to choose an alias.
If the mapping is unclear, clarify it without reading a seed. Never hard-code a
user's accounts or hostnames into this reusable skill.

`secret otp` explicitly prints a code for an authorized recipient. Respect local
output policy; codes are sensitive while valid. Generate immediately before
submission and avoid saving them in documentation, fixtures, commits or public
logs. Never emit seeds, passwords, tokens, vault keys, recovery codes or raw
exports to chat or tool output. Do not capture `secret get` in an agent tool.
Avoid shell tracing and child commands that print their environment. `secret run`
does not redact child output or provide process inspection isolation.

`--map KEY=ENV` and `--otp ALIAS:ENV` may be combined and repeated. The wrapper
resolves credentials before generating OTPs, validates destination names, and
preserves child arguments and exit status. Prefer this path to printing values
or constructing an `env TOKEN=value` command. It launches one command; it does
not refresh a running process or automatically retry mutations. Wrap each
protected operation after builds or long waits so the code is still fresh.

An authentication check proves identity, not permission for every operation.
For example, npm may accept a token for one package and reject it for another
package that requires interactive 2FA. Follow the publisher's supported auth
mode; do not assume an OTP makes an incompatible automation token acceptable.

For browser password entry, use a supported secret-injection channel that keeps
the value out of captured output. Do not retrieve a password into chat as a
fallback. Use the browser tools required by the current environment's instructions.

## Authentication workflow

1. Continue the user's authorized task and inspect the actual site's challenge.
2. For an authenticator-code prompt, select an enrolled alias, generate a fresh
   code, submit promptly, and check the result.
3. If rejected, retry once with a code from the next time window if the challenge
   remains valid. After a second failure, stop retrying and report it; check the
   account mapping and clock without dumping the seed.
4. A passkey, security-key, recovery or human approval challenge requires its own
   supported flow. TOTP does not replace it. Report required user interaction.

Authentication does not add permission to publish, change account settings or
perform other actions outside the current task. Existing task authorization can
cover ordinary code generation; do not add a confirmation step for every code.

For enrollment, use the native hidden terminal prompt with the same configured
vault directory. Do not ask for seeds in chat or dump source exports to debug.
Report a locked Keychain or missing entry as the specific local action needed.
