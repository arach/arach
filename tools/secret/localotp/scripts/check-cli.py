#!/usr/bin/env python3
"""Terminal and CLI checks. Synthetic text only; never accesses enrolled records."""
import os
import pty
import select
import signal
import subprocess
import sys
import termios
import time

cli, probe = sys.argv[1:]

def check(condition, message):
    if not condition:
        raise RuntimeError(message)

for args in (["help"], ["--help"], []):
    result = subprocess.run([cli] + args, capture_output=True)
    check(result.returncode == 0 and b"LocalOTP" in result.stdout, "Help failed")

sentinel = "PUBLIC_ARGUMENT_SENTINEL"
for args in ([sentinel], ["list", sentinel], ["enroll", "fixture", "--secret", sentinel],
             ["enroll", "fixture", "--period", "0"], ["code", "fixture", "--secret", sentinel],
             ["remove", "fixture", sentinel], ["enroll", "fixture", "--digits", "9"],
             ["enroll", "fixture", "--digits", "6", "--digits", "8"]):
    result = subprocess.run([cli] + args, capture_output=True)
    check(result.returncode != 0 and not result.stdout, "Invalid arguments accepted")
    check(sentinel.encode() not in result.stderr, "Argument reflected in error")

result = subprocess.run([cli, "code", "fixture"], capture_output=True)
check(result.returncode != 0 and b"requires a terminal" in result.stderr, "Piped output gate failed")
result = subprocess.run([probe], input=b"public fixture\n", capture_output=True, start_new_session=True)
check(result.returncode != 0 and b"accepted" not in result.stdout, "Hidden input fell back to stdin")

def terminal_test(payload, expected_status, interrupt=False):
    pid, fd = pty.fork()
    if pid == 0:
        os.execl(probe, probe)
    output = b""
    status = None
    try:
        deadline = time.monotonic() + 10
        while b"Hidden fixture: " not in output and time.monotonic() < deadline:
            ready, _, _ = select.select([fd], [], [], 0.2)
            if ready:
                output += os.read(fd, 8192)
        check(b"Hidden fixture: " in output, "Hidden prompt missing")
        check(not termios.tcgetattr(fd)[3] & termios.ECHO, "Input echo is enabled")
        if interrupt:
            os.kill(pid, signal.SIGINT)
        else:
            os.write(fd, payload + b"\n")
        while time.monotonic() < deadline:
            ready, _, _ = select.select([fd], [], [], 0.2)
            if ready:
                try:
                    chunk = os.read(fd, 8192)
                    if chunk:
                        output += chunk
                except OSError:
                    pass
            finished, child_status = os.waitpid(pid, os.WNOHANG)
            if finished:
                status = child_status
                break
        check(status is not None, "Input probe did not exit")
        check(termios.tcgetattr(fd)[3] & termios.ECHO, "Terminal echo not restored")
        if interrupt:
            check(os.WIFSIGNALED(status) and os.WTERMSIG(status) == signal.SIGINT, "Signal not preserved")
        else:
            check(os.waitstatus_to_exitcode(status) == expected_status, "Unexpected hidden input result")
            check(payload not in output, "Hidden input was echoed")
    finally:
        if status is None:
            os.kill(pid, signal.SIGKILL)
            os.waitpid(pid, 0)
        os.close(fd)

terminal_test(b"PUBLIC_HIDDEN_INPUT_SENTINEL", 0)
terminal_test(b"A" * 80, 1)
terminal_test(b"", 1, interrupt=True)
print("CLI argument, output gate, no-stdin, hidden echo, overflow and signal checks passed.")
