"""Synthetic executable tests: never invokes a real Sui CLI or creates keys."""
from pathlib import Path
import json
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
class Guards(unittest.TestCase):
    def exercise(self, version='sui 1.83.0-fixture', tamper=False, valid_tests=True):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            for name in ['run_move_tests.py','local_cli.py']:shutil.copyfile(ROOT/name,root/name)
            executable=root/'fake-sui'
            executable.write_text('#!'+sys.executable+'\n'+f'''import sys,os,json
from pathlib import Path
if sys.argv[1:]==['--version']:
 print({version!r});sys.exit(0)
assert sys.argv[1:] in [['move','build','--path','move'],['move','test','--path','move','--no-lint']]
config=Path(os.environ['SUI_CONFIG_DIR'])/'sui.keystore'
assert json.loads(config.read_text())==[]
with open('calls.jsonl','a') as f:f.write(json.dumps(sys.argv[1:])+'\\n')
if sys.argv[2]=='test' and {valid_tests!r}:
 for name in ['owned::matching_cap_updates_value','owned::another_notebooks_cap_is_rejected','registry::public_updates_and_admin_reset','registry::another_address_cannot_reset','rules::read_then_freeze','case::wrapped_notebook_keeps_identity','party_counter::repeated_updates_change_value']:
  print('[ PASS ] sui_ownership::'+name)
 print('Test result: OK. Total tests: 7; passed: 7; failed: 0')
if {tamper!r}:config.write_text('["synthetic-tamper-not-a-key"]')
''')
            executable.chmod(0o700)
            result=subprocess.run([sys.executable,str(root/'run_move_tests.py'),'--sui',str(executable)],capture_output=True,text=True)
            calls=(root/'calls.jsonl').read_text().splitlines() if (root/'calls.jsonl').exists() else []
            return result,calls,(root/'.local').exists()
    def test_only_build_and_test(self):
        result,calls,_=self.exercise();self.assertEqual(result.returncode,0,result.stderr);self.assertEqual(len(calls),2)
    def test_wrong_version_stops_before_config(self):
        result,calls,config=self.exercise('sui 0.0.0-wrong');self.assertNotEqual(result.returncode,0);self.assertEqual(calls,[]);self.assertFalse(config)
    def test_success_without_tests_is_rejected(self):
        result,calls,_=self.exercise(valid_tests=False);self.assertNotEqual(result.returncode,0);self.assertEqual(len(calls),2);self.assertIn('seven named Move tests',result.stderr)
    def test_keyless_guard_detects_tamper(self):
        result,calls,_=self.exercise(tamper=True);self.assertNotEqual(result.returncode,0);self.assertEqual(len(calls),1);self.assertIn('empty keystore',result.stderr)
if __name__=='__main__':unittest.main()
