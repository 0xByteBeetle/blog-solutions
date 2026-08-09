package signing

import (
	"crypto/ecdsa"
	"math/big"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common"
	gethmath "github.com/ethereum/go-ethereum/common/math"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/signer/core/apitypes"
)

func PersonalSign(key *ecdsa.PrivateKey, message []byte) ([]byte, common.Hash, error) {
	digest := common.BytesToHash(accounts.TextHash(message))
	signature, err := crypto.Sign(digest.Bytes(), key)
	return signature, digest, err
}

func Recover(digest common.Hash, signature []byte) (common.Address, error) {
	publicKey, err := crypto.SigToPub(digest.Bytes(), signature)
	if err != nil {
		return common.Address{}, err
	}
	return crypto.PubkeyToAddress(*publicKey), nil
}

func PermitTypedData(
	chainID *big.Int,
	verifyingContract common.Address,
	owner common.Address,
	spender common.Address,
	value *big.Int,
	nonce *big.Int,
	deadline *big.Int,
) apitypes.TypedData {
	return apitypes.TypedData{
		Types: apitypes.Types{
			"EIP712Domain": {
				{Name: "name", Type: "string"},
				{Name: "version", Type: "string"},
				{Name: "chainId", Type: "uint256"},
				{Name: "verifyingContract", Type: "address"},
			},
			"Permit": {
				{Name: "owner", Type: "address"},
				{Name: "spender", Type: "address"},
				{Name: "value", Type: "uint256"},
				{Name: "nonce", Type: "uint256"},
				{Name: "deadline", Type: "uint256"},
			},
		},
		PrimaryType: "Permit",
		Domain: apitypes.TypedDataDomain{
			Name:              "0xByteBeetle Permit Demo",
			Version:           "1",
			ChainId:           (*gethmath.HexOrDecimal256)(chainID),
			VerifyingContract: verifyingContract.Hex(),
		},
		Message: apitypes.TypedDataMessage{
			"owner":    owner.Hex(),
			"spender":  spender.Hex(),
			"value":    value.String(),
			"nonce":    nonce.String(),
			"deadline": deadline.String(),
		},
	}
}

func TypedDataDigest(data apitypes.TypedData) (common.Hash, error) {
	digest, _, err := apitypes.TypedDataAndHash(data)
	if err != nil {
		return common.Hash{}, err
	}
	return common.BytesToHash(digest), nil
}

func TypedDataSign(key *ecdsa.PrivateKey, data apitypes.TypedData) ([]byte, common.Hash, error) {
	digest, err := TypedDataDigest(data)
	if err != nil {
		return nil, common.Hash{}, err
	}
	signature, err := crypto.Sign(digest.Bytes(), key)
	return signature, digest, err
}
