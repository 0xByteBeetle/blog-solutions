import pathlib
import sys
import unittest
import json
import subprocess
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parents[1]))
from fees import calculate


class FeeTests(unittest.TestCase):
    def test_cli_prints_article_fee(self):
        output = subprocess.check_output([sys.executable, 'fees.py'], cwd=pathlib.Path(__file__).resolve().parents[1], text=True)
        self.assertEqual(json.loads(output)['total_lamports'], 9000)

    def test_published_worked_example(self):
        result = calculate()
        self.assertEqual((result['priority_lamports'], result['base_lamports'], result['total_lamports']), (4000, 5000, 9000))
        self.assertEqual(result['total_sol'], '0.000009000')

    def test_fractional_lamports_round_up(self):
        self.assertEqual(calculate(1, 1)['priority_lamports'], 1)
        self.assertEqual(calculate(1, 1_000_001)['priority_lamports'], 2)

    def test_zero_price_and_multiple_signers(self):
        self.assertEqual(calculate(200_000, 0, 2)['total_lamports'], 10_000)

    def test_large_integer_price_keeps_precision(self):
        self.assertEqual(calculate(200_000, 2**53 + 1)['priority_lamports'], 1_801_439_850_948_199)

    def test_invalid_inputs_rejected(self):
        for values in [(-1, 1, 1), (1_400_001, 1, 1), (1, 1.5, 1), (True, 1, 1), (1, 1, 0), (1, 2**64, 1)]:
            with self.subTest(values=values), self.assertRaises(ValueError):
                calculate(*values)


if __name__ == '__main__':
    unittest.main()
