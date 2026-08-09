package transactions

import (
	"crypto/ecdsa"
	"errors"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/crypto/kzg4844"
	"github.com/holiman/uint256"
)

var (
	DemoChainID = big.NewInt(31337)
	DemoTo      = common.HexToAddress("0x000000000000000000000000000000000000BEEF")
)

func TestKey() (*ecdsa.PrivateKey, error) {
	return crypto.HexToECDSA("0000000000000000000000000000000000000000000000000000000000000001")
}

func SignLegacy(key *ecdsa.PrivateKey) (*types.Transaction, error) {
	tx := types.NewTx(&types.LegacyTx{
		Nonce:    0,
		GasPrice: big.NewInt(2_000_000_000),
		Gas:      21_000,
		To:       &DemoTo,
		Value:    big.NewInt(1_000_000_000_000_000),
	})
	return types.SignTx(tx, types.NewEIP155Signer(DemoChainID), key)
}

func SignAccessList(key *ecdsa.PrivateKey) (*types.Transaction, error) {
	list := types.AccessList{{
		Address: DemoTo,
		StorageKeys: []common.Hash{
			common.HexToHash("0x01"),
		},
	}}
	tx := types.NewTx(&types.AccessListTx{
		ChainID:    new(big.Int).Set(DemoChainID),
		Nonce:      1,
		GasPrice:   big.NewInt(2_000_000_000),
		Gas:        50_000,
		To:         &DemoTo,
		Value:      big.NewInt(0),
		Data:       []byte{0xde, 0xad, 0xbe, 0xef},
		AccessList: list,
	})
	return types.SignTx(tx, types.NewEIP2930Signer(DemoChainID), key)
}

func SignDynamicFee(key *ecdsa.PrivateKey) (*types.Transaction, error) {
	tx := types.NewTx(&types.DynamicFeeTx{
		ChainID:   new(big.Int).Set(DemoChainID),
		Nonce:     2,
		GasTipCap: big.NewInt(1_000_000_000),
		GasFeeCap: big.NewInt(30_000_000_000),
		Gas:       50_000,
		To:        &DemoTo,
		Value:     big.NewInt(0),
		Data:      []byte{0xca, 0xfe},
	})
	return types.SignTx(tx, types.LatestSignerForChainID(DemoChainID), key)
}

func SignBlob(key *ecdsa.PrivateKey, content []byte) (*types.Transaction, error) {
	if len(content) > 31*4096 {
		return nil, errors.New("content does not fit in one canonical blob")
	}

	var blob kzg4844.Blob
	for inputIndex, blobIndex := 0, 1; inputIndex < len(content); inputIndex, blobIndex = inputIndex+1, blobIndex+1 {
		if blobIndex%32 == 0 {
			blobIndex++
		}
		blob[blobIndex] = content[inputIndex]
	}

	commitment, err := kzg4844.BlobToCommitment(&blob)
	if err != nil {
		return nil, err
	}
	proof, err := kzg4844.ComputeBlobProof(&blob, commitment)
	if err != nil {
		return nil, err
	}
	sidecar := &types.BlobTxSidecar{
		Blobs:       []kzg4844.Blob{blob},
		Commitments: []kzg4844.Commitment{commitment},
		Proofs:      []kzg4844.Proof{proof},
	}
	hashes := sidecar.BlobHashes()

	tx := types.NewTx(&types.BlobTx{
		ChainID:    uint256.MustFromBig(DemoChainID),
		Nonce:      3,
		GasTipCap:  uint256.NewInt(1_000_000_000),
		GasFeeCap:  uint256.NewInt(30_000_000_000),
		Gas:        100_000,
		To:         DemoTo,
		Value:      uint256.NewInt(0),
		BlobFeeCap: uint256.NewInt(3_000_000_000),
		BlobHashes: hashes,
		Sidecar:    sidecar,
	})
	return types.SignTx(tx, types.LatestSignerForChainID(DemoChainID), key)
}

func SignSetCode(key *ecdsa.PrivateKey, implementation common.Address) (*types.Transaction, error) {
	authorization, err := types.SignSetCode(key, types.SetCodeAuthorization{
		ChainID: *uint256.MustFromBig(DemoChainID),
		Address: implementation,
		Nonce:   4,
	})
	if err != nil {
		return nil, err
	}

	tx := types.NewTx(&types.SetCodeTx{
		ChainID:   uint256.MustFromBig(DemoChainID),
		Nonce:     4,
		GasTipCap: uint256.NewInt(1_000_000_000),
		GasFeeCap: uint256.NewInt(30_000_000_000),
		Gas:       150_000,
		To:        DemoTo,
		Value:     uint256.NewInt(0),
		AuthList:  []types.SetCodeAuthorization{authorization},
	})
	return types.SignTx(tx, types.LatestSignerForChainID(DemoChainID), key)
}
