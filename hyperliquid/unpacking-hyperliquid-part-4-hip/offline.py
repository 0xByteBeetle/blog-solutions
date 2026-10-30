"""Supplemental offline runner. Only blocks6/11; no SDK, keys, signing or network."""
from contextlib import redirect_stdout
from decimal import Decimal
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OFFLINE_BLOCKS = (6, 11)
MOCKED_BLOCKS = (4, 7, 10, 20)


def execute_block(index, *, mock_globals=None):
    if index not in OFFLINE_BLOCKS + MOCKED_BLOCKS:
        raise ValueError("Only reviewed offline or explicitly mocked blocks are allowed")
    if index in MOCKED_BLOCKS and mock_globals is None:
        raise ValueError("This block requires explicit mock fixtures, not a live client")
    raw = (ROOT / "published" / f"block-{index:02d}.py").read_bytes()
    scope = {"Decimal": Decimal, "json": json}
    scope.update(mock_globals or {})
    output = io.StringIO()
    with redirect_stdout(output):
        exec(compile(raw, f"published/block-{index:02d}.py", "exec"), scope)
    return output.getvalue(), scope


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("block", type=int, choices=OFFLINE_BLOCKS)
    args = parser.parse_args()
    print(execute_block(args.block)[0], end="")
