"""Supplemental integer-only calculator for the article's fee worked example."""
import argparse
import json


def calculate(cu_limit=200_000, micro_lamports_per_cu=20_000, signatures=1, base_per_signature=5_000):
    for value in [cu_limit, micro_lamports_per_cu, signatures, base_per_signature]:
        if type(value) is not int or value < 0:
            raise ValueError("Fee inputs must be nonnegative integers")
    if not 1 <= signatures or not 0 <= cu_limit <= 1_400_000 or micro_lamports_per_cu >= 2**64:
        raise ValueError("Invalid signer count, CU limit or u64 CU price")
    priority = (cu_limit * micro_lamports_per_cu + 999_999) // 1_000_000
    base = signatures * base_per_signature
    if base + priority >= 2**64:
        raise ValueError("Calculated fee exceeds u64")
    return {"cu_limit": cu_limit, "micro_lamports_per_cu": micro_lamports_per_cu,
            "signatures": signatures, "base_lamports": base, "priority_lamports": priority,
            "total_lamports": base + priority,
            "total_sol": f"{(base + priority) // 10**9}.{(base + priority) % 10**9:09d}"}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cu-limit", type=int, default=200_000)
    parser.add_argument("--micro-lamports-per-cu", type=int, default=20_000)
    parser.add_argument("--signatures", type=int, default=1)
    parser.add_argument("--base-per-signature", type=int, default=5_000)
    args = parser.parse_args()
    try:
        print(json.dumps(calculate(args.cu_limit, args.micro_lamports_per_cu, args.signatures, args.base_per_signature), indent=2))
    except ValueError as error:
        parser.exit(1, str(error) + "\n")
