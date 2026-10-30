package transactions

import (
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
)

func TestTransactionEnvelopeTypesAndSenderRecovery(t *testing.T) {
	key, err := TestKey()
	if err != nil {
		t.Fatal(err)
	}
	wantSender := crypto.PubkeyToAddress(key.PublicKey)

	tests := []struct {
		name     string
		wantType uint8
		build    func() (*types.Transaction, error)
	}{
		{"legacy", types.LegacyTxType, func() (*types.Transaction, error) { return SignLegacy(key) }},
		{"access list", types.AccessListTxType, func() (*types.Transaction, error) { return SignAccessList(key) }},
		{"dynamic fee", types.DynamicFeeTxType, func() (*types.Transaction, error) { return SignDynamicFee(key) }},
		{"blob", types.BlobTxType, func() (*types.Transaction, error) { return SignBlob(key, []byte("0xByteBeetle blob example")) }},
		{"set code", types.SetCodeTxType, func() (*types.Transaction, error) {
			return SignSetCode(key, common.HexToAddress("0x000000000000000000000000000000000000CAFE"))
		}},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			tx, err := test.build()
			if err != nil {
				t.Fatal(err)
			}
			if tx.Type() != test.wantType {
				t.Fatalf("got type 0x%x, want 0x%x", tx.Type(), test.wantType)
			}
			if tx.ChainId().Cmp(DemoChainID) != 0 {
				t.Fatalf("got chain ID %s", tx.ChainId())
			}
			sender, err := types.Sender(types.LatestSignerForChainID(DemoChainID), tx)
			if err != nil {
				t.Fatal(err)
			}
			if sender != wantSender {
				t.Fatalf("got sender %s, want %s", sender, wantSender)
			}

			encoded, err := tx.MarshalBinary()
			if err != nil {
				t.Fatal(err)
			}
			if test.wantType == types.LegacyTxType {
				if encoded[0] < 0xc0 {
					t.Fatalf("legacy transaction should begin with an RLP list prefix, got 0x%x", encoded[0])
				}
			} else if encoded[0] != test.wantType {
				t.Fatalf("typed envelope starts with 0x%x, want 0x%x", encoded[0], test.wantType)
			}
		})
	}
}

func TestBlobSidecarMatchesVersionedHashes(t *testing.T) {
	key, _ := TestKey()
	tx, err := SignBlob(key, []byte("checked locally without broadcasting"))
	if err != nil {
		t.Fatal(err)
	}
	sidecar := tx.BlobTxSidecar()
	if sidecar == nil || len(sidecar.Blobs) != 1 {
		t.Fatal("expected one blob sidecar")
	}
	if err := sidecar.ValidateBlobCommitmentHashes(tx.BlobHashes()); err != nil {
		t.Fatal(err)
	}
}

func TestSetCodeAuthorizationRecoversAuthority(t *testing.T) {
	key, _ := TestKey()
	tx, err := SignSetCode(key, common.HexToAddress("0x000000000000000000000000000000000000CAFE"))
	if err != nil {
		t.Fatal(err)
	}
	authorizations := tx.SetCodeAuthorizations()
	if len(authorizations) != 1 {
		t.Fatalf("got %d authorizations", len(authorizations))
	}
	authority, err := authorizations[0].Authority()
	if err != nil {
		t.Fatal(err)
	}
	want := crypto.PubkeyToAddress(key.PublicKey)
	if authority != want {
		t.Fatalf("got authority %s, want %s", authority, want)
	}
}
