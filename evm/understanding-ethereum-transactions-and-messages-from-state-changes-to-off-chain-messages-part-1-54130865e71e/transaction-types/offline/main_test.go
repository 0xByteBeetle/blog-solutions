package main

import (
	"bytes"
	"fmt"
	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"math/big"
	"testing"
)

func TestTypedTransactionsRoundTripAndRecover(t *testing.T) {
	txs, _, err := examples()
	if err != nil {
		t.Fatal(err)
	}
	for i, tx := range txs {
		wantType := uint8(i + 1)
		raw, err := tx.MarshalBinary()
		if err != nil {
			t.Fatal(err)
		}
		if raw[0] != wantType || tx.Type() != wantType {
			t.Fatal("wrong typed-envelope byte")
		}
		var decoded types.Transaction
		if err := decoded.UnmarshalBinary(raw); err != nil {
			t.Fatal(err)
		}
		if decoded.Hash() != tx.Hash() || decoded.ChainId().Int64() != 80002 || decoded.Nonce() != uint64(i) || decoded.Gas() != 100000 || decoded.Value().Sign() != 0 {
			t.Fatal("transaction fields changed")
		}
		if decoded.To() == nil || *decoded.To() != common.HexToAddress("0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904") || len(decoded.Data()) != 68 || !bytes.Equal(decoded.Data()[:4], common.FromHex("0xa9059cbb")) {
			t.Fatal("ERC20 call changed")
		}
		sender, err := types.Sender(types.LatestSignerForChainID(big.NewInt(80002)), &decoded)
		if err != nil || sender != common.HexToAddress("0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf") {
			t.Fatal("sender recovery", sender, err)
		}
		if _, err := types.Sender(types.LatestSignerForChainID(big.NewInt(1)), &decoded); err == nil {
			t.Fatal("wrong-chain signer accepted")
		}
	}
	if len(txs[0].AccessList()) != 1 || len(txs[0].AccessList()[0].StorageKeys) != 2 || txs[0].GasPrice().Int64() != 3000000000 {
		t.Fatal("access list/gas price")
	}
	if txs[1].GasFeeCap().Int64() != 3120000000 || txs[1].GasTipCap().Int64() != 2000000000 {
		t.Fatal("112% buffered base plus tip")
	}
}

func TestPersonalSignPrefixAndRecovery(t *testing.T) {
	_, signature, err := examples()
	if err != nil {
		t.Fatal(err)
	}
	message := []byte("Login to app.xyz")
	manual := crypto.Keccak256([]byte(fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(message), message)))
	if !bytes.Equal(manual, accounts.TextHash(message)) || len(signature) != 65 || signature[64] > 1 {
		t.Fatal("personal_sign prefix or signature format")
	}
	public, err := crypto.SigToPub(manual, signature)
	if err != nil {
		t.Fatal(err)
	}
	sender := crypto.PubkeyToAddress(*public)
	if sender != common.HexToAddress("0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf") {
		t.Fatal("wrong signer")
	}
	changed, err := crypto.SigToPub(accounts.TextHash([]byte("Login to attacker.xyz")), signature)
	if err == nil && crypto.PubkeyToAddress(*changed) == sender {
		t.Fatal("signature accepted for changed message")
	}
}
