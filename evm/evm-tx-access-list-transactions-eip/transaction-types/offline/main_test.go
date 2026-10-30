package main

import (
	"bytes"
	"github.com/ethereum/go-ethereum/common"
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
func TestTypedPayloadAndAccessList(t *testing.T) {
	tx := fixture()
	raw, _ := tx.MarshalBinary()
	if raw[0] != 1 || len(tx.AccessList()) != 1 || len(tx.AccessList()[0].StorageKeys) != 2 {
		t.Fatal("type/access list")
	}
	if *tx.To() != token || !bytes.Equal(tx.Data(), data) || len(tx.Data()) != 68 {
		t.Fatal("article calldata")
	}
	payload, e := rlp.EncodeToBytes([]interface{}{tx.ChainId(), tx.Nonce(), tx.GasPrice(), tx.Gas(), tx.To(), tx.Value(), tx.Data(), tx.AccessList()})
	if e != nil {
		t.Fatal(e)
	}
	manual := crypto.Keccak256Hash(append([]byte{1}, payload...))
	if manual != types.NewEIP2930Signer(tx.ChainId()).Hash(tx) {
		t.Fatal("typed signing hash")
	}
	list := tx.AccessList()
	list[0].StorageKeys[0] = common.Hash{}
	changed := types.NewTx(&types.AccessListTx{ChainID: tx.ChainId(), Nonce: tx.Nonce(), GasPrice: tx.GasPrice(), Gas: tx.Gas(), To: tx.To(), Data: tx.Data(), AccessList: list})
	if types.NewEIP2930Signer(tx.ChainId()).Hash(changed) == manual {
		t.Fatal("storage key must bind signature")
	}
}
