package observability

import (
	"context"
	"math/big"
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
)

func transferLog(token, from, to common.Address, value *big.Int) types.Log {
	return types.Log{
		Address: token,
		Topics: []common.Hash{
			TransferTopic,
			common.BytesToHash(common.LeftPadBytes(from.Bytes(), 32)),
			common.BytesToHash(common.LeftPadBytes(to.Bytes(), 32)),
		},
		Data: common.LeftPadBytes(value.Bytes(), 32),
	}
}

func TestDecodeTransfer(t *testing.T) {
	token := common.HexToAddress("0x1000")
	from := common.HexToAddress("0x2000")
	to := common.HexToAddress("0x3000")
	decoded, err := DecodeTransfer(transferLog(token, from, to, big.NewInt(125)))
	if err != nil {
		t.Fatal(err)
	}
	if decoded.Token != token || decoded.From != from || decoded.To != to || decoded.Value.Cmp(big.NewInt(125)) != 0 {
		t.Fatalf("unexpected transfer: %+v", decoded)
	}
}

func TestStreamTransfersAppliesIndexedAddressFilters(t *testing.T) {
	token := common.HexToAddress("0x1000")
	alice := common.HexToAddress("0xA11CE")
	bob := common.HexToAddress("0xB0B")
	other := common.HexToAddress("0xCAFE")
	logs := make(chan types.Log, 2)
	logs <- transferLog(token, alice, bob, big.NewInt(10))
	logs <- transferLog(token, other, bob, big.NewInt(20))
	close(logs)

	var received []Transfer
	err := StreamTransfers(context.Background(), logs, &alice, &bob, func(transfer Transfer) error {
		received = append(received, transfer)
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(received) != 1 || received[0].Value.Cmp(big.NewInt(10)) != 0 {
		t.Fatalf("unexpected filtered transfers: %+v", received)
	}
}

func TestCollectsTopLevelAndInternalNativeTransfers(t *testing.T) {
	trace := CallFrame{
		Type: "CALL", From: "0x1000", To: "0x2000", Value: "0xde0b6b3a7640000",
		Calls: []CallFrame{
			{Type: "CALL", From: "0x2000", To: "0x3000", Value: "0x2386f26fc10000"},
			{Type: "STATICCALL", From: "0x2000", To: "0x4000", Value: "0x0"},
		},
	}
	transfers, err := CollectNativeTransfers(trace)
	if err != nil {
		t.Fatal(err)
	}
	if len(transfers) != 2 {
		t.Fatalf("got %d transfers", len(transfers))
	}
	if transfers[0].Depth != 0 || transfers[1].Depth != 1 {
		t.Fatalf("unexpected depths: %+v", transfers)
	}
}
