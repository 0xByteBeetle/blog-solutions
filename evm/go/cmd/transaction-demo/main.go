package main

import (
	"fmt"
	"log"

	"github.com/0xByteBeetle/blog-solutions/evm/go/transactions"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
)

func main() {
	key, err := transactions.TestKey()
	if err != nil {
		log.Fatal(err)
	}
	examples := []struct {
		name string
		make func() (*types.Transaction, error)
	}{
		{"legacy", func() (*types.Transaction, error) { return transactions.SignLegacy(key) }},
		{"access-list", func() (*types.Transaction, error) { return transactions.SignAccessList(key) }},
		{"dynamic-fee", func() (*types.Transaction, error) { return transactions.SignDynamicFee(key) }},
		{"blob", func() (*types.Transaction, error) { return transactions.SignBlob(key, []byte("blog demo")) }},
		{"set-code", func() (*types.Transaction, error) {
			return transactions.SignSetCode(key, common.HexToAddress("0x000000000000000000000000000000000000CAFE"))
		}},
	}

	for _, example := range examples {
		tx, err := example.make()
		if err != nil {
			log.Fatal(err)
		}
		raw, err := tx.MarshalBinary()
		if err != nil {
			log.Fatal(err)
		}
		fmt.Printf("%-12s type=0x%x hash=%s bytes=%d\n", example.name, tx.Type(), tx.Hash(), len(raw))
	}
}
