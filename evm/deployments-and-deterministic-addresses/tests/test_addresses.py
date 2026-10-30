import json
from pathlib import Path
import subprocess
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from addresses import (ROOT, DEFAULT_DEPLOYER, address_from_hash, calculate,
                       create_preimage, create2_preimage, keccak)


class AddressTests(unittest.TestCase):
    def test_rlp_nonce_boundaries(self):
        prefix = "d694" + DEFAULT_DEPLOYER[2:]
        for nonce, suffix, list_prefix in [(0, "80", "d6"), (1, "01", "d6"),
                                           (127, "7f", "d6"), (128, "8180", "d7"),
                                           (255, "81ff", "d7"), (256, "820100", "d8"),
                                           (2**64 - 1, "88" + "ff" * 8, "de")]:
            with self.subTest(nonce=nonce):
                self.assertEqual(create_preimage(DEFAULT_DEPLOYER, nonce).hex(), list_prefix + prefix[2:] + suffix)

    def test_known_create_address(self):
        digest = keccak(create_preimage(DEFAULT_DEPLOYER, 1))
        self.assertEqual(address_from_hash(digest), "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512")

    def test_eip_1014_known_vectors(self):
        for sender, init, expected in [
            ("0x" + "00" * 20, b"\x00", "0x4d1a2e2bb4f88f0250f26ffff098b0b30b26bf38"),
            ("0xdeadbeef" + "00" * 16, b"\x00", "0xb928f69bb1d91cd65274e3c79d8986362984fda3"),
            ("0x" + "00" * 20, bytes.fromhex("deadbeef"), "0x70f2b2914a2a4b783faefb75f459a580616fcb5e"),
        ]:
            preimage = create2_preimage(sender, "0x" + "00" * 32, keccak(init))
            self.assertEqual(len(preimage), 85)
            self.assertEqual(address_from_hash(keccak(preimage)), expected)

    def test_bad_nonce_address_and_salt_rejected(self):
        for nonce in [-1, 2**64, True, 1.5]:
            with self.assertRaises(ValueError):
                create_preimage(DEFAULT_DEPLOYER, nonce)
        with self.assertRaises(ValueError):
            create_preimage("0x12", 0)
        with self.assertRaises(ValueError):
            create2_preimage(DEFAULT_DEPLOYER, "0x42", "0x" + "00" * 32)

    def test_article_storage_cli_cross_checks_both_formulas(self):
        result = json.loads(subprocess.check_output([sys.executable, "addresses.py"], cwd=ROOT, text=True))
        self.assertEqual(result["cast_cross_checks"], "passed")
        self.assertEqual(result["create_address"], "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512")
        self.assertEqual(len(bytes.fromhex(result["create2_preimage"][2:])), 85)
        self.assertGreater(result["init_code_bytes"], 0)

    def test_salt_and_init_code_change_the_create2_address(self):
        zero = "0x" + "00" * 32
        first = address_from_hash(keccak(create2_preimage(DEFAULT_DEPLOYER, zero, keccak(b"\x00"))))
        for salt, init in [("0x" + "00" * 31 + "01", b"\x00"), (zero, b"\x01")]:
            self.assertNotEqual(first, address_from_hash(keccak(create2_preimage(DEFAULT_DEPLOYER, salt, keccak(init)))))


if __name__ == "__main__":
    unittest.main()
