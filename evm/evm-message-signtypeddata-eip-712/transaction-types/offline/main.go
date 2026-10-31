// Supplemental offline version of the article's Permit signing example. NEVER FUND key 1.
package main

import (
	"flag"
	"fmt"
	"github.com/ethereum/go-ethereum/common"
	ethmath "github.com/ethereum/go-ethereum/common/math"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/signer/core/apitypes"
	"math/big"
)

func fixture() apitypes.TypedData {
	return apitypes.TypedData{Types: apitypes.Types{
		"EIP712Domain": {{Name: "name", Type: "string"}, {Name: "version", Type: "string"}, {Name: "chainId", Type: "uint256"}, {Name: "verifyingContract", Type: "address"}},
		"Permit":       {{Name: "owner", Type: "address"}, {Name: "spender", Type: "address"}, {Name: "value", Type: "uint256"}, {Name: "nonce", Type: "uint256"}, {Name: "deadline", Type: "uint256"}},
	}, PrimaryType: "Permit", Domain: apitypes.TypedDataDomain{Name: "MyDApp", Version: "1", ChainId: ethmath.NewHexOrDecimal256(80002), VerifyingContract: "0xf80bb731f8ba49624dce8edb1a8188782287ff1e"},
		Message: apitypes.TypedDataMessage{"owner": "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf", "spender": "0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf", "value": "1000000000000000000", "nonce": "0", "deadline": "2000000000"}}
}
func digest(data apitypes.TypedData) []byte {
	domain, e := data.HashStruct("EIP712Domain", data.Domain.Map())
	if e != nil {
		panic(e)
	}
	message, e := data.HashStruct("Permit", data.Message)
	if e != nil {
		panic(e)
	}
	return crypto.Keccak256([]byte{0x19, 0x01}, domain, message)
}
func word(n *big.Int) []byte { return common.LeftPadBytes(n.Bytes(), 32) }
func main() {
	url := flag.String("rpc-url", "", "explicit owned loopback Anvil URL")
	verifier := flag.String("verifier", "", "fresh local PermitVerifier address")
	flag.Parse()
	if *url != "" || *verifier != "" {
		if e := verifyLocal(*url, *verifier); e != nil {
			panic(e)
		}
		return
	}

	key, e := crypto.HexToECDSA(fmt.Sprintf("%064x", 1))
	if e != nil {
		panic(e)
	}
	hash := digest(fixture())
	sig, e := crypto.Sign(hash, key)
	if e != nil {
		panic(e)
	}
	pub, e := crypto.SigToPub(hash, sig)
	if e != nil {
		panic(e)
	}
	fmt.Printf("Permit digest=0x%x signature=0x%x recovered=%s deadline=2000000000 (fixed, not a live validity check)\n", hash, sig, crypto.PubkeyToAddress(*pub))
}
