// Supplemental offline execution of the article's transaction and personal-sign formats.
package main

import (
	"encoding/hex"
	"fmt"
	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"math/big"
)

func examples() ([]*types.Transaction, []byte, error) {
	// Public throwaway key 1, used only in memory. Never broadcast these fixtures.
	key, err := crypto.HexToECDSA(fmt.Sprintf("%064x", 1))
	if err != nil {
		return nil, nil, err
	}
	chainID := big.NewInt(80002)
	to := common.HexToAddress("0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904")
	data := common.FromHex("0xa9059cbb0000000000000000000000008056361b1c1361436d61d187d761233b42d1c20e000000000000000000000000000000000000000000000000016345785d8a0000")
	list := types.AccessList{{Address: to, StorageKeys: []common.Hash{
		common.HexToHash("0xf9a42dc9f268c1720e130da18118febc65e0ca534e035a0e39d30cf8daea5f0a"),
		common.HexToHash("0x0c2d31ae2b93233fa550fc5df04cd7b0b742c0821a2494f91cd79ca74a9e2e48")}}}
	// Fixed offline nonce/gas/fee inputs replace the original RPC queries.
	base, tip := big.NewInt(1_000_000_000), big.NewInt(2_000_000_000)
	cap := new(big.Int).Div(new(big.Int).Mul(base, big.NewInt(112)), big.NewInt(100))
	cap.Add(cap, tip)
	unsigned := []*types.Transaction{
		types.NewTx(&types.AccessListTx{ChainID: chainID, Nonce: 0, GasPrice: big.NewInt(3_000_000_000), Gas: 100000, To: &to, Data: data, AccessList: list}),
		types.NewTx(&types.DynamicFeeTx{ChainID: chainID, Nonce: 1, GasTipCap: tip, GasFeeCap: cap, Gas: 100000, To: &to, Data: data}),
	}
	signed := make([]*types.Transaction, len(unsigned))
	for i, tx := range unsigned {
		signed[i], err = types.SignTx(tx, types.LatestSignerForChainID(chainID), key)
		if err != nil {
			return nil, nil, err
		}
	}
	signature, err := crypto.Sign(accounts.TextHash([]byte("Login to app.xyz")), key)
	return signed, signature, err
}

func main() {
	txs, sig, err := examples()
	if err != nil {
		panic(err)
	}
	for _, tx := range txs {
		raw, err := tx.MarshalBinary()
		if err != nil {
			panic(err)
		}
		sender, err := types.Sender(types.LatestSignerForChainID(tx.ChainId()), tx)
		if err != nil {
			panic(err)
		}
		fmt.Printf("type=%d chain=%s sender=%s signed=0x%s\n", tx.Type(), tx.ChainId(), sender, hex.EncodeToString(raw))
	}
	fmt.Printf("personal_sign message=%q hash=%s signature=0x%x\n", "Login to app.xyz", common.BytesToHash(accounts.TextHash([]byte("Login to app.xyz"))), sig)
}
