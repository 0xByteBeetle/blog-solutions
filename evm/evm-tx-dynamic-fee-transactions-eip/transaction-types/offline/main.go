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
var token = common.HexToAddress("0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904")
var data = common.FromHex("0xa9059cbb0000000000000000000000008056361b1c1361436d61d187d761233b42d1c20e000000000000000000000000000000000000000000000000016345785d8a0000")

func feeCap(base, tip *big.Int) (*big.Int, error) {
	if base.Sign() < 0 || tip.Sign() < 0 {
		return nil, fmt.Errorf("negative fee")
	}
	cap := new(big.Int).Div(new(big.Int).Mul(base, big.NewInt(112)), big.NewInt(100))
	cap.Add(cap, tip)
	if cap.BitLen() > 256 {
		return nil, fmt.Errorf("fee exceeds uint256")
	}
	return cap, nil
}
func fixture() *types.Transaction {
	cap, e := feeCap(big.NewInt(1000000000), big.NewInt(2000000000))
	if e != nil {
		panic(e)
	}
	tx, e := types.SignTx(types.NewTx(&types.DynamicFeeTx{ChainID: big.NewInt(80002), Nonce: 7, GasTipCap: big.NewInt(2000000000), GasFeeCap: cap, Gas: 100000, To: &token, Data: data}), types.NewLondonSigner(big.NewInt(80002)), fixtureKey())
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
