import os
import grpc
from google.protobuf import descriptor_pool, json_format, message_factory
from grpc_reflection.v1alpha.proto_reflection_descriptor_database import (
    ProtoReflectionDescriptorDatabase,
)

endpoint = os.environ.get("SUI_GRPC_ENDPOINT", "127.0.0.1:9000")
service_name = "sui.rpc.v2.LedgerService"


def rpc(method_name, **fields):
    host = endpoint.rsplit(":", 1)[0]
    if host in {"localhost", "127.0.0.1", "[::1]"}:
        channel = grpc.insecure_channel(endpoint)
    else:
        channel = grpc.secure_channel(endpoint, grpc.ssl_channel_credentials())
    with channel:
        pool = descriptor_pool.DescriptorPool(ProtoReflectionDescriptorDatabase(channel))
        method = pool.FindServiceByName(service_name).methods_by_name[method_name]
        request_type = message_factory.GetMessageClass(method.input_type)
        response_type = message_factory.GetMessageClass(method.output_type)
        call = channel.unary_unary(
            f"/{service_name}/{method_name}",
            request_serializer=request_type.SerializeToString,
            response_deserializer=response_type.FromString,
        )
        response = call(request_type(**fields), timeout=30)
        return json_format.MessageToDict(response, preserving_proto_field_name=True)


if __name__ == "__main__":
    info = rpc("GetServiceInfo")
    print("RPC endpoint:", endpoint)
    print("Chain identifier:", info["chain_id"])
    print("Service checkpoint:", info["checkpoint_height"])
