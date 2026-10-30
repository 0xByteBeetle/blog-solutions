import os
from pathlib import Path
import subprocess
import sys
import unittest
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import run_local

class RunnerGuards(unittest.TestCase):
    def test_loopback_and_port_bounds(self):
        self.assertEqual(run_local.configuration(30000, {}), 'http://127.0.0.1:30000')
        for value in [0, 1023, 64001, True, '8899']:
            with self.assertRaises(ValueError): run_local.configuration(value, {})
    def test_public_url_override_rejected_before_tools_or_keys(self):
        env = dict(os.environ, SOLANA_URL='https://api.devnet.solana.com', PATH='/nonexistent')
        result = subprocess.run([sys.executable, 'run_local.py'], cwd=Path(run_local.__file__).parent, env=env, capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('URL overrides', result.stderr)
    def test_other_url_override_names_rejected(self):
        for name in ['SOLANA_RPC_URL', 'ANCHOR_PROVIDER_URL', 'WORKSHOP_RPC_URL']:
            with self.assertRaises(ValueError): run_local.configuration(30000, {name: 'https://example.invalid'})
    def test_unsupported_tool_version_stops_preflight(self):
        with patch.object(run_local, 'run', return_value='unreviewed version') as command:
            with self.assertRaises(RuntimeError): run_local.preflight()
        self.assertEqual(command.call_args.args, ('solana', '--version'))

if __name__ == '__main__': unittest.main()
