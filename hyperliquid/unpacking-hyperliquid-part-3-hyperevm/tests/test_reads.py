import json
from pathlib import Path
import tempfile
import unittest
from decode_reads import decode,words,result
ROOT=Path(__file__).resolve().parents[1]
class RawReadTests(unittest.TestCase):
    def test_article_literal_words_and_scaling(self):
        f=json.loads((ROOT/'fixtures/price-reads.json').read_text());got=decode(f['oracleResult'],f['bboResult'],f['asset'])
        self.assertEqual((got['oracleRaw'],got['bidRaw'],got['askRaw']),(631381,631610,631850))
        self.assertEqual((got['oracle'],got['bid'],got['ask']),('63138.1','63161','63185'))
        self.assertEqual(decode(f['oracleResult'],f['bboResult'],{'name':'OTHER','szDecimals':2})['oracle'],'63.1381')
    def test_word_padding_length_and_market_bounds(self):
        for raw in ['0x1234','0x'+'ff'*32,'0x'+'00'*64]:
            with self.assertRaises(ValueError): words(raw,1)
        f=json.loads((ROOT/'fixtures/price-reads.json').read_text())
        for sz in [-1,7,True]:
            with self.assertRaises(ValueError): decode(f['oracleResult'],f['bboResult'],{'name':'X','szDecimals':sz})
    def test_rpc_error_is_not_a_zero_price(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'rpc.json';p.write_text('{"jsonrpc":"2.0","error":{"code":-32000}}')
            with self.assertRaises(ValueError): result(p)
