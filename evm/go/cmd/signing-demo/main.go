package main

import (
	"fmt"
	"log"
	"math/big"

	"github.com/0xByteBeetle/blog-solutions/evm/go/signing"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

func main() {
	key, err := crypto.HexToECDSA("0000000000000000000000000000000000000000000000000000000000000001")
	if err != nil {
		log.Fatal(err)
	}
	owner := crypto.PubkeyToAddress(key.PublicKey)

	personalSignature, personalDigest, err := signing.PersonalSign(key, []byte("Login to app.xyz"))
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("EIP-191 digest: %s\n", personalDigest)
	fmt.Printf("EIP-191 signature length: %d bytes\n", len(personalSignature))

	typed := signing.PermitTypedData(
		big.NewInt(31337),
		common.HexToAddress("0x000000000000000000000000000000000000CAFE"),
		owner,
		common.HexToAddress("0x000000000000000000000000000000000000BEEF"),
		big.NewInt(125),
		big.NewInt(0),
		big.NewInt(2_000_000_000),
	)
	_, typedDigest, err := signing.TypedDataSign(key, typed)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("EIP-712 digest: %s\n", typedDigest)
}
