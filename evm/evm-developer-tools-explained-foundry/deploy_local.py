"""Deploy the article's Storage to an owned, in-memory Anvil and read it back."""
import json
from pathlib import Path
import socket
import subprocess
import time
import urllib.request

ROOT = Path(__file__).resolve().parent
# Public Anvil default account 0. Never substitute a personal/funded key.
TEST_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
TEST_SENDER = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'


def command(*args):
    return subprocess.check_output(args, cwd=ROOT, text=True, timeout=120).strip()


def main():
    with socket.socket() as reservation:
        reservation.bind(('127.0.0.1', 0))
        port = reservation.getsockname()[1]
    url = f'http://127.0.0.1:{port}'
    node = subprocess.Popen(['anvil', '--host', '127.0.0.1', '--port', str(port), '--silent'],
                            stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    try:
        for _ in range(100):
            if node.poll() is not None:
                raise RuntimeError('Owned Anvil exited: ' + node.stderr.read().decode())
            try:
                req = urllib.request.Request(url, b'{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}', {'Content-Type':'application/json'})
                with urllib.request.build_opener(urllib.request.ProxyHandler({})).open(req, timeout=1) as response:
                    if json.load(response).get('result') == '0x7a69':
                        break
            except OSError:
                pass
            time.sleep(.1)
        else:
            raise RuntimeError('Owned Anvil readiness timeout')
        # Verify this is our fresh fixture, never attach to an existing node.
        assert command('cast', 'nonce', TEST_SENDER, '--rpc-url', url) == '0'
        print('forge create src/Storage.sol:Storage --broadcast --json --rpc-url ' + url + ' --private-key <public Anvil account 0>')
        deployment = json.loads(command('forge', 'create', 'src/Storage.sol:Storage', '--broadcast', '--json', '--rpc-url', url, '--private-key', TEST_KEY))
        address = deployment['deployedTo'].lower()
        assert address == '0x5fbdb2315678afecb367f032d93f642f64180aa3'
        expected = command('forge', 'inspect', 'src/Storage.sol:Storage', 'deployedBytecode').lower()
        assert len(expected) > 2 and command('cast', 'code', address, '--rpc-url', url).lower() == expected
        receipt = json.loads(command('cast', 'receipt', deployment['transactionHash'], '--json', '--rpc-url', url))
        assert int(receipt['status'], 16) == 1
        command('cast', 'send', address, 'store((uint256,string))', '(42,bob)', '--rpc-url', url, '--private-key', TEST_KEY, '--json')
        body = ''.join(f'{n:064x}' for n in (32, 42, 64, 3)) + '626f62' + '00'*29
        assert command('cast', 'call', address, 'retrieve()', '--rpc-url', url).lower() == '0x'+body
        print('PASS deployed address, successful receipt, exact runtime code and retrieve(): 42 / bob')
        print(json.dumps({'address':address,'transactionHash':deployment['transactionHash'],'runtime_bytes':len(bytes.fromhex(expected[2:]))}, indent=2))
    finally:
        node.terminate()
        try:
            node.wait(timeout=10)
        except subprocess.TimeoutExpired:
            node.kill(); node.wait(timeout=10)
        node.stderr.close()


if __name__ == '__main__':
    main()
