"""Focused subprocess signal tests using inert fake services; no chain, keys or real RPC."""
from pathlib import Path
import os,shutil,signal,subprocess,sys,tempfile,time,unittest
ROOT=Path(__file__).resolve().parents[1]
PYTHON=[
'evm/eth_call-vs-debug_tracecall-how-to/local_rpc.py',
'evm/evm-developer-tools-explained-foundry/deploy_local.py',
'evm/evm-message-signtypeddata-eip-712/permit_local.py',
'evm/ethereum-node-types-explained-and-why-they-can-make-or-break-your-debugging-fc8d89b724cc/local_rpc.py',
'evm/gas-matters-how-to-reduce-transaction-costs-in-your-solidity-code-0c0303d61a4f/measure_local.py',
'evm/what-every-blockchain-developer-should-know-about-evm-internals-part-3-b6813d964592/trace_local.py',
'evm/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-2-e8ef96b82768/permit_local.py',
'solana/spl-token-program-architecture-a/run_local.py',
'solana/solana-token-2022-transfer-hooks/run_local.py']
FAKE=r'''#!/usr/bin/env python3
import os,pathlib,sys,time
name=pathlib.Path(sys.argv[0]).name;args=sys.argv[1:]
if '--version' in args:
 print({'anvil':'anvil Version: 1.4.4','forge':'forge Version: 1.4.4','cast':'cast Version: 1.4.4','solana':'solana-cli 3.1.9','solana-test-validator':'solana-test-validator 3.1.9','solana-keygen':'solana-keygen 3.1.9','spl-token':'spl-token-cli 5.5.0'}[name]);sys.exit(0)
if '--help' in args:
 print('--decimals --transfer-fee --transfer-fee-basis-points --transfer-fee-maximum-fee');sys.exit(0)
if name in ('anvil','solana-test-validator'):
 pathlib.Path(os.environ['MOCK_CHILD_PID']).write_text(str(os.getpid()))
 if os.environ.get('MOCK_READY_FAILURE'):sys.exit(9)
 time.sleep(120);sys.exit(0)
if name=='solana-keygen':
 if 'new' in args:
  flag='--outfile' if '--outfile' in args else '-o';pathlib.Path(args[args.index(flag)+1]).write_text('[]')
 else:print('4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi')
'''
def alive(pid):
 try:os.kill(pid,0);return True
 except ProcessLookupError:return False
class OwnedServiceSignals(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.temp=tempfile.TemporaryDirectory(prefix='owned-service-tests-');cls.base=Path(cls.temp.name);cls.bin=cls.base/'bin';cls.bin.mkdir()
  for name in ['anvil','forge','cast','solana','solana-test-validator','solana-keygen','spl-token']:
   p=cls.bin/name;p.write_text(FAKE);p.chmod(0o700)
  cls.targets=[([sys.executable,str(ROOT/p)],(ROOT/p).parent,p) for p in PYTHON]
  node=shutil.which('node')
  if not node:raise RuntimeError('Node is required for the root runner signal regressions')
  if node:
   scripts=cls.base/'node-project/scripts';scripts.mkdir(parents=True)
   for name in ['verify-evm-integration.mjs','check-toolchain.mjs']:shutil.copyfile(ROOT/'scripts'/name,scripts/name)
   cls.targets.append(([node,str(scripts/'verify-evm-integration.mjs')],scripts.parent,'root EVM integration'))
  go=shutil.which('go')
  if not go:raise RuntimeError('Go is required for the native adapter signal regressions')
  if go:
   for i,p in enumerate(sorted(ROOT.glob('evm/**/transaction-types/local*/main.go'))):
    binary=cls.base/f'go-local-{i}';env=dict(os.environ,GOPROXY='off')
    subprocess.run([go,'build','-o',str(binary),'.'],cwd=p.parent,env=env,check=True,capture_output=True,timeout=120)
    cls.targets.append(([str(binary),'--execute-local'],p.parent.parent,str(p.relative_to(ROOT))))
 @classmethod
 def tearDownClass(cls):cls.temp.cleanup()
 def check_case(self,target,mode):
  command,cwd,label=target
  with tempfile.TemporaryDirectory(dir=self.base,prefix='case-') as temp:
   tmp=Path(temp);pidfile=tmp/'child.pid';artifacts=tmp/'temp';artifacts.mkdir()
   env=dict(os.environ,PATH=str(self.bin)+os.pathsep+os.environ['PATH'],MOCK_CHILD_PID=str(pidfile),TMPDIR=str(artifacts))
   for key in ['SOLANA_URL','SOLANA_RPC_URL','ANCHOR_PROVIDER_URL','WORKSHOP_RPC_URL','ANCHOR_WALLET']:env.pop(key,None)
   if mode=='readiness':env['MOCK_READY_FAILURE']='1'
   unrelated=subprocess.Popen(['sleep','120']);p=None;child=None
   try:
    p=subprocess.Popen(command,cwd=cwd,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
    for _ in range(200):
     if pidfile.exists():break
     if p.poll() is not None:break
     time.sleep(.025)
    if not pidfile.exists():
     out,err=p.communicate(timeout=5);self.fail(f'{label}: child not started; {out} {err}')
    child=int(pidfile.read_text())
    if mode!='readiness':p.send_signal(signal.SIGINT if mode=='INT' else signal.SIGTERM)
    out,err=p.communicate(timeout=20)
    if mode=='readiness':self.assertNotEqual(p.returncode,0,(label,out,err))
    else:self.assertEqual(p.returncode,130 if mode=='INT' else 143,(label,out,err))
    for _ in range(30):
     if not alive(child):break
     time.sleep(.02)
    self.assertFalse(alive(child),f'{label}: owned child survived {mode}')
    self.assertIsNone(unrelated.poll(),'unrelated child was stopped')
    self.assertEqual(list(artifacts.iterdir()),[],f'{label}: temporary state survived')
   finally:
    if p is not None and p.poll() is None:p.kill();p.wait(timeout=5)
    if child and alive(child):os.kill(child,signal.SIGKILL)
    unrelated.terminate();unrelated.wait(timeout=5)
 def test_parent_directed_signals_and_readiness_failure(self):
  for target in self.targets:
   for mode in ['INT','TERM','readiness']:
    with self.subTest(runner=target[2],mode=mode):self.check_case(target,mode)
  print(f'Checked {len(self.targets)*3} owned-service signal/readiness cases; no chain services or real keys',flush=True)
if __name__=='__main__':unittest.main()
