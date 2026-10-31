package main

import (
	"crypto/sha256"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto/kzg4844"
	"math/big"
	"testing"
)

func TestKZGProofVersionedHashAndTampering(t *testing.T) {
	tx, sc, e := fixture()
	if e != nil {
		t.Fatal(e)
	}
	if e = kzg4844.VerifyBlobProof(&sc.Blobs[0], sc.Commitments[0], sc.Proofs[0]); e != nil {
		t.Fatal(e)
	}
	manual := sha256.Sum256(sc.Commitments[0][:])
	manual[0] = 1
	if tx.BlobHashes()[0] != common.Hash(manual) {
		t.Fatal("versioned SHA256 hash")
	}
	bad := sc.Blobs[0]
	bad[len(bad)-1] = 1
	if kzg4844.VerifyBlobProof(&bad, sc.Commitments[0], sc.Proofs[0]) == nil {
		t.Fatal("changed blob proof accepted")
	}
	for i := 0; i < 32; i++ {
		bad[i] = 0xff
	}
	if _, e := kzg4844.BlobToCommitment(&bad); e == nil {
		t.Fatal("noncanonical field accepted")
	}
}
func TestEnvelopeSidecarAndSender(t *testing.T) {
	tx, _, e := fixture()
	if e != nil {
		t.Fatal(e)
	}
	network, _ := tx.MarshalBinary()
	core, _ := tx.WithoutBlobTxSidecar().MarshalBinary()
	if core[0] != 3 || len(network) <= len(core) || tx.WithoutBlobTxSidecar().Hash() != tx.Hash() {
		t.Fatal("sidecar/core separation")
	}
	var decoded types.Transaction
	if e = decoded.UnmarshalBinary(network); e != nil {
		t.Fatal(e)
	}
	if decoded.Nonce() != 7 || decoded.BlobGasFeeCap().Int64() != 2000000 || decoded.GasFeeCap().Int64() != 3120000000 || len(decoded.BlobTxSidecar().Blobs) != 1 || decoded.Hash() != tx.Hash() {
		t.Fatal("blob fields")
	}
	sender, e := types.Sender(types.LatestSignerForChainID(big.NewInt(11155111)), &decoded)
	if e != nil || sender != common.HexToAddress("0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf") {
		t.Fatal(sender, e)
	}
	if _, e := types.Sender(types.LatestSignerForChainID(big.NewInt(1)), &decoded); e == nil {
		t.Fatal("wrong chain accepted")
	}
}

func TestArticlePayloadIsPreserved(t *testing.T) {
	payload := []byte("Hello, EIP-4844 Blob Transaction on Sepolia! This is some arbitrary data for the blob payload.")
	_, sc, e := fixture()
	if e != nil {
		t.Fatal(e)
	}
	if string(sc.Blobs[0][:len(payload)]) != string(payload) {
		t.Fatal("article payload not retained")
	}
	for _, v := range sc.Blobs[0][len(payload):] {
		if v != 0 {
			t.Fatal("unexpected nonzero padding")
		}
	}
}
