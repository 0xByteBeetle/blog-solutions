"""Supplemental keyless build/test runner; no transaction or wallet generation."""
import argparse
from pathlib import Path
import subprocess
import re
import sys
from local_cli import environment, assert_keyless

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--sui', type=Path, required=True)
args = parser.parse_args()
cli = args.sui.resolve(strict=True)
root = Path(__file__).resolve().parent
version = subprocess.run([str(cli), '--version'], check=True, capture_output=True, text=True).stdout.strip()
if not version.startswith('sui 1.83.0-'):
    raise SystemExit('Expected Sui 1.83.0 recorded toolchain; got ' + version)
expected = {
    'sui_ownership::owned::matching_cap_updates_value',
    'sui_ownership::owned::another_notebooks_cap_is_rejected',
    'sui_ownership::registry::public_updates_and_admin_reset',
    'sui_ownership::registry::another_address_cannot_reset',
    'sui_ownership::rules::read_then_freeze',
    'sui_ownership::case::wrapped_notebook_keeps_identity',
    'sui_ownership::party_counter::repeated_updates_change_value',
}
env = environment()
for command in [['move', 'build', '--path', 'move'], ['move', 'test', '--path', 'move', '--no-lint']]:
    try:
        result = subprocess.run([str(cli), *command], cwd=root, env=env, check=False,
                                capture_output=True, text=True)
        print(result.stdout, end='')
        print(result.stderr, end='', file=sys.stderr)
        if result.returncode:
            raise subprocess.CalledProcessError(result.returncode, [str(cli), *command], result.stdout, result.stderr)
        if command[1] == 'test':
            output = result.stdout + result.stderr
            passed = re.findall(r'\[\s*PASS\s*\]\s+(sui_ownership::[\w:]+)', output)
            if len(passed) != 7 or set(passed) != expected:
                raise RuntimeError('Expected all seven named Move tests; observed ' + repr(passed))
            if not re.search(r'Total tests: 7; passed: 7; failed: 0', output):
                raise RuntimeError('Missing seven-pass/zero-failure Move summary')
    finally:
        assert_keyless()
print('PASS: Move build/tests completed with an empty keystore; no transactions')
