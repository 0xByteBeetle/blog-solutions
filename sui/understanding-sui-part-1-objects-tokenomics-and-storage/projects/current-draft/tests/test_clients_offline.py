"""Supplemental synthetic-fixture tests: no network, wallet, or chain evidence."""
import base64
import contextlib
import copy
import io
import json
import os
from pathlib import Path
import runpy
import sys
import tempfile
import types
import unittest
from unittest.mock import patch

CLIENT = Path(__file__).resolve().parents[1] / 'client'
OBJECT_ID = '0x846dbd2afd7d7531e7feea369cfecd2586359a7315324ccfffaeea649071362f'
RAW = bytes.fromhex(OBJECT_ID[2:]) + (1234567890).to_bytes(8, 'little')
def encoded(value):
    return {'value': base64.b64encode(value).decode()}
def fixture():
    return {'object': {'object_id': OBJECT_ID, 'json': {'id': OBJECT_ID, 'balance': '1234567890'},
        'balance': '1234567890', 'version': '2', 'digest': 'synthetic-digest',
        'owner': {'kind': 'ADDRESS', 'address': 'synthetic-owner'}, 'object_type': 'synthetic::Coin',
        'contents': encoded(RAW), 'bcs': encoded(b'synthetic-envelope'+RAW),
        'storage_rebate': '10', 'previous_transaction': 'synthetic-tx'}}

class Clients(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(); self.old = os.getcwd(); os.chdir(self.temp.name)
        Path('evidence').mkdir()
    def tearDown(self):
        os.chdir(self.old); self.temp.cleanup()
    def run_client(self, name, rpc=None):
        module = types.ModuleType('rpc'); module.rpc = rpc
        with patch.dict(sys.modules, {'rpc': module}), contextlib.redirect_stdout(io.StringIO()):
            return runpy.run_path(str(CLIENT/name))
    def save(self, value):
        Path('evidence/object.json').write_text(json.dumps(value))
    def test_reader_and_decoder(self):
        calls=[]
        def rpc(method, **fields):
            calls.append((method,fields))
            return {'chain':'testnet','chain_id':'synthetic-chain','checkpoint_height':'1'} if method=='GetServiceInfo' else fixture()
        self.run_client('01_read_object.py', rpc)
        self.assertEqual(json.loads(Path('evidence/object.json').read_text()),fixture())
        self.assertEqual([c[0] for c in calls],['GetServiceInfo','GetObject'])
        self.assertEqual(calls[1][1],{'object_id':OBJECT_ID,'read_mask':{'paths':['*']}})
        env=self.run_client('02_decode_coin.py')
        self.assertEqual(env['decode_coin'](RAW),(OBJECT_ID,1234567890))
        for data in [b'',RAW[:-1],RAW+b'X']:
            with self.assertRaises(ValueError): env['decode_coin'](data)
    def test_reader_rejects_wrong_network_before_object_read(self):
        calls=[]
        def rpc(method, **fields): calls.append(method); return {'chain':'mainnet'}
        with self.assertRaisesRegex(RuntimeError,'Testnet'): self.run_client('01_read_object.py',rpc)
        self.assertEqual(calls,['GetServiceInfo'])
        self.assertFalse(Path('evidence/object.json').exists())
    def test_decoder_rejects_mismatched_balance(self):
        data=fixture();data['object']['balance']='0';self.save(data)
        with self.assertRaises(AssertionError): self.run_client('02_decode_coin.py')
    def history(self, missing=False):
        obj=fixture()['object'];before=copy.deepcopy(obj);before['version']='1'
        return {'transaction':{'digest':'synthetic-tx','checkpoint':'2',
            'effects':{'changed_objects':[{'object_id':OBJECT_ID,'input_version':'1','output_version':'2'}]},
            'objects':{'objects':[obj] if missing else [before,obj]}}}
    def test_storage_history_and_request(self):
        self.save(fixture()); calls=[]
        def rpc(method, **fields): calls.append((method,fields));return self.history()
        self.run_client('03_inspect_storage.py',rpc)
        self.assertEqual(calls,[('GetTransaction',{'digest':'synthetic-tx','read_mask':{'paths':['*']}})])
        self.assertEqual(json.loads(Path('evidence/object-history.json').read_text()),self.history())
    def test_missing_history_is_explicit_failure(self):
        self.save(fixture())
        with self.assertRaisesRegex(RuntimeError,'historical object versions'):
            self.run_client('03_inspect_storage.py',lambda *a,**kw:self.history(True))
    def test_storage_rejects_wrong_latest_digest(self):
        self.save(fixture());data=self.history();data['transaction']['objects']['objects'][1]['digest']='wrong'
        with self.assertRaises(AssertionError): self.run_client('03_inspect_storage.py',lambda *a,**kw:data)

if __name__=='__main__': unittest.main()
