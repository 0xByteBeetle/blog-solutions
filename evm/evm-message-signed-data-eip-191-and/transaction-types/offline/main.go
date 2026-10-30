package main

import (
	"crypto/ecdsa"
	"fmt"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

// Public NEVER-FUND fixture key integer 1, only in memory; no wallet files/RPC.
func fixtureKey() *ecdsa.PrivateKey {
	k, e := crypto.HexToECDSA(fmt.Sprintf("%064x", 1))
	if e != nil {
		panic(e)
	}
	return k
}

var fixtureSender = common.HexToAddress("0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf")

func sign(message []byte) ([]byte, []byte) {
	preimage := []byte(fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(message), message))
	digest := crypto.Keccak256(preimage)
	sig, e := crypto.Sign(digest, fixtureKey())
	if e != nil {
		panic(e)
	}
	return digest, sig
}
func main() {
	message := []byte("Login to app.xyz")
	hash, sig := sign(message)
	public, e := crypto.SigToPub(hash, sig)
	if e != nil {
		panic(e)
	}
	fmt.Printf("message=%q bytes=%d hash=0x%x signature=0x%x recovered=%s\n", message, len(message), hash, sig, crypto.PubkeyToAddress(*public))
}
