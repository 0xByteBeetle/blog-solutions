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
        deployment = json.loads(subprocess.check_output(['forge','create','src/PermitVerifier.sol:PermitVerifier','--broadcast','--json','--rpc-url',url,'--private-key',KEY],cwd=ROOT/'permit-verifier',text=True,timeout=180))
        address=deployment['deployedTo']
        output=subprocess.check_output(['go','run','./offline/eip712','--rpc-url',url,'--verifier',address],cwd=ROOT/'transaction-types',text=True,timeout=180)
        assert 'signature valid=true' in output and 'signature valid=false' in output
        print(output)
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
    run()
