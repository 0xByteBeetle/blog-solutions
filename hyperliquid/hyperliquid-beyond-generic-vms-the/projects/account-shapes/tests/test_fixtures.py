"""Independent stdlib fixture checks, NOT execution of the Rust implementation."""
import json
from decimal import Decimal
from pathlib import Path
import unittest

FIXTURES = Path(__file__).resolve().parents[1] / "fixtures"


class FixtureTests(unittest.TestCase):
    def test_clearinghouse_observed_shape(self):
        value = json.loads((FIXTURES / "clearinghouse.json").read_text())
        for summary in ("marginSummary", "crossMarginSummary"):
            self.assertEqual(set(value[summary]), {"accountValue", "totalNtlPos", "totalRawUsd", "totalMarginUsed"})
            for number in value[summary].values():
                self.assertIsInstance(number, str)
                self.assertTrue(Decimal(number).is_finite())
        self.assertIsInstance(value["withdrawable"], str)
        self.assertIsInstance(value["crossMaintenanceMarginUsed"], str)
        self.assertEqual(value["assetPositions"], [])
        self.assertIs(type(value["time"]), int)
        self.assertGreaterEqual(value["time"], 0)
        self.assertEqual(json.loads(json.dumps(value)), value)

    def test_spot_excerpt_is_not_complete_json(self):
        text = (FIXTURES / "spot-response.json.txt").read_text()
        self.assertEqual(text.count("..."), 1)
        with self.assertRaises(json.JSONDecodeError):
            json.loads(text)

    def test_displayed_spot_rows_only_after_explicit_test_normalization(self):
        text = (FIXTURES / "spot-response.json.txt").read_text()
        # Local test-only deletion of comma + omission marker. This is NOT a
        # reconstruction of omitted balances, or a change to source fixture bytes.
        marker = ",\n    ..."
        self.assertEqual(text.count(marker), 1)
        displayed = json.loads(text.replace(marker, "", 1))
        self.assertEqual([row["coin"] for row in displayed["balances"]], ["USDC", "TZERO", "UETH"])
        for row in displayed["balances"]:
            self.assertIs(type(row["token"]), int)
            for field in ("total", "hold", "entryNtl"):
                self.assertIsInstance(row[field], str)
                self.assertTrue(Decimal(row[field]).is_finite())
        shown_by_token = {row["token"]: row for row in displayed["balances"]}
        for token, available in displayed["tokenToAvailableAfterMaintenance"]:
            self.assertIsInstance(available, str)
            row = shown_by_token[token]
            # Only a consistency observation for this printed historical sample.
            self.assertEqual(Decimal(available), Decimal(row["total"]) - Decimal(row["hold"]))


if __name__ == "__main__":
    unittest.main()
