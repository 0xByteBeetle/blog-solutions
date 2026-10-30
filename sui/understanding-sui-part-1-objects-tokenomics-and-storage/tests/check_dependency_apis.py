"""Supplemental dependency smoke check; no channels or network calls."""
from pathlib import Path
import runpy
from google.protobuf import descriptor_pb2, descriptor_pool, message_factory, json_format

source = Path(__file__).resolve().parents[1] / 'client' / 'rpc.py'
module = runpy.run_path(str(source), run_name='import_only')
assert callable(module['rpc'])
file = descriptor_pb2.FileDescriptorProto(name='fixture.proto', package='fixture', syntax='proto3')
message = file.message_type.add(name='Reply')
message.field.add(name='chain', number=1, type=9, label=1)
pool = descriptor_pool.DescriptorPool()
pool.Add(file)
cls = message_factory.GetMessageClass(pool.FindMessageTypeByName('fixture.Reply'))
value = cls(chain='testnet')
assert json_format.MessageToDict(cls.FromString(value.SerializeToString()),
                               preserving_proto_field_name=True) == {'chain': 'testnet'}
print('PASS: exact rpc imports and synthetic protobuf roundtrip; no transport/reflection call')
