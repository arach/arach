#!/usr/bin/env python3
"""Exercise secret run with synthetic credential/OTP backends, never Keychain."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile

root = Path(__file__).resolve().parents[1]
source = (root / 'secret').read_text()
assert source.count('\nmain "$@"') == 1
fixture = 'PUBLIC_CREDENTIAL_FIXTURE with spaces $() `quotes`\nsecond line'
checks = 0
with tempfile.TemporaryDirectory(prefix='secret-run-') as tmp:
    folder = Path(tmp)
    log = folder / 'access.log'
    engine = folder / 'otp engine'
    engine.write_text('''#!/usr/bin/env python3
import os, sys
with open(os.environ['ACCESS_LOG'], 'a') as f: f.write('otp\\n')
assert len(sys.argv) == 4 and sys.argv[1] == 'code' and sys.argv[3] == '--stdout'
if sys.argv[2] == 'fail':
    print('PUBLIC_GENERATOR_ERROR_SENTINEL', file=sys.stderr)
    sys.exit(2)
if sys.argv[2] == 'invalid': print('PUBLIC_INVALID_CODE_SENTINEL')
else: print('01234567')
''')
    engine.chmod(0o700)
    config = folder / 'config'
    config.write_text(f'SECRET_OTP_BIN={json.dumps(str(engine))}\nSECRET_INDEX_DIR={json.dumps(str(folder / "index"))}\n')
    # Only replace backend access at the dispatch boundary; execute production
    # argument parsing, validation, environment handling and exec unchanged.
    harness = folder / 'secret'
    harness.write_text(source.replace('\nmain "$@"', '''
kc_get() {
  printf 'key\\n' >> "$ACCESS_LOG"
  [ "$1" != MISSING ] || return 1
  [ "$1" != EMPTY ] || return 0
  printf '%s' "$PUBLIC_FIXTURE_VALUE"
}
main "$@"'''))
    harness.chmod(0o700)
    env = dict(os.environ, SECRET_CONFIG_FILE=str(config), ACCESS_LOG=str(log), PUBLIC_FIXTURE_VALUE=fixture, EXPECTED_OTP="01234567")
    for name in ['FIXTURE_TOKEN', 'MAPPED_TOKEN', 'CODE', 'CODE_TWO', 'args', 'values', 'i']:
        env.pop(name, None)

    def run(options, code=None, args=(), expected=0, trace=False):
        global checks
        log.write_text('')
        command = ['/bin/bash'] + (['-x'] if trace else []) + [str(harness), 'run', *options]
        if code is not None: command += ['--', sys.executable, '-c', code, *args]
        result = subprocess.run(command, env=env, capture_output=True, text=True, timeout=10)
        assert result.returncode == expected, (options, result.returncode, result.stderr)
        for sentinel in [fixture, '01234567', 'PUBLIC_GENERATOR_ERROR_SENTINEL', 'PUBLIC_INVALID_CODE_SENTINEL']:
            assert sentinel not in result.stdout + result.stderr, 'Resolved value leaked'
        checks += 1
        return result

    run(['FIXTURE_TOKEN'], 'import os,sys; assert os.environ["FIXTURE_TOKEN"] == os.environ["PUBLIC_FIXTURE_VALUE"]; assert sys.argv[1:] == ["--", "a b", ""]', ['--', 'a b', ''])
    run(['--map', 'FIXTURE_TOKEN=MAPPED_TOKEN'], 'import os; assert os.environ["MAPPED_TOKEN"] == os.environ["PUBLIC_FIXTURE_VALUE"]; assert "FIXTURE_TOKEN" not in os.environ')
    run(['--otp', 'alias with spaces:CODE'], 'import os; assert os.environ["CODE"] == "01234567"')
    run(['--otp', 'alias:with:colons:CODE', '--map', 'FIXTURE_TOKEN=MAPPED_TOKEN'], 'import os; assert os.environ["CODE"] == os.environ["EXPECTED_OTP"]; assert os.environ["MAPPED_TOKEN"] == os.environ["PUBLIC_FIXTURE_VALUE"]', trace=True)
    assert log.read_text() == 'key\notp\n', 'OTP generated before credential access'
    run(['--otp', 'first:CODE', '--otp', 'second:CODE_TWO'], 'import os; assert os.environ["CODE"] == os.environ["CODE_TWO"] == "01234567"')
    run(['--map', 'FIXTURE_TOKEN=args', '--map', 'FIXTURE_TOKEN=values', '--map', 'FIXTURE_TOKEN=i'], 'import os; assert all(os.environ[x] == os.environ["PUBLIC_FIXTURE_VALUE"] for x in ("args", "values", "i"))')
    run(['FIXTURE_TOKEN'], 'raise SystemExit(7)', expected=7)
    run(['FIXTURE_TOKEN'], 'import os,signal; os.kill(os.getpid(),signal.SIGTERM)', expected=-15)
    for options in [[], ['--map'], ['--map', 'BAD'], ['--map', '=DEST'], ['--map', 'KEY='], ['--map', 'KEY=A=B'], ['--map', 'KEY=BAD-NAME'], ['--otp'], ['--otp', 'BAD'], ['--otp', ':CODE'], ['--otp', 'alias:9CODE'], ['--unknown'], ['FIXTURE_TOKEN', '--map', 'OTHER=FIXTURE_TOKEN'], ['--map', 'KEY=CODE', '--otp', 'alias:CODE']]:
        run(options, 'raise SystemExit(91)', expected=1)
        assert not log.read_text(), 'Invalid request accessed a credential'
    run(['FIXTURE_TOKEN'], expected=1)  # Missing delimiter/consumer.
    run(['FIXTURE_TOKEN', '--'], expected=1)
    run(['MISSING'], 'raise SystemExit(91)', expected=1)
    run(['EMPTY'], 'raise SystemExit(91)', expected=1)
    run(['--otp', 'fail:CODE'], 'raise SystemExit(91)', expected=1)
    run(['--otp', 'invalid:CODE'], 'raise SystemExit(91)', expected=1)
    engine.unlink()
    run(['--otp', 'alias:CODE'], 'raise SystemExit(91)', expected=1)
print(f'{checks} secret run checks passed: mappings, OTP injection, validation, redaction, argument boundaries, exit status and Bash 3.2.')
