"""Supplemental stdlib-only tests; original source remains byte-for-byte intact."""
import json
from pathlib import Path
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from hip3_common import (  # noqa: E402
    build_register_asset2_action, build_set_oracle_action,
    hype_to_native_units, validate_new_dex_name, validate_namespaced_coin,
    validate_perp_price,
)


from finite_builders import (
    build_register_asset2_action_finite, build_set_oracle_action_finite,
)


def register(_builder=build_register_asset2_action, **overrides):
    values = dict(
        dex="demo", coin="demo:ASSET", full_name="Demo", collateral_token=0,
        oracle_updater="0x" + "AB" * 20, max_gas_native_units=50_000_000_000,
        sz_decimals=2, oracle_px="100.0", margin_table_id=10,
        margin_mode="strictIsolated",
    )
    values.update(overrides)
    return _builder(**values)


class OfflineTests(unittest.TestCase):
    def test_native_units_exact_without_rounding(self):
        for value, expected in [("0", 0), ("500", 50_000_000_000),
                                ("0.00000001", 1), ("1.000000010", 100_000_001)]:
            with self.subTest(value=value):
                self.assertEqual(hype_to_native_units(value), expected)
        for value in ("-1", "0.000000001", "1.123456789"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                hype_to_native_units(value)

    def test_namespace_boundaries(self):
        for dex in ("ab", "abc", "abcd"):
            validate_new_dex_name(dex)
            validate_namespaced_coin(dex, dex + ":ASSET")
        for dex in ("", "a", "abcde", "a:b"):
            with self.subTest(dex=dex), self.assertRaises(ValueError):
                validate_new_dex_name(dex)
        for coin in ("demo:", "other:ASSET", "demo:A:B", "demoASSET"):
            with self.subTest(coin=coin), self.assertRaises(ValueError):
                validate_namespaced_coin("demo", coin)

    def test_price_precision_boundaries(self):
        for value, decimals in [("100.0", 2), ("1.2345", 2), ("0.0001", 2),
                                ("1000000", 6), ("1.23000", 2)]:
            validate_perp_price(value, decimals)
        for value, decimals in [("0", 2), ("-1", 2), ("0.00001", 2),
                                ("12.3456", 2), ("1.1", 6)]:
            with self.subTest(value=value, decimals=decimals), self.assertRaises(ValueError):
                validate_perp_price(value, decimals)

    def test_registration_payload_and_guards(self):
        action = register()
        self.assertEqual(action["type"], "perpDeploy")
        registration = action["registerAsset2"]
        self.assertEqual(registration["maxGas"], 50_000_000_000)
        self.assertEqual(registration["schema"]["oracleUpdater"], "0x" + "ab" * 20)
        self.assertEqual(registration["assetRequest"], {
            "coin": "demo:ASSET", "szDecimals": 2, "oraclePx": "100.0",
            "marginTableId": 10, "marginMode": "strictIsolated",
        })
        for fields in ({"max_gas_native_units": 0}, {"max_gas_native_units": -1},
                       {"sz_decimals": -1}, {"sz_decimals": 7},
                       {"margin_mode": "invalid"}, {"collateral_token": -1},
                       {"margin_table_id": 0}, {"oracle_updater": "0x123"}):
            with self.subTest(fields=fields), self.assertRaises(ValueError):
                register(**fields)

    def test_oracle_sorting_and_input_unchanged(self):
        prices = {"demo:Z": "2", "demo:A": "1"}
        action = build_set_oracle_action(dex="demo", oracle_pxs=prices,
                                        mark_pxs=[prices], external_perp_pxs=prices)
        oracle = action["setOracle"]
        expected = [("demo:A", "1"), ("demo:Z", "2")]
        self.assertEqual(oracle["oraclePxs"], expected)
        self.assertEqual(oracle["markPxs"], [expected])
        self.assertEqual(oracle["externalPerpPxs"], expected)
        self.assertEqual(list(prices), ["demo:Z", "demo:A"])

    def test_oracle_validation_boundaries(self):
        base = dict(dex="demo", oracle_pxs={"demo:A": "1"}, mark_pxs=[],
                    external_perp_pxs={"demo:A": "1"})
        for override in ({"oracle_pxs": {}}, {"external_perp_pxs": {}},
                         {"mark_pxs": [{}, {}, {}]}, {"mark_pxs": [{"demo:A": "0"}]},
                         {"mark_pxs": [{"other:A": "1"}]}):
            with self.subTest(override=override), self.assertRaises(ValueError):
                build_set_oracle_action(**(base | override))
        for maps in ([], [{}], [{}, {}]):
            build_set_oracle_action(**(base | {"mark_pxs": maps}))

    def test_characterize_nonfinite_price_validation_gap(self):
        # Current original accepts Infinity; document, don't silently repair.
        self.assertEqual(register(oracle_px="Infinity")["registerAsset2"]
                         ["assetRequest"]["oraclePx"], "Infinity")
        action = build_set_oracle_action(dex="demo", oracle_pxs={"demo:A": "Infinity"},
                                        mark_pxs=[], external_perp_pxs={"demo:A": "Infinity"})
        self.assertEqual(action["setOracle"]["oraclePxs"], [("demo:A", "Infinity")])

    def test_finite_wrappers_preserve_valid_payloads(self):
        self.assertEqual(register(_builder=build_register_asset2_action_finite), register())
        values = dict(dex="demo", oracle_pxs={"demo:A": "1.2300"},
                      mark_pxs=[{"demo:A": "2"}], external_perp_pxs={"demo:A": "3"})
        self.assertEqual(build_set_oracle_action_finite(**values), build_set_oracle_action(**values))
        with self.assertRaises(ValueError):
            register(_builder=build_register_asset2_action_finite, oracle_px="0")

    def test_finite_wrappers_reject_every_nonfinite_price_input(self):
        for value in ("Infinity", "-Infinity", "NaN", "sNaN"):
            with self.subTest(value=value, field="registration"), self.assertRaisesRegex(ValueError, "finite"):
                register(_builder=build_register_asset2_action_finite, oracle_px=value)
            for field in ("oracle_pxs", "mark_pxs", "external_perp_pxs"):
                args = dict(dex="demo", oracle_pxs={"demo:A": "1"},
                            mark_pxs=[{"demo:A": "1"}], external_perp_pxs={"demo:A": "1"})
                args[field] = [{"demo:A": value}] if field == "mark_pxs" else {"demo:A": value}
                with self.subTest(value=value, field=field), self.assertRaisesRegex(ValueError, "finite"):
                    build_set_oracle_action_finite(**args)

    def test_offline_preview_subprocess(self):
        # Only reviewed script02: no SDK import, wallet, API or submission path.
        result = subprocess.run([sys.executable, str(ROOT / "02_preview_actions.py")],
                                cwd=ROOT, capture_output=True, text=True, check=True, timeout=10)
        payload = json.loads(result.stdout)
        self.assertEqual(payload["mode"], "OFFLINE_DRY_RUN")
        self.assertIs(payload["submitted"], False)
        self.assertEqual(payload["maxGas"]["nativeUnits"], 50_000_000_000)
        self.assertTrue(all(value is False for value in payload["safety"].values()))
        self.assertEqual(payload["registerAction"]["registerAsset2"]["assetRequest"]["coin"], "demo:ASSET")
        rejected = subprocess.run([sys.executable, str(ROOT / "02_preview_actions.py"),
                                   "--max-gas-hype", "0"], cwd=ROOT,
                                  capture_output=True, text=True, timeout=10)
        self.assertNotEqual(rejected.returncode, 0)
        self.assertIn("zero consumes a reserve deployment", rejected.stderr)


if __name__ == "__main__":
    unittest.main()
