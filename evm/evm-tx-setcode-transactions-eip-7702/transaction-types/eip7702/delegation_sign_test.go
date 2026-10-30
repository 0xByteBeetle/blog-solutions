package main

import (
	"fmt"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/holiman/uint256"
	"math"
	"testing"
)

func TestPreservedHelperNormalNonceAndSignedIntegerLimit(t *testing.T) {
	key, e := crypto.HexToECDSA(fmt.Sprintf("%064x", 1))
	if e != nil {
		t.Fatal(e)
	}
	module := common.HexToAddress("0x4f9c96915a9ce8cd5eb11a2c35ab587fc97d5126")
	expected := common.HexToAddress("0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf")
	for _, nonce := range []uint64{0, 1, math.MaxInt64} {
		sig, e := signEIP7702Delegation(key, 80002, module, nonce)
		if e != nil {
			t.Fatal(e)
		}
		auth := types.SetCodeAuthorization{ChainID: *uint256.NewInt(80002), Address: module, Nonce: nonce, R: *new(uint256.Int).SetBytes(sig[:32]), S: *new(uint256.Int).SetBytes(sig[32:64]), V: sig[64]}
		got, e := auth.Authority()
		if e != nil || got != expected {
			t.Fatal(got, e)
		}
	}
	for _, nonce := range []uint64{1 << 63, math.MaxUint64 - 1} {
		if _, e := signEIP7702Delegation(key, 80002, module, nonce); e == nil {
			t.Fatal("expected preserved int64 narrowing/RLP negative-integer limitation")
		}
	}
}
