import copy
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import subprocess
import sys
import threading
import unittest
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from events import BLOCK, TOKEN, SENDER, TRANSFER, decode, fetch_logs, request_body


class EventTests(unittest.TestCase):
    def setUp(self):
        self.document = json.loads((ROOT / 'fixtures/transfer.json').read_text())

    def test_exact_article_filter(self):
        self.assertEqual(request_body()['params'], [{'fromBlock': BLOCK, 'toBlock': BLOCK, 'address': TOKEN,
                                                    'topics': [TRANSFER, '0x' + '00' * 12 + SENDER[2:]]}])

    def test_indexed_addresses_and_uint256_data_word(self):
        record = decode(self.document)[0]
        self.assertEqual(record['from'], SENDER)
        self.assertEqual(record['to'], '0x2a51ae0ad42dc7d2eb89462a7d41e79502bcf697')
        self.assertEqual(record['raw_units'], '1000000000000000000')
        self.assertEqual(int(record['block'], 16), 25356396)
        self.document['result'][0]['data'] = '0x' + 'ff' * 32
        self.assertEqual(decode(self.document)[0]['raw_units'], str(2**256 - 1))

    def test_removed_logs_are_excluded(self):
        self.document['result'][0]['removed'] = True
        self.assertEqual(decode(self.document), [])

    def test_malformed_topic_data_and_erc721_shape_rejected(self):
        for mutation in ['padding', 'size', 'erc721', 'signature']:
            doc = copy.deepcopy(self.document); log = doc['result'][0]
            if mutation == 'padding': log['topics'][1] = '0x01' + log['topics'][1][4:]
            elif mutation == 'size': log['data'] = '0x01'
            elif mutation == 'erc721': log['topics'].append(log['data']); log['data'] = '0x'
            else: log['topics'][0] = '0x' + '00' * 32
            with self.subTest(mutation=mutation), self.assertRaises(ValueError): decode(doc)

    def test_rpc_errors_are_not_empty_results(self):
        for doc in [{'error': {'code': -32601}}, {'result': None}, {'result': {}}]:
            with self.assertRaises(ValueError): decode(doc)

    def test_read_only_mock_rpc_and_cli(self):
        received = []
        document = self.document
        class Handler(BaseHTTPRequestHandler):
            def do_POST(self):
                received.append(json.loads(self.rfile.read(int(self.headers['Content-Length']))))
                self.send_response(200); self.end_headers(); self.wfile.write(json.dumps(document).encode())
            def log_message(self, *args): pass
        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
        try:
            self.assertEqual(fetch_logs(f'http://127.0.0.1:{server.server_port}', request_body()), decode(document))
        finally:
            server.shutdown(); server.server_close(); thread.join()
        self.assertEqual(received, [request_body()])
        output = subprocess.check_output([sys.executable, 'events.py', 'decode'], cwd=ROOT, text=True)
        self.assertEqual(json.loads(output), decode(document))


if __name__ == '__main__': unittest.main()
