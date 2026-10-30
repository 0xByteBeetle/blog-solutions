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
	if round.To() == nil || round.Gas() != 21000 {
		t.Fatal("recipient/gas")
	}
}
func TestNineFieldSigningPayloadAndReplayProtection(t *testing.T) {
	tx := fixture()
	payload, e := rlp.EncodeToBytes([]interface{}{tx.Nonce(), tx.GasPrice(), tx.Gas(), tx.To(), tx.Value(), tx.Data(), big.NewInt(80002), uint(0), uint(0)})
	if e != nil {
		t.Fatal(e)
	}
	if crypto.Keccak256Hash(payload) != types.NewEIP155Signer(big.NewInt(80002)).Hash(tx) {
		t.Fatal("EIP155 signing payload")
	}
	v, _, _ := tx.RawSignatureValues()
	if v.Int64() != 160039 && v.Int64() != 160040 {
		t.Fatal("chain-protected v", v)
	}
	if tx.Type() != 0 {
		t.Fatal("legacy type")
	}
	raw, _ := tx.MarshalBinary()
	if raw[0] < 0xc0 {
		t.Fatal("legacy starts with RLP list, no typed prefix")
	}
}
func TestOfficialEIP155Vector(t *testing.T) {
	to := common.HexToAddress("0x3535353535353535353535353535353535353535")
	tx := types.NewTx(&types.LegacyTx{Nonce: 9, GasPrice: big.NewInt(20000000000), Gas: 21000, To: &to, Value: big.NewInt(1000000000000000000)})
	signer := types.NewEIP155Signer(big.NewInt(1))
	if signer.Hash(tx).Hex() != "0xdaf5a779ae972f972197303d7b574746c7ef83eadac0f2791ad23db92e4c8e53" {
		t.Fatal("official golden signing hash")
	}
	raw, _ := rlp.EncodeToBytes([]interface{}{uint(9), big.NewInt(20000000000), uint(21000), to, big.NewInt(1000000000000000000), []byte{}, uint(1), uint(0), uint(0)})
	if !bytes.Equal(crypto.Keccak256(raw), signer.Hash(tx).Bytes()) {
		t.Fatal("manual RLP")
	}
}
