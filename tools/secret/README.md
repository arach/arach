# Local credential and OTP tools

`secret` stores credentials in macOS Keychain and delegates OTP generation to
`localotp`, a native Swift executable. The OTP engine encrypts account records
and their index with AES-256-GCM; only the random vault unlock key is stored in
Keychain. Source code and generic agent instructions belong in this repository.
Machine paths, account enrollment, local policy and credentials do not.

## Build and install

Requires macOS 13+, Swift 6, and an available macOS Keychain. From this directory:

```sh
./localotp/scripts/build.sh
./install.sh
```

The installer defaults to `$HOME/.local/bin`; override `SECRET_BIN_DIR` to choose
another absolute directory. Put that directory on PATH. Rebuilding or changing
the executable path can require fresh Keychain authorization. No vault data or
local configuration is created, overwritten, or moved by installation.

## Local configuration

Copy `config.example` to `$HOME/.secretrc`, or set
`SECRET_CONFIG_FILE` to a different local file. Set file permissions to 0600.
This is trusted shell configuration, loaded by `secret`; use it only for paths
and options. Do not put passwords, seeds, tokens or recovery codes in it.
The example uses generic home-relative defaults, not any particular deployment.

| Setting | Purpose |
| --- | --- |
| `SECRET_OTP_BIN` | Absolute path of the installed native OTP executable |
| `SECRET_INDEX_DIR` | Directory for the credential-name index |
| `SECRET_SERVICE_PREFIX` | Keychain namespace for stored credentials |
| `LOCALOTP_VAULT_DIR` | Absolute directory containing the encrypted OTP vault |

`secret` passes the configured vault directory to its native child. A direct
`localotp` invocation uses the environment variable or its home-relative default;
it does not read the shell configuration file. Changing a directory or Keychain
namespace selects a different store; it does not migrate existing entries.
Account aliases are enrolled locally and discovered with `secret otp list`.
Do not publish real account mappings in the skill or example configuration.

```sh
secret list
secret otp list
secret otp code "example-account"
secret run EXAMPLE_TOKEN -- trusted-consumer
```

## Inject credentials and OTPs into a command

Use `secret run` when the consumer accepts environment variables. Values are
resolved inside the wrapper and passed directly to the child; the wrapper does
not print them or put them into an `env` command's arguments.

```sh
# Existing usage stays the same.
secret run EXAMPLE_TOKEN -- trusted-consumer

# A stored credential can have a different name from the consumer's variable.
secret run --map STORED_TOKEN=API_TOKEN -- trusted-consumer

# Inject a fresh authenticator code without printing it.
secret run --otp 'example-account:AUTH_OTP' -- trusted-consumer

# Combine mappings and OTPs; both options may repeat.
secret run --map STORED_TOKEN=API_TOKEN \
  --otp 'example-account:AUTH_OTP' -- trusted-consumer --literal-argument
```

`--map` uses **stored key = destination variable**. `--otp` uses
**account alias : destination variable**; the last colon separates the two,
so aliases may contain spaces or colons when quoted. Destination names must be
valid environment-variable names, and each destination may appear only once.
Arguments after `--` are preserved, including a child's own `--` separator.
Missing credentials, unavailable accounts, or malformed OTP output prevent the
child from starting. Credential lookups happen before OTP generation so a
Keychain prompt does not consume the code's validity window. Child exit status
and normal command I/O are preserved.

Generate an OTP immediately before the operation that needs it. The wrapper
launches one command: it does not refresh a running child's environment, answer
interactive prompts, or retry an operation. A long-running build or release
orchestrator should wrap **each protected API operation**, after preparation
and registry waits, rather than generate one code at the start of the build.

For npm, a successful identity check does not prove that a token may publish a
particular package. Package policy can require authenticated 2FA and reject an
automation token. Use the authentication mode that the package permits; adding
an OTP to an incompatible token is not an automatic fallback. For a publisher
that already uses the operator's npm login, a protected command can be wrapped
with `secret run --otp 'example-account:NPM_CONFIG_OTP' -- npm ...`.

For local enrollment, run `localotp enroll NAME` at a trusted hidden terminal
prompt, with the same vault directory configured in its environment. Never put a
seed on a command line or in a recorded agent session. `secret otp` explicitly
allows short-lived code output; the surrounding task controls its use. It never
prints a seed. `secret get` prints a long-lived credential: do not capture that
command in agent logs. `secret run` does not redact child output or prevent local
process inspection; use a trusted consumer that does not dump its environment.

TOTP supports SHA1/SHA256/SHA512, 6–8 digits and configurable periods. It cannot
satisfy a passkey challenge. Generated codes are not checked against a provider.
The encrypted vault alone cannot be restored without its matching Keychain key.
Local code access reduces factor separation; no per-code biometric gate is imposed.

The generic [secret-cli skill](../../skills/secret-cli/SKILL.md) explains agent use.
Local instructions may define supported sites or output preferences without
committing those details to this repository.

## Validation

```sh
./localotp/scripts/test.sh
python3 scripts/check-config.py
python3 scripts/check-run.py
```

Tests use public RFC fixtures and an isolated disposable Keychain. Node and
Python 3 are needed for interoperability and terminal tests. Builds use temporary
scratch directories under the user's cache folder and remove them afterward.
Machine-specific transfer helpers and historical enrollment reports are not part
of this reusable tool. The generic native private-pipe receiver and encrypted
transfer decoder remain available; never capture seed-bearing pipe data.
