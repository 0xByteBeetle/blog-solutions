"""Supplemental executable form of the article's 12-byte System Program transfer."""
import argparse
import json
import struct

ARTICLE_DATA = bytes([2, 0, 0, 0, 128, 150, 152, 0, 0, 0, 0, 0])


def encode_transfer(lamports):
    if type(lamports) is not int or not 0 <= lamports < 2**64:
        raise ValueError("Lamports must fit an unsigned 64-bit integer")
    return struct.pack("<IQ", 2, lamports)


def decode_transfer(data):
    if len(data) != 12:
        raise ValueError("System Transfer instruction data must contain exactly 12 bytes")
    discriminator, lamports = struct.unpack("<IQ", data)
    if discriminator != 2:
        raise ValueError("Not the System Program Transfer variant")
    return lamports


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--lamports", type=int, default=10_000_000)
    args = parser.parse_args()
    try:
        data = encode_transfer(args.lamports)
        amount = decode_transfer(data)
        print(json.dumps({"program_id": "11111111111111111111111111111111", "data": list(data),
                          "hex": data.hex(), "discriminator_u32_le": 2, "lamports_u64_le": amount,
                          "sol": f"{amount // 10**9}.{amount % 10**9:09d}"}, indent=2))
    except ValueError as error:
        parser.exit(1, str(error) + "\n")
