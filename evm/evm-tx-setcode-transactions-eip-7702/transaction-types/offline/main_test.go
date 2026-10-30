package main

import (
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/rlp"
	"math"
	"math/big"
	"testing"
)

func TestManualAuthorizationPreimageAndNonceBoundaries(t *testing.T) {
	for _, nonce := range []uint64{0, 1, math.MaxInt64, 1 << 63, math.MaxUint64 - 1} {
		auth, e := authorize(1, nonce)
		if e != nil {
			t.Fatal(e)
		}
		encoded, e := rlp.EncodeToBytes([]interface{}{big.NewInt(80002), module, nonce})
		if e != nil {
			t.Fatal(e)
		}
		digest := crypto.Keccak256(append([]byte{5}, encoded...))
		sig := append(common.LeftPadBytes(auth.R.Bytes(), 32), common.LeftPadBytes(auth.S.Bytes(), 32)...)
		sig = append(sig, auth.V)
		public, e := crypto.SigToPub(digest, sig)
		if e != nil || crypto.PubkeyToAddress(*public) != common.HexToAddress("0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf") {
			t.Fatal("manual RLP auth recovery", nonce, e)
		}
		auth.Nonce++
		changed, e := auth.Authority()
		if e == nil && changed == crypto.PubkeyToAddress(*public) {
			t.Fatal("nonce mutation kept authority")
		}
	}
	if _, e := authorize(1, math.MaxUint64); e == nil {
		t.Fatal("max nonce accepted")
	}
}
func TestSetCodeEnvelopeAndSelfAuthorizationNonce(t *testing.T) {
	tx, e := fixture()
	if e != nil {
		t.Fatal(e)
	}
	raw, _ := tx.MarshalBinary()
	if raw[0] != 4 {
		t.Fatal("SetCode type byte")
	}
	var round types.Transaction
	if e = round.UnmarshalBinary(raw); e != nil {
		t.Fatal(e)
	}
	auths := round.SetCodeAuthorizations()
	if len(auths) != 2 || auths[0].Nonce != 0 || auths[1].Nonce != round.Nonce()+1 {
		t.Fatal("authorization list/self-sender nonce")
	}
	sender, e := types.Sender(types.LatestSignerForChainID(big.NewInt(80002)), &round)
	if e != nil || sender != common.HexToAddress("0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF") {
		t.Fatal(sender, e)
	}
	if _, e = types.Sender(types.LatestSignerForChainID(big.NewInt(1)), &round); e == nil {
		t.Fatal("wrong chain signer accepted")
	}
	if round.Hash() != tx.Hash() {
		t.Fatal("serialization changed")
	}
}
