import grpc
from google.protobuf import descriptor_pool, json_format, message_factory
from grpc_reflection.v1alpha.proto_reflection_descriptor_database import (
    ProtoReflectionDescriptorDatabase,
)

endpoint = "fullnode.testnet.sui.io:443"
service_name = "sui.rpc.v2.LedgerService"


def rpc(method_name, **fields):
    credentials = grpc.ssl_channel_credentials()
    with grpc.secure_channel(endpoint, credentials) as channel:
        database = ProtoReflectionDescriptorDatabase(channel)
        pool = descriptor_pool.DescriptorPool(database)
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
    if info["chain"] != "testnet":
        raise RuntimeError("The endpoint did not report Sui Testnet")
    print("RPC endpoint:", endpoint)
    print("Network:", info["chain"])
    print("Chain identifier:", info["chain_id"])
    print("Native gRPC connection verified")