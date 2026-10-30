package main

import (
	"fmt"
	"log"

	"github.com/0xByteBeetle/blog-solutions/evm/ethereum-dev-hacks-catching-hidden-transfers-real-time-events-and-multicalls-bef7435b9397/supplementary/go/rlpmanual"
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
