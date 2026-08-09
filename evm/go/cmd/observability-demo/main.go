package main

import (
	"fmt"
	"log"

	"github.com/0xByteBeetle/blog-solutions/evm/go/observability"
)

func main() {
	trace := observability.CallFrame{
		Type:  "CALL",
		From:  "0x0000000000000000000000000000000000001000",
		To:    "0x0000000000000000000000000000000000002000",
		Value: "0xde0b6b3a7640000",
		Calls: []observability.CallFrame{{
			Type:  "CALL",
			From:  "0x0000000000000000000000000000000000002000",
			To:    "0x0000000000000000000000000000000000003000",
			Value: "0x2386f26fc10000",
		}},
	}
	transfers, err := observability.CollectNativeTransfers(trace)
	if err != nil {
		log.Fatal(err)
	}
	for _, transfer := range transfers {
		fmt.Printf("depth=%d %s -> %s value=%s wei\n", transfer.Depth, transfer.From, transfer.To, transfer.Value)
	}
}
