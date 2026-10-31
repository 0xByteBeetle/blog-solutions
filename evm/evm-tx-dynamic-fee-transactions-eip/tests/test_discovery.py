import copy
import json
from pathlib import Path
import unittest
import discover
ROOT=Path(__file__).resolve().parents[1]
class DiscoveryTests(unittest.TestCase):
    def test_fee_history_request_and_integer_policy(self):
        fixture=json.loads((ROOT/'fixtures/fee-history.json').read_text());calls=[]
        def send(url,method,params):
            calls.append((method,params));return {'eth_chainId':'0x13882','eth_feeHistory':fixture['history'],'eth_maxPriorityFeePerGas':fixture['tip']}[method]
        self.assertEqual(discover.discover_fees('x',80002,send),{'nextBlockBaseFeeWei':'1000000000','tipWei':'2000000000','articleMaxFeeWei':'3120000000'})
        self.assertEqual(calls,[('eth_chainId',[]),('eth_feeHistory',['0x5','latest',[]]),('eth_maxPriorityFeePerGas',[])])
        with self.assertRaises(ValueError): discover.discover_fees('x',1,send)
    def test_fee_history_missing_fields_and_quantities(self):
        fixture=json.loads((ROOT/'fixtures/fee-history.json').read_text())
        for mutate in [lambda x:x.update(baseFeePerGas=[]),lambda x:x.update(gasUsedRatio=[float('nan')]*5),lambda x:x.update(baseFeePerGas=['0x00']*6)]:
            bad=copy.deepcopy(fixture['history']);mutate(bad)
            with self.assertRaises(ValueError): discover.validate_fees(bad,fixture['tip'])
    def test_rpc_url_and_quantity_guards(self):
        for q in ['0x00','0x-1','-1',None]:
            with self.assertRaises(ValueError): discover.quantity(q)
        with self.assertRaises(ValueError): discover.rpc('https://user:secret@example.com','eth_chainId',[])
