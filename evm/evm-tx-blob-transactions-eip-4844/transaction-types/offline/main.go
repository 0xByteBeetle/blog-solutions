// Supplemental offline KZG/BlobTx exercise. Uses geth's bundled Go KZG setup, no external files.
package main

import (
	"crypto/sha256"
	"fmt"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/crypto/kzg4844"
	"github.com/holiman/uint256"
	"math/big"
)

func fixture() (*types.Transaction, *types.BlobTxSidecar, error) {
	if e := kzg4844.UseCKZG(false); e != nil {
		return nil, nil, e
	}
	var blob kzg4844.Blob
	// A zero high byte in each field element guarantees a canonical scalar for this short payload.
	copy(blob[1:32], []byte("Hello, EIP-4844 offline!"))
	commitment, e := kzg4844.BlobToCommitment(&blob)
	if e != nil {
		return nil, nil, e
	}
	proof, e := kzg4844.ComputeBlobProof(&blob, commitment)
	if e != nil {
		return nil, nil, e
	}
	hash := common.Hash(kzg4844.CalcBlobHashV1(sha256.New(), &commitment))
	sidecar := &types.BlobTxSidecar{Blobs: []kzg4844.Blob{blob}, Commitments: []kzg4844.Commitment{commitment}, Proofs: []kzg4844.Proof{proof}}
	tx := types.NewTx(&types.BlobTx{ChainID: uint256.NewInt(11155111), Nonce: 7, GasTipCap: uint256.NewInt(2000000000), GasFeeCap: uint256.NewInt(3120000000), Gas: 21000, To: common.HexToAddress("0x7F8b1ca29F95274E06367b60fC4a539E4910FD0c"), Value: uint256.NewInt(100000000000000), BlobFeeCap: uint256.NewInt(2000000), BlobHashes: []common.Hash{hash}}).WithBlobTxSidecar(sidecar)
	key, e := crypto.HexToECDSA(fmt.Sprintf("%064x", 1))
	if e != nil {
		return nil, nil, e
	}
	signed, e := types.SignTx(tx, types.LatestSignerForChainID(big.NewInt(11155111)), key)
	return signed, sidecar, e
}
func main() {
	tx, sidecar, e := fixture()
	if e != nil {
		panic(e)
	}
	if e = kzg4844.VerifyBlobProof(&sidecar.Blobs[0], sidecar.Commitments[0], sidecar.Proofs[0]); e != nil {
		panic(e)
	}
	raw, _ := tx.MarshalBinary()
	core, _ := tx.WithoutBlobTxSidecar().MarshalBinary()
	sender, e := types.Sender(types.LatestSignerForChainID(tx.ChainId()), tx)
	if e != nil {
		panic(e)
	}
	fmt.Printf("NEVER-FUND public fixture key 1; type=%d signer=%s versionedHash=%s coreBytes=%d networkWrapperBytes=%d txHash=%s\n", tx.Type(), sender, tx.BlobHashes()[0], len(core), len(raw), tx.Hash())
}
