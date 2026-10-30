"""Supplemental assertions around the unchanged published programs."""
import contextlib
import io
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import runpy
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
# An extra test boundary: reject DNS/socket connections in the child interpreter.
OFFLINE_RUNNER = '''
import runpy, sys
def no_network(event, args):
    if event in {"socket.connect", "socket.getaddrinfo", "socket.sendto"}:
        raise RuntimeError("network forbidden in offline article tests")
sys.addaudithook(no_network)
runpy.run_path(sys.argv[1], run_name="__main__")
'''


def execute(name):
    result = subprocess.run([sys.executable, "-c", OFFLINE_RUNNER, str(ROOT / name)],
                            cwd=ROOT, text=True, capture_output=True, timeout=30)
    if result.returncode:
        raise AssertionError(result.stderr)
    return result.stdout


class PublishedProgramsTests(unittest.TestCase):
    def test_sign_and_recover(self):
        result = json.loads(execute("01_sign_and_recover.py"))
        self.assertEqual(result["warning"], "PUBLIC TEST KEYS — NEVER FUND")
        self.assertIs(result["submitted"], False)
        approval, order = result["approveAgent"], result["l1Order"]
        self.assertIs(approval["matchesMaster"], True)
        self.assertEqual(approval["master"].lower(), approval["recoveredSigner"].lower())
        self.assertIs(order["matchesAgent"], True)
        self.assertEqual(approval["agent"].lower(), order["recoveredSigner"].lower())
        self.assertNotEqual(approval["master"].lower(), approval["agent"].lower())
        self.assertEqual(order["phantomSource"], "b")
        self.assertIs(order["networkSignaturesDiffer"], True)
        self.assertRegex(order["connectionId"], r"^0x[0-9a-f]{64}$")

    def test_signed_preimage_mutations(self):
        output = execute("02_signed_preimage_mutations.py")
        values, end = json.JSONDecoder().raw_decode(output)
        self.assertEqual(output[end:].strip(), "allConnectionIdsDifferent = True")
        self.assertEqual(set(values), {"canonical", "withSubaccountTarget", "withExpiresAfter",
                                      "differentFieldOrder", "sizeString0.0010"})
        self.assertEqual(len(set(values.values())), 5)
        for value in values.values():
            self.assertRegex(value, r"^0x[0-9a-f]{64}$")

    def test_published_six_worker_demo(self):
        result = json.loads(execute("03_nonce_allocator.py"))
        self.assertEqual(result["unsafeTimestampOnly"], [1_900_000_000_000] * 6)
        self.assertEqual(result["unsafeUniqueCount"], 1)
        self.assertEqual(result["safeUniqueCount"], 6)
        self.assertEqual(result["monotonicAllocatorSorted"], list(range(1_900_000_000_000, 1_900_000_000_006)))

    def allocator_type(self):
        # The module's top-level demo is stdlib-only; capture its normal output.
        with contextlib.redirect_stdout(io.StringIO()):
            return runpy.run_path(str(ROOT / "03_nonce_allocator.py"))["MonotonicNonceAllocator"]

    def test_one_allocator_across_more_threads(self):
        allocator = self.allocator_type()(lambda: 1_900_000_000_000)
        with ThreadPoolExecutor(max_workers=16) as pool:
            values = list(pool.map(lambda _: allocator.next(), range(1000)))
        self.assertEqual(sorted(values), list(range(1_900_000_000_000, 1_900_000_001_000)))

    def test_clock_regression_does_not_repeat_nonce(self):
        clock = iter([1000, 999, 998, 2000])
        allocator = self.allocator_type()(lambda: next(clock))
        self.assertEqual([allocator.next() for _ in range(4)], [1000, 1001, 1002, 2000])


if __name__ == "__main__":
    unittest.main()
