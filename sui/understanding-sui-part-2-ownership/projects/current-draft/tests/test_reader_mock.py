"""Original reader under wholly synthetic modules: NOT real gRPC integration."""
import contextlib
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
SOURCE=Path(__file__).resolve().parents[1]/'client/read_object.py'
class MockRpcError(Exception):
    def code(self):return types.SimpleNamespace(name='NOT_FOUND')
    def details(self):return 'synthetic missing object'
class Message:
    def __init__(self,**kwargs):self.fields=kwargs
    def SerializeToString(self):return b'synthetic'
    @classmethod
    def FromString(cls,value):return value
class Reader(unittest.TestCase):
    def invoke(self,error=False,endpoint='fullnode.testnet.sui.io:443',label='fixture'):
        calls=[]
        response={'object':{'object_id':'fixture-id','version':'1','object_type':'fixture::Object','owner':{'kind':'ADDRESS'},'json':{'value':'7'}}}
        class Channel:
            def __enter__(self):calls.append('enter');return self
            def __exit__(self,*args):calls.append('close')
            def unary_unary(self,path,**kwargs):
                calls.append(path)
                def call(message,timeout):
                    calls.append((message.fields,timeout))
                    if error:raise MockRpcError()
                    return response
                return call
        grpc=types.ModuleType('grpc');grpc.RpcError=MockRpcError
        def channel(kind,address):calls.append((kind,address));return Channel()
        grpc.insecure_channel=lambda address:channel('insecure',address)
        grpc.secure_channel=lambda address,credentials:channel('secure',address)
        grpc.ssl_channel_credentials=lambda:'fake-tls'
        proto=types.ModuleType('google.protobuf')
        descriptor=types.SimpleNamespace(input_type='input',output_type='output')
        proto.descriptor_pool=types.SimpleNamespace(DescriptorPool=lambda database:types.SimpleNamespace(FindServiceByName=lambda service:types.SimpleNamespace(methods_by_name={'GetObject':descriptor})))
        proto.message_factory=types.SimpleNamespace(GetMessageClass=lambda descriptor:Message)
        proto.json_format=types.SimpleNamespace(MessageToDict=lambda value,**kwargs:value)
        reflection=types.ModuleType('grpc_reflection.v1alpha.proto_reflection_descriptor_database');reflection.ProtoReflectionDescriptorDatabase=lambda channel:'fake-database'
        modules={'grpc':grpc,'google':types.ModuleType('google'),'google.protobuf':proto,'grpc_reflection':types.ModuleType('grpc_reflection'),'grpc_reflection.v1alpha':types.ModuleType('grpc_reflection.v1alpha'),'grpc_reflection.v1alpha.proto_reflection_descriptor_database':reflection}
        with tempfile.TemporaryDirectory() as directory:
            previous=os.getcwd();os.chdir(directory)
            try:
                status=0
                with patch.dict(sys.modules,modules),patch.object(sys,'argv',[str(SOURCE),'fixture-id',label]),patch.dict(os.environ,{'SUI_GRPC_ENDPOINT':endpoint}),contextlib.redirect_stdout(io.StringIO()),contextlib.redirect_stderr(io.StringIO()):
                    try:runpy.run_path(str(SOURCE))
                    except SystemExit as exit:status=exit.code
                files=list(Path('evidence').glob('*.json'))
                saved=json.loads(files[0].read_text()) if files else None
                return status,calls,saved
            finally:os.chdir(previous)
    def test_synthetic_success_is_saved_and_channel_closed(self):
        status,calls,saved=self.invoke();self.assertEqual(status,0);self.assertEqual(calls[0],('secure','fullnode.testnet.sui.io:443'));self.assertEqual(calls[-1],'close');self.assertEqual(saved['object']['object_id'],'fixture-id');self.assertIn(({'object_id':'fixture-id','read_mask':{'paths':['*']}},30),calls)
    def test_synthetic_rpc_error_saved_with_failure_exit(self):
        status,calls,saved=self.invoke(error=True);self.assertEqual(status,1);self.assertEqual(saved,{'error':{'code':'NOT_FOUND','details':'synthetic missing object'}});self.assertEqual(calls[-1],'close')
    def test_loopback_uses_insecure_channel_only_under_mock(self):
        status,calls,_=self.invoke(endpoint='127.0.0.1:9000');self.assertEqual(status,0);self.assertEqual(calls[0],('insecure','127.0.0.1:9000'))
    def test_path_traversal_label_rejected_before_channel(self):
        status,calls,saved=self.invoke(label='../outside');self.assertEqual(status,2);self.assertEqual(calls,[]);self.assertIsNone(saved)
if __name__=='__main__':unittest.main()
