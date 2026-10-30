"""Synthetic inputs test the supplemental checker, not an observed chain result."""
import copy
import importlib.util
from pathlib import Path
import unittest

p = Path(__file__).resolve().parents[1] / "check-interest.py"
spec = importlib.util.spec_from_file_location("interest_check", p)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def fixture(ui="100.0", slot=1):
    return {"result": {"context": {"slot": slot}, "value": {
        "amount": "100000000000", "decimals": 9, "uiAmountString": ui}}}


class InterestCheckerTests(unittest.TestCase):
    def test_equal_or_increasing_values(self):
        module.validate(fixture(), fixture())
        module.validate(fixture(), fixture("100.00001", 2))

    def test_invalid_rpc_principal_and_ui_are_rejected(self):
        cases = [{"error": {"message": "bad request"}}, fixture("NaN"), fixture("Infinity"), fixture("99")]
        wrong = fixture(); wrong["result"]["value"]["amount"] = "999"; cases.append(wrong)
        wrong = fixture(); wrong["result"]["value"]["decimals"] = 6; cases.append(wrong)
        for value in cases:
            with self.subTest(value=value), self.assertRaises(ValueError):
                module.validate(fixture(), value)

    def test_regression_rejected(self):
        with self.assertRaises(ValueError): module.validate(fixture("100.1"), fixture("100.01", 2))
        with self.assertRaises(ValueError): module.validate(fixture(slot=2), fixture(slot=1))
