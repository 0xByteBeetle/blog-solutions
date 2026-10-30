"""Local-only fixture guards; no signing key, validator or RPC is used."""
from pathlib import Path
import subprocess,tempfile,unittest
ROOT=Path(__file__).resolve().parents[1]
class MemoFixtureGuards(unittest.TestCase):
 def test_public_rpc_rejected_before_fixture_or_key_read(self):
  p=subprocess.run(['node',str(ROOT/'assert-memo-program-rejection.mjs'),'/nonexistent-fixture','mint','source','destination','https://api.devnet.solana.com'],capture_output=True,text=True)
  self.assertNotEqual(p.returncode,0);self.assertIn('Only explicit loopback RPC',p.stderr)
 def test_external_fixture_directory_rejected_before_key_read(self):
  with tempfile.TemporaryDirectory(prefix='blog-memo-guard-') as d:
   p=subprocess.run(['node',str(ROOT/'assert-memo-program-rejection.mjs'),d,'mint','source','destination','http://127.0.0.1:22999'],capture_output=True,text=True)
   self.assertNotEqual(p.returncode,0);self.assertIn('Only this article own fresh run directory',p.stderr)
