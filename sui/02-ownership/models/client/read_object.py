import argparse
import json
import os
import sys
from pathlib import Path

import grpc
from google.protobuf import descriptor_pool, json_format, message_factory
from grpc_reflection.v1alpha.proto_reflection_descriptor_database import (
    ProtoReflectionDescriptorDatabase,
)

parser = argparse.ArgumentParser()
parser.add_argument("object_id")
parser.add_argument("label")
args = parser.parse_args()
if not args.label.isidentifier():
    parser.error("Use a simple label such as owned, shared, or wrapped_child")
endpoint = os.environ.get("SUI_GRPC_ENDPOINT", "fullnode.testnet.sui.io:443")
host = endpoint.rsplit(":", 1)[0]
channel = (
    grpc.insecure_channel(endpoint)
    if host in {"localhost", "127.0.0.1", "[::1]"}
    else grpc.secure_channel(endpoint, grpc.ssl_channel_credentials())
)
service = "sui.rpc.v2.LedgerService"
try:
    with channel:
        pool = descriptor_pool.DescriptorPool(ProtoReflectionDescriptorDatabase(channel))
        method = pool.FindServiceByName(service).methods_by_name["GetObject"]
        request_type = message_factory.GetMessageClass(method.input_type)
        response_type = message_factory.GetMessageClass(method.output_type)
        call = channel.unary_unary(
            f"/{service}/GetObject",
            request_serializer=request_type.SerializeToString,
            response_deserializer=response_type.FromString,
        )
        response = call(
            request_type(object_id=args.object_id, read_mask={"paths": ["*"]}), timeout=30
        )
        result = json_format.MessageToDict(response, preserving_proto_field_name=True)
except grpc.RpcError as error:
    result = {"error": {"code": error.code().name, "details": error.details()}}
Path("evidence").mkdir(exist_ok=True)
path = Path("evidence") / f"{args.label}.json"
path.write_text(json.dumps(result, indent=2) + "\n")
if "error" in result:
    print("GetObject failed:", result["error"]["code"], result["error"]["details"])
    print("Saved:", path)
    sys.exit(1)
obj = result["object"]
print("Object ID:", obj["object_id"])
print("Version:", obj["version"])
print("Type:", obj["object_type"])
print("Owner:", json.dumps(obj["owner"], sort_keys=True))
print("Move value:", json.dumps(obj["json"], indent=2, sort_keys=True))
print("Saved:", path)
