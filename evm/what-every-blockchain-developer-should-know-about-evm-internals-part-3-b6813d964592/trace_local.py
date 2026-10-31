"""Supplemental article workflow on a fresh owned Anvil; no external RPC or wallet."""
import json
from pathlib import Path
import socket
import subprocess
import time
import urllib.request

ROOT = Path(__file__).resolve().parent
# Public Anvil account 0, NEVER FUND. Used only on the node started below.
KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
SENDER = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'

def command(*args):
    return subprocess.check_output(args, cwd=ROOT, text=True, timeout=180).strip()

def run():
    with socket.socket() as s:
        s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]
    url = f'http://127.0.0.1:{port}'
    node = subprocess.Popen(['anvil', '--host', '127.0.0.1', '--port', str(port), '--hardfork', 'cancun', '--silent'], stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    def rpc(method, *params):
        req = urllib.request.Request(url, json.dumps({'jsonrpc':'2.0','id':1,'method':method,'params':params}).encode(), {'Content-Type':'application/json'})
        with urllib.request.build_opener(urllib.request.ProxyHandler({})).open(req, timeout=15) as response:
            body = json.load(response)
        if 'error' in body: raise RuntimeError(body['error'])
        return body['result']
    try:
        for _ in range(100):
            if node.poll() is not None: raise RuntimeError('Owned Anvil exited')
            try:
                if rpc('eth_chainId') == '0x7a69': break
            except OSError: pass
            time.sleep(.1)
        else: raise RuntimeError('Owned Anvil readiness timeout')
        assert rpc('eth_getTransactionCount', SENDER, 'latest') == '0x0'
        deployed = json.loads(command('forge', 'create', 'src/Storage.sol:Storage', '--broadcast', '--json', '--rpc-url', url, '--private-key', KEY))
        address = deployed['deployedTo']
        assert rpc('eth_getCode', address, 'latest').lower() == command('forge','inspect','src/Storage.sol:Storage','deployedBytecode').lower()
        empty = '0x'+''.join(f'{n:064x}' for n in (32,0,64,0))
        def stored(): return rpc('eth_call', {'to':address, 'data':command('cast','calldata','retrieve()')}, 'latest')
        assert stored() == empty
        calldata = command('cast','calldata','store((uint256,string))','(25,bob)')
        manual = '0xddd356b3'+''.join(f'{n:064x}' for n in (32,25,64,3))+'626f62'+'00'*29
        assert calldata == manual
        call = {'from':SENDER,'to':address,'data':calldata,'value':'0x0'}
        good = rpc('debug_traceCall',call,'latest',{})
        assert good['failed'] is False and good['returnValue'].removeprefix('0x') == ''
        good_ops = [x['op'] for x in good['structLogs']]
        assert good_ops[-1] in ['STOP','RETURN'] and 'SSTORE' in good_ops and 'CALLDATALOAD' in good_ops
        assert stored() == empty, 'successful trace persisted storage'
        bad_data = command('cast','calldata','store((uint256,string))','(101,"too much")')
        bad = rpc('debug_traceCall',{**call,'data':bad_data},'latest',{})
        error = '08c379a0'+''.join(f'{n:064x}' for n in (32,16))+b'Number too large'.hex()+'00'*16
        assert bad['failed'] is True and bad['returnValue'].removeprefix('0x') == error
        bad_ops = [x['op'] for x in bad['structLogs']]
        assert bad_ops[-1] == 'REVERT' and 'SSTORE' not in bad_ops
        assert stored() == empty, 'failed trace persisted storage'
        simulation = subprocess.run(['forge','script','script/DebugStore.sol:DebugStore','--fork-url',url,'-vvvv'],cwd=ROOT,text=True,capture_output=True,timeout=120)
        assert simulation.returncode != 0 and 'Number too large' in simulation.stdout+simulation.stderr
        print(json.dumps({'success':{'failed':good['failed'],'finalOpcode':good_ops[-1],'storageWrites':good_ops.count('SSTORE')},'failure':{'failed':bad['failed'],'returnValue':bad['returnValue'],'finalOpcode':bad_ops[-1]},'stateAfterBoth':'0 / empty','scriptExit':simulation.returncode},indent=2))
    finally:
        node.terminate()
        try: node.wait(timeout=10)
        except subprocess.TimeoutExpired: node.kill(); node.wait(timeout=10)
        node.stderr.close()

if __name__ == '__main__':
    print(command('forge','test','-vv'))
    run()
