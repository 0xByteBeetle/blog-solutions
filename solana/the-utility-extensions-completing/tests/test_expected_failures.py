"""Exercise failure classification using subprocess fixtures, never chain tools."""
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
ROOT=Path(__file__).resolve().parents[1]
PROGRAM='Program TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb failed: custom program error: 0x25'
class ExpectedFailureTests(unittest.TestCase):
 def invoke(self, message, code=1):
  with tempfile.TemporaryDirectory(prefix='blog-negative-fixture-') as d:
   env=dict(os.environ, FIXTURE_MESSAGE=message,FIXTURE_CODE=str(code))
   command='source "$1/local-harness.sh"; LOCAL="$2"; fixture() { printf "%s\n" "$FIXTURE_MESSAGE"; return "$FIXTURE_CODE"; }; expect_failure "fixture rejection" "Transfer is disabled for this mint" fixture'
   return subprocess.run(['bash','-c',command,'fixture',str(ROOT),d],env=env,capture_output=True,text=True)
 def test_matching_program_rejection_is_accepted(self):
  p=self.invoke(PROGRAM+'\nTransfer is disabled for this mint');self.assertEqual(p.returncode,0,p.stderr)
 def test_rpc_error_is_not_expected_program_rejection(self):
  p=self.invoke('RPC connection failed');self.assertNotEqual(p.returncode,0);self.assertIn('did not identify Token-2022',p.stderr)
 def test_wrong_program_error_is_rejected(self):
  p=self.invoke(PROGRAM+'\nAccount is frozen');self.assertNotEqual(p.returncode,0);self.assertIn('unexpected program reason',p.stderr)
 def test_success_is_not_a_rejection(self):
  p=self.invoke(PROGRAM+'\nTransfer is disabled for this mint',0);self.assertNotEqual(p.returncode,0);self.assertIn('unexpectedly succeeded',p.stderr)
