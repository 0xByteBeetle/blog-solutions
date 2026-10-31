"""Supplemental article workflow on a fresh owned Anvil; no external RPC or wallet."""
import json
from pathlib import Path
import socket
import subprocess
import signal
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
        estimate = int(rpc('eth_estimateGas',call,'latest'),16)
        assert stored() == empty, 'estimation persisted a write'
        receipt = json.loads(command('cast','send',address,'store((uint256,string))','(25,bob)','--rpc-url',url,'--private-key',KEY,'--json'))
        used = int(receipt['gasUsed'],16) if isinstance(receipt['gasUsed'],str) else receipt['gasUsed']
        assert int(receipt['status'],16) == 1
        actual = rpc('eth_getTransactionReceipt',receipt['transactionHash'])
        assert int(actual['gasUsed'],16) == used and 21000 < used <= estimate
        assert stored() == '0x'+manual[10:]
        print(json.dumps({'fork':'cancun','solc':'0.8.30','calldata':calldata,'estimateGas':estimate,'receiptGasUsed':used,'initialState':'0 / empty','finalState':'25 / bob'},indent=2))
    finally:
        node.terminate()
        try: node.wait(timeout=10)
        except subprocess.TimeoutExpired: node.kill(); node.wait(timeout=10)
        node.stderr.close()

def exit_on_signal(number, _frame):
    # Unwind the existing owned-child/temp-directory finally blocks once.
    signal.signal(signal.SIGINT, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_IGN)
    raise SystemExit(128 + number)


if __name__ == '__main__':
    signal.signal(signal.SIGINT, exit_on_signal)
    signal.signal(signal.SIGTERM, exit_on_signal)
    print(command('forge','test','--gas-report'))
    run()
