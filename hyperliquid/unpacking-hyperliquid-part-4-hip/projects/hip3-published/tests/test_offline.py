"""Supplemental fixture tests. Every API-like response here is synthetic."""
import ast
import hashlib
import json
from pathlib import Path
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from offline import execute_block


class FakeInfo:
    """No transport; these values are test fixtures, not published observations."""
    def __init__(self, url=None, skip_ws=None):
        self.url, self.skip_ws = url, skip_ws
        self.requests = []

    def perp_dexs(self):
        return [None, {"name": "other"}, {"name": "test", "fixture": True}, {"name": "zqjx", "fixture": True}]

    def post(self, path, payload):
        self.requests.append((path, payload))
        assert path == "/info"
        kind = payload["type"]
        if kind == "metaAndAssetCtxs":
            coin = "test:ABC" if payload["dex"] == "test" else "zqjx:DEMO"
            return [{"universe": [{"name": "unrelated"}, {"name": coin, "fixture": True}]}, [{"fixture": "unused"}, {"fixture": "context"}]]
        return {"fixture": True, "kind": kind}

    def query_perp_deploy_auction_status(self):
        return {"fixture": True, "currentGas": "123"}


class FakeExchange:
    def __init__(self):
        self.calls = []

    def perp_deploy_set_oracle(self, *args):
        self.calls.append(args)
        return {"fixture": True, "submitted": False}


class PublishedOfflineTests(unittest.TestCase):
    def test_all_exact_sources_and_python_syntax(self):
        mappings = json.loads((ROOT / "source-map.json").read_text())["mappings"]
        self.assertEqual(len(mappings), 11)
        for item in mappings:
            file = ROOT / "published" / Path(item["path"]).name
            raw = file.read_bytes()
            self.assertEqual(hashlib.sha256(raw).hexdigest(), item["sha256"])
            if file.suffix == ".py":
                ast.parse(raw)  # syntax only, including blocks8/9; never execute them

    def test_register_payload_offline(self):
        output, scope = execute_block(6)
        result = json.loads(output)
        self.assertFalse(result["submitted"])
        self.assertEqual(result["mode"], "DRY_RUN")
        action = result["registerAction"]["registerAsset2"]
        self.assertEqual(action["maxGas"], 50_000_000_000)
        self.assertEqual(action["assetRequest"], {"coin":"demo:ASSET", "szDecimals":2, "oraclePx":"100.0", "marginTableId":10, "marginMode":"strictIsolated"})
        self.assertEqual(action["schema"]["oracleUpdater"], "0x" + "1"*40)
        self.assertEqual(result["firstOracleAction"]["setOracle"]["markPxs"], [[["demo:ASSET", "100.0"]]])

    def test_oracle_payload_does_not_run_a_loop(self):
        result = json.loads(execute_block(11)[0])
        self.assertEqual(result["iterations"], 3)
        self.assertEqual(result["intervalSeconds"], 3.0)
        self.assertFalse(result["submitted"])
        oracle = result["action"]["setOracle"]
        self.assertEqual(oracle["oraclePxs"], [["zqjx:DEMO", "100.12"]])
        self.assertEqual(oracle["markPxs"], [[["zqjx:DEMO", "100.10"]]])
        self.assertEqual(oracle["externalPerpPxs"], [["zqjx:DEMO", "100.11"]])

    def test_discovery_uses_original_indexes_with_mocked_info(self):
        output, scope = execute_block(4, mock_globals={"Info": FakeInfo})
        result = json.loads(output)
        self.assertEqual(result["market"]["actionAssetId"], 120_001)
        self.assertEqual(result["market"]["context"], {"fixture":"context"})
        self.assertEqual(scope["info"].url, "https://api.hyperliquid-testnet.xyz")
        self.assertTrue(scope["info"].skip_ws)
        self.assertEqual(len(scope["info"].requests), 4)

    def test_missing_dex_expected_failure_uses_mock(self):
        with self.assertRaisesRegex(RuntimeError, "__missing_classroom__.*not returned"):
            execute_block(7, mock_globals={"info": FakeInfo()})

    def test_post_registration_snapshot_with_mocked_info(self):
        output, _ = execute_block(10, mock_globals={"info": FakeInfo()})
        result = json.loads(output)
        self.assertEqual(result["metadata"]["name"], "zqjx:DEMO")
        self.assertTrue(result["limits"]["fixture"])

    def test_set_oracle_call_shape_only(self):
        exchange = FakeExchange()
        _, scope = execute_block(20, mock_globals={"exchange": exchange})
        self.assertEqual(exchange.calls, [("demo", {"demo:ASSET":"100.12"}, [{"demo:ASSET":"100.10"}], {"demo:ASSET":"100.11"})])
        self.assertEqual(scope["result"], {"fixture":True, "submitted":False})

    def test_credentials_and_submission_blocks_cannot_run_in_harness(self):
        for block in (8, 9):
            with self.assertRaisesRegex(ValueError, "Only reviewed"):
                execute_block(block)
        with self.assertRaisesRegex(ValueError, "explicit mock"):
            execute_block(4)


if __name__ == "__main__":
    unittest.main()
