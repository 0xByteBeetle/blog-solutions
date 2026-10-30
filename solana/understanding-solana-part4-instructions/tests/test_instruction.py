import pathlib
import sys
import unittest
import json
import subprocess
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from instruction import ARTICLE_DATA, decode_transfer, encode_transfer


class InstructionTests(unittest.TestCase):
    def test_cli_prints_article_instruction(self):
        output = subprocess.check_output([sys.executable, 'instruction.py'], cwd=pathlib.Path(__file__).resolve().parents[1], text=True)
        self.assertEqual(json.loads(output)['data'], list(ARTICLE_DATA))

    def test_exact_published_bytes(self):
        self.assertEqual(encode_transfer(10_000_000), ARTICLE_DATA)
        self.assertEqual(ARTICLE_DATA.hex(), "020000008096980000000000")
        self.assertEqual(decode_transfer(ARTICLE_DATA), 10_000_000)

    def test_integer_boundaries(self):
        for value in [0, 1, 2**53 + 1, 2**64 - 1]:
            self.assertEqual(decode_transfer(encode_transfer(value)), value)

    def test_wrong_discriminator_or_length_rejected(self):
        for data in [b"", ARTICLE_DATA[:-1], ARTICLE_DATA + b"\x00", b"\x01" + ARTICLE_DATA[1:]]:
            with self.assertRaises(ValueError):
                decode_transfer(data)

    def test_non_integer_negative_and_overflow_rejected(self):
        for value in [-1, True, 1.5, 2**64]:
            with self.assertRaises(ValueError):
                encode_transfer(value)


if __name__ == "__main__":
    unittest.main()
