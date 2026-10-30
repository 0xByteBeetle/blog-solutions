"""Static/safety checks only: never starts a validator or generates keys."""
import hashlib
import json
from pathlib import Path
import os
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


class StagedWorkshopTests(unittest.TestCase):
    def test_exact_source_hashes(self):
        manifest = json.loads((ROOT / "source-map.json").read_text())
        for item in manifest["exactPublishedBlocks"]:
            self.assertEqual(hashlib.sha256((ROOT / item["path"]).read_bytes()).hexdigest(), item["sha256"])

    def test_shell_syntax_only(self):
        for name in ("run.sh", "local-harness.sh", "scenario.sh"):
            result = subprocess.run(["bash", "-n", str(ROOT / name)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)

    def test_external_overrides_rejected_before_tools(self):
        for variable in ("SOLANA_URL", "SOLANA_RPC_URL", "ANCHOR_PROVIDER_URL", "WORKSHOP_RPC_URL"):
            env = dict(os.environ)
            for key in ("SOLANA_URL", "SOLANA_RPC_URL", "ANCHOR_PROVIDER_URL", "WORKSHOP_RPC_URL"):
                env.pop(key, None)
            env[variable] = "https://api.devnet.solana.com"
            result = subprocess.run(["bash", str(ROOT / "run.sh"), "--execute-local"], env=env, capture_output=True, text=True)
            self.assertEqual(result.returncode, 2, result.stderr)
            self.assertIn("URL overrides forbidden", result.stderr)

    def test_bad_ports_rejected_before_tools(self):
        for port in ("abc", "0", "65535", "22999;echo unsafe"):
            env = dict(os.environ, WORKSHOP_RPC_PORT=port)
            result = subprocess.run(["bash", str(ROOT / "run.sh")], env=env, capture_output=True, text=True)
            self.assertEqual(result.returncode, 2)
            self.assertIn("Invalid loopback port", result.stderr)

    def test_local_only_configuration_is_explicit(self):
        text = (ROOT / "local-harness.sh").read_text()
        self.assertIn('RPC="http://127.0.0.1:$RPC_PORT"', text)
        self.assertIn('spl-token --url "$RPC" -C "$CONFIG"', text)
        self.assertNotIn("--clone-feature-set", text)
        self.assertNotIn("~/.config/solana", text)
        self.assertIn('mktemp -d "$ROOT/.local/run-XXXXXXXX"', text)


if __name__ == "__main__":
    unittest.main()
