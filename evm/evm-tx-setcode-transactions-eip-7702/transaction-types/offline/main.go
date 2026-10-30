// Supplemental OFFLINE SetCode authorization and envelope exercise; public NEVER-FUND keys 1 and 2.
package main

import (
	"fmt"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/holiman/uint256"
	"math"
	"math/big"
)

var module = common.HexToAddress("0x4f9c96915a9ce8cd5eb11a2c35ab587fc97d5126")

func authorize(keyNumber int, nonce uint64) (types.SetCodeAuthorization, error) {
	if nonce == math.MaxUint64 {
		return types.SetCodeAuthorization{}, fmt.Errorf("authorization nonce must be below 2^64-1")
	}
	key, e := crypto.HexToECDSA(fmt.Sprintf("%064x", keyNumber))
	if e != nil {
		return types.SetCodeAuthorization{}, e
	}
	return types.SignSetCode(key, types.SetCodeAuthorization{ChainID: *uint256.NewInt(80002), Address: module, Nonce: nonce})
}
func fixture() (*types.Transaction, error) {
	a, e := authorize(1, 0)
	if e != nil {
		return nil, e
	}
	b, e := authorize(2, 1)
	if e != nil {
		return nil, e
	}
	key, e := crypto.HexToECDSA(fmt.Sprintf("%064x", 2))
	if e != nil {
		return nil, e
	}
	return types.SignTx(types.NewTx(&types.SetCodeTx{ChainID: uint256.NewInt(80002), Nonce: 0, GasTipCap: uint256.NewInt(2000000000), GasFeeCap: uint256.NewInt(3120000000), Gas: 120000, To: common.HexToAddress("0x87581c71b3693062f4d3e34617c3919ec1abf39b"), AuthList: []types.SetCodeAuthorization{a, b}}), types.LatestSignerForChainID(big.NewInt(80002)), key)
}
func main() {
	tx, e := fixture()
	if e != nil {
		panic(e)
	}
	for _, auth := range tx.SetCodeAuthorizations() {
		authority, e := auth.Authority()
		if e != nil {
			panic(e)
		}
		fmt.Printf("authority=%s nonce=%d module=%s\n", authority, auth.Nonce, auth.Address)
	}
	raw, e := tx.MarshalBinary()
	if e != nil {
		panic(e)
	}
	fmt.Printf("type=%d nonce=%d signed=0x%x\n", tx.Type(), tx.Nonce(), raw)
}
