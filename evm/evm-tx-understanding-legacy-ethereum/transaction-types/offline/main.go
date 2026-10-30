package main

import (
	"crypto/ecdsa"
	"fmt"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"math/big"
)

// Supplemental OFFLINE fixture. Public key integer 1: NEVER FUND; no files/RPC/broadcast.
func fixtureKey() *ecdsa.PrivateKey {
	k, e := crypto.HexToECDSA(fmt.Sprintf("%064x", 1))
	if e != nil {
		panic(e)
	}
	return k
}

var fixtureSender = common.HexToAddress("0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf")

func fixture() *types.Transaction {
	to := common.HexToAddress("0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF")
	tx, e := types.SignTx(types.NewTx(&types.LegacyTx{Nonce: 7, GasPrice: big.NewInt(3000000000), Gas: 21000, To: &to, Value: big.NewInt(10000000000000000)}), types.NewEIP155Signer(big.NewInt(80002)), fixtureKey())
	if e != nil {
		panic(e)
	}
	return tx
}
func main() {
	tx := fixture()
	raw, e := tx.MarshalBinary()
	if e != nil {
		panic(e)
	}
	sender, e := types.Sender(types.LatestSignerForChainID(tx.ChainId()), tx)
	if e != nil {
		panic(e)
	}
	fmt.Printf("type=%d chain=%s nonce=%d sender=%s signed=0x%x\n", tx.Type(), tx.ChainId(), tx.Nonce(), sender, raw)
}
