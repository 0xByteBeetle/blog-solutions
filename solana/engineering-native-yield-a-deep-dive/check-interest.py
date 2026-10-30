"""Supplemental validation of two LOCAL RPC responses, not original article output."""
import json
from decimal import Decimal
from pathlib import Path
import sys


def validate(before, after):
    previous = None
    previous_slot = None
    for response in (before, after):
        if "error" in response:
            raise ValueError("RPC returned an error, not a token balance")
        value = response["result"]["value"]
        if value["amount"] != "100000000000" or value["decimals"] != 9:
            raise ValueError("principal/decimals changed from locally minted 100 tokens")
        if not isinstance(value["uiAmountString"], str):
            raise ValueError("uiAmountString must be a decimal string")
        ui = Decimal(value["uiAmountString"])
        if not ui.is_finite() or ui < Decimal(100):
            raise ValueError("nonfinite/negative-yield value for this positive-rate fixture")
        slot = response["result"]["context"]["slot"]
        if not isinstance(slot, int) or isinstance(slot, bool) or slot < 0:
            raise ValueError("invalid observation slot")
        if previous is not None and (ui < previous or slot < previous_slot):
            raise ValueError("observation went backwards; retry coordinated local fixture")
        previous, previous_slot = ui, slot
    # Equality is permitted: small elapsed time/rounding need not produce visible yield.
    # No fixed article timestamp or historical uiAmount is treated as a live expected value.
    return previous


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("usage: check-interest.py before.json after.json")
    result = validate(*(json.loads(Path(p).read_text()) for p in sys.argv[1:]))
    print(f"PASS constant principal and nondecreasing UI amount: {result}")
