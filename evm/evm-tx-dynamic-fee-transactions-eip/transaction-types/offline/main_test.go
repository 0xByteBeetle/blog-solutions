package main

import (
	"bytes"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/rlp"
	"math/big"
	"testing"
)

func TestFieldsSerializationAndSender(t *testing.T) {
	tx := fixture()
	raw, e := tx.MarshalBinary()
	if e != nil {
		t.Fatal(e)
	}
	var round types.Transaction
	if e = round.UnmarshalBinary(raw); e != nil {
		t.Fatal(e)
	}
	if round.Hash() != tx.Hash() || round.ChainId().Int64() != 80002 || round.Nonce() != 7 {
		t.Fatal("field round trip")
	}
	sender, e := types.Sender(types.LatestSignerForChainID(big.NewInt(80002)), &round)
	if e != nil || sender != fixtureSender {
		t.Fatal(sender, e)
	}
	if _, e = types.Sender(types.LatestSignerForChainID(big.NewInt(1)), &round); e == nil {
		t.Fatal("wrong chain accepted")
	}
	if round.To() == nil || round.Gas() != 100000 {
		t.Fatal("recipient/gas")
	}
}
func TestFeeMathAndTypedPayload(t *testing.T) {
	tx := fixture()
	raw, _ := tx.MarshalBinary()
	if raw[0] != 2 || tx.GasFeeCap().Int64() != 3120000000 || tx.GasTipCap().Int64() != 2000000000 || !bytes.Equal(tx.Data(), data) {
		t.Fatal("type/fees/calldata")
	}
	payload, e := rlp.EncodeToBytes([]interface{}{tx.ChainId(), tx.Nonce(), tx.GasTipCap(), tx.GasFeeCap(), tx.Gas(), tx.To(), tx.Value(), tx.Data(), tx.AccessList()})
	if e != nil {
		t.Fatal(e)
	}
	if crypto.Keccak256Hash(append([]byte{2}, payload...)) != types.NewLondonSigner(tx.ChainId()).Hash(tx) {
		t.Fatal("typed signing hash")
	}
}
func TestFeeBoundaries(t *testing.T) {
	for _, n := range []int64{0, 1, 99, 100, 101} {
		cap, e := feeCap(big.NewInt(n), big.NewInt(2))
		if e != nil || cap.Int64() != n*112/100+2 {
			t.Fatal(n, cap, e)
		}
	}
	if _, e := feeCap(big.NewInt(-1), big.NewInt(0)); e == nil {
		t.Fatal("negative base")
	}
	if _, e := feeCap(big.NewInt(1), big.NewInt(-1)); e == nil {
		t.Fatal("negative tip")
	}
	if _, e := feeCap(new(big.Int).Lsh(big.NewInt(1), 256), big.NewInt(1)); e == nil {
		t.Fatal("overflow")
	}
}
