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
from eth_transfers import collect, fetch_trace, quantity, request_body, top_level


def fixture(name):
    return json.loads((ROOT / "fixtures" / name).read_text())


class TransferTests(unittest.TestCase):
    def test_flat_and_nested_schemas_produce_same_committed_transfers(self):
        expected = [
            ("CALL", [], "1000000000000000001"),
            ("CALL", [1, 0], "2"),
            ("CREATE", [2], "3"),
            ("SELFDESTRUCT", [3], "4"),
        ]
        parity, geth = collect(fixture("parity.json")), collect(fixture("geth.json"))
        self.assertEqual(parity, geth)
        self.assertEqual([(r["type"], r["traceAddress"], r["wei"]) for r in parity], expected)
        self.assertEqual(parity[1]["from"], "0x" + "02" * 20)
        self.assertEqual(parity[2]["to"], "0x" + "05" * 20)
        self.assertEqual(parity[3]["from"], "0x" + "05" * 20)
        self.assertEqual(parity[3]["to"], "0x" + "04" * 20)

    def test_flat_error_ancestor_is_applied_even_when_records_are_out_of_order(self):
        document = fixture("parity.json")
        document["result"]["trace"].reverse()
        records = collect(document)
        self.assertEqual(records, collect(fixture("geth.json")))
        self.assertNotIn([0, 0], [r["traceAddress"] for r in records])

    def test_top_level_revert_discards_every_descendant(self):
        for name in ["parity.json", "geth.json"]:
            document = fixture(name)
            frame = document["result"]["trace"][0] if name == "parity.json" else document["result"]
            frame["error"] = "execution reverted"
            self.assertEqual(collect(document), [])

    def test_delegatecall_and_callcode_context_values_are_not_payments(self):
        records = collect(fixture("geth.json"))
        self.assertEqual([r["traceAddress"] for r in records], [[], [1, 0], [2], [3]])
        self.assertEqual(sum(int(r["wei"]) for r in records), 1000000000000000010)

    def test_missing_failed_root_cannot_be_hidden_by_a_partial_flat_trace(self):
        document = fixture("parity.json")
        document["result"]["trace"] = document["result"]["trace"][1:]
        with self.assertRaises(ValueError):
            collect(document)

    def test_incomplete_duplicate_and_invalid_paths_are_rejected(self):
        original = fixture("parity.json")
        variants = []
        doc = copy.deepcopy(original); doc["result"]["trace"].pop(1); variants.append(doc)
        doc = copy.deepcopy(original); doc["result"]["trace"].append(doc["result"]["trace"][0]); variants.append(doc)
        doc = copy.deepcopy(original); doc["result"]["trace"][1]["traceAddress"] = [-1]; variants.append(doc)
        doc = copy.deepcopy(original); doc["result"]["trace"][0]["subtraces"] = 8; variants.append(doc)
        for document in variants:
            with self.subTest(document=document), self.assertRaises(ValueError):
                collect(document)

    def test_wei_stays_exact_and_bad_quantities_do_not_turn_into_zero(self):
        document = fixture("geth.json")
        document["result"]["value"] = hex(2**256 - 1)
        self.assertEqual(collect(document)[0]["wei"], str(2**256 - 1))
        for value in [1.5, True, -1, "0x", "1.2", None]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                quantity(value)
        self.assertEqual(quantity("0x00"), 0)

    def test_self_transfers_do_not_move_funds_between_accounts(self):
        document = fixture("geth.json")
        document["result"]["to"] = document["result"]["from"]
        self.assertEqual([r["traceAddress"] for r in collect(document)], [[1, 0], [2], [3]])

    def test_rpc_errors_null_results_and_unknown_schemas_are_not_empty_successes(self):
        for document in [
            {"jsonrpc": "2.0", "id": 1, "error": {"code": -32601, "message": "method not supported"}},
            {"jsonrpc": "2.0", "id": 1, "result": None}, {}, {"structLogs": []},
        ]:
            with self.subTest(document=document), self.assertRaises(ValueError):
                collect(document)

    def test_top_level_requires_successful_matching_receipt_and_is_not_added_twice(self):
        tx, receipt = fixture("transaction.json"), fixture("receipt.json")
        self.assertEqual(top_level(tx, receipt), collect(fixture("geth.json"))[:1])
        receipt["result"]["status"] = "0x0"
        self.assertEqual(top_level(tx, receipt), [])
        receipt["result"]["status"] = "0x1"; receipt["result"]["transactionHash"] = "0x" + "cd" * 32
        with self.assertRaises(ValueError):
            top_level(tx, receipt)

    def test_top_level_contract_creation_uses_receipt_address(self):
        tx, receipt = fixture("transaction.json"), fixture("receipt.json")
        tx["result"]["to"] = None
        receipt["result"]["contractAddress"] = "0x" + "07" * 20
        record = top_level(tx, receipt)[0]
        self.assertEqual((record["type"], record["to"]), ("CREATE", "0x" + "07" * 20))

    def test_request_shapes_and_invalid_hash(self):
        tx = "0x" + "ab" * 32
        self.assertEqual(request_body(tx)["params"], [tx, ["trace"]])
        self.assertEqual(request_body(tx, "geth")["params"], [tx, {"tracer": "callTracer"}])
        self.assertEqual(request_body(tx)["method"], "trace_replayTransaction")
        self.assertEqual(request_body(tx, "geth")["method"], "debug_traceTransaction")
        with self.assertRaises(ValueError):
            request_body("not-a-transaction-hash")

    def test_read_only_requests_against_owned_loopback_mock(self):
        received = []

        class Handler(BaseHTTPRequestHandler):
            def do_POST(self):
                body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
                received.append(body)
                response = fixture("parity.json" if body["method"] == "trace_replayTransaction" else "geth.json")
                self.send_response(200); self.send_header("Content-Type", "application/json"); self.end_headers()
                self.wfile.write(json.dumps(response).encode())

            def log_message(self, *args):
                pass

        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
        try:
            for schema in ["parity", "geth"]:
                self.assertEqual(fetch_trace(f"http://127.0.0.1:{server.server_port}", "0x" + "ab" * 32, schema), collect(fixture("geth.json")))
        finally:
            server.shutdown(); server.server_close(); thread.join()
        self.assertEqual([r["method"] for r in received], ["trace_replayTransaction", "debug_traceTransaction"])

    def test_cli_fixture_stdin_top_and_invalid_input(self):
        command = [sys.executable, "eth_transfers.py"]
        parsed = json.loads(subprocess.check_output(command + ["parse", "fixtures/parity.json"], cwd=ROOT, text=True))
        piped = subprocess.run(command + ["parse", "-"], cwd=ROOT, input=json.dumps(fixture("geth.json")), capture_output=True, text=True, check=True)
        self.assertEqual(parsed, json.loads(piped.stdout))
        top = json.loads(subprocess.check_output(command + ["top", "fixtures/transaction.json", "fixtures/receipt.json"], cwd=ROOT, text=True))
        self.assertEqual(top, parsed[:1])
        bad = subprocess.run(command + ["request", "bad-hash"], cwd=ROOT, capture_output=True, text=True)
        self.assertNotEqual(bad.returncode, 0)
        self.assertIn("32-byte", bad.stderr)


if __name__ == "__main__":
    unittest.main()
