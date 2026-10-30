package main

import (
	"fmt"
	"log"

	"github.com/0xByteBeetle/blog-solutions/evm/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-1-54130865e71e/supplementary/go/rlpmanual"
)

func main() {
	encoded, err := rlpmanual.Encode([]string{"cat", "dog"})
	if err != nil {
		log.Fatal(err)
	}
	decoded, err := rlpmanual.Decode(encoded)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("encoded: 0x%x\n", encoded)
	fmt.Printf("decoded: %#v\n", decoded)
}
