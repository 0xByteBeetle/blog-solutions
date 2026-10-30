"""Failure-before-action regression tests with fake CLI executables; no RPC or keys."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
DRIVER = r'''#!/usr/bin/env python3
import json,os,sys
from pathlib import Path
name=Path(sys.argv[0]).name;args=sys.argv[1:]
with open(os.environ['TEST_CLI_CALLS'],'a') as f:f.write(json.dumps([name,*args])+'\n')
if name=='spl-token' and args==['--version']:
 print('spl-token-cli '+os.environ.get('TEST_SPL_VERSION','5.5.0'))
elif name in ('solana','solana-test-validator') and args==['--version']:
 print(('solana-cli' if name=='solana' else name)+' '+os.environ.get('TEST_AGAVE_VERSION','3.1.9')+' (client:Agave)')
elif name=='spl-token' and args[-1:] == ['--help']:
 helps=json.loads(Path(os.environ['TEST_CLI_HELP']).read_text());key='global' if args==['--help'] else args[0]
 print(helps[key].replace(os.environ.get('TEST_MISSING_FLAG','UNUSED_TEST_MARKER'),''))
else:
 Path(os.environ['TEST_CLI_ACTION']).write_text(json.dumps([name,*args]));sys.exit(99)
'''

class CliCompatibilityTests(unittest.TestCase):
    def run_preflight(self, mode="--preflight", **overrides):
        with tempfile.TemporaryDirectory(prefix='blog-cli-guard-test-') as temp:
            temp=Path(temp);bindir=temp/'bin';bindir.mkdir()
            # A fixed interpreter avoids PATH recursion and does not invoke a system installer.
            driver=DRIVER.replace('#!/usr/bin/env python3', '#!'+sys.executable)
            for name in ('spl-token','solana','solana-test-validator','solana-keygen','curl'):
                p=bindir/name;p.write_text(driver);p.chmod(0o755)
            env=dict(os.environ, PATH=str(bindir)+os.pathsep+os.environ['PATH'],
                     TEST_CLI_CALLS=str(temp/'calls'),TEST_CLI_ACTION=str(temp/'action'),
                     TEST_CLI_HELP=str(ROOT/'tests/fixtures/cli-help-5.5.0.json'), **overrides)
            for key in ('SOLANA_URL','SOLANA_RPC_URL','ANCHOR_PROVIDER_URL','WORKSHOP_RPC_URL'):
                env.pop(key,None)
            p=subprocess.run(['bash',str(ROOT/'run.sh'),mode],env=env,capture_output=True,text=True,timeout=30)
            self.assertFalse((temp/'action').exists(),'Preflight invoked a key, validator startup or RPC command')
            return p

    def test_reviewed_installed_pair_accepts_complete_capabilities_without_actions(self):
        p=self.run_preflight()
        self.assertEqual(p.returncode,0,p.stdout+p.stderr)
        self.assertIn('runtime NOT verified',p.stdout)

    def test_unsupported_version_rejected_before_actions(self):
        p=self.run_preflight(mode='--execute-local', TEST_SPL_VERSION='5.4.0')
        self.assertNotEqual(p.returncode,0)
        self.assertIn('Unsupported CLI version',p.stderr)

    def test_unreviewed_agave_pair_rejected_before_actions(self):
        p=self.run_preflight(mode='--execute-local', TEST_AGAVE_VERSION='3.2.0')
        self.assertNotEqual(p.returncode,0)
        self.assertIn('reviewed Agave3.1.9 pair',p.stderr)

    def test_missing_capability_rejected_before_actions(self):
        for flag in ('--metadata-address','--enable-permanent-delegate','--interest-rate','--with-compute-unit-limit'):
            with self.subTest(flag=flag):
                p=self.run_preflight(mode='--execute-local', TEST_MISSING_FLAG=flag)
                self.assertNotEqual(p.returncode,0)
                self.assertIn('Required CLI capability absent',p.stderr)
                self.assertIn(flag,p.stderr)

if __name__=='__main__':
    unittest.main()
