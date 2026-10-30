"""Show the article's literal tuple words and cross-check them with Cast and a local EVM."""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent
SELECTOR = "ddd356b3"
WORDS = [
    ("argument → tuple offset", 0x20),
    ("number = 123456789", 123456789),
    ("tuple → string offset", 0x40),
    ("string byte length", 3),
]
BODY = "".join(f"{value:064x}" for _, value in WORDS) + "626f62" + "00" * 29
CALLDATA = "0x" + SELECTOR + BODY


def run(*command):
    return subprocess.check_output(command, cwd=ROOT, text=True, timeout=120).strip()


def main():
    if run("cast", "sig", "store((uint256,string))") != "0x" + SELECTOR:
        raise AssertionError("Canonical selector differs from the literal example")
    if run("cast", "calldata", "store((uint256,string))", "(123456789,bob)").lower() != CALLDATA:
        raise AssertionError("Manual words differ from Cast's tuple encoding")
    run("forge", "test", "--match-test", "testArticleWordsAndReturnData", "-q")
    print("selector: 0x" + SELECTOR)
    for index, (label, value) in enumerate(WORDS):
        print(f"word {index}, arguments byte {index * 32:3}: {value:064x}  {label}")
    print("word 4, arguments byte 128: 626f62" + "00" * 29 + "  bob + padding")
    print("calldata (164 bytes): " + CALLDATA)
    print("retrieve return data (160 bytes, no selector): 0x" + BODY)
    print("PASS: Cast encoding and actual local contract call/return match these words")


if __name__ == "__main__":
    main()
