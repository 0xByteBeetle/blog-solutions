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

func fixture() *types.Transaction {
	list := types.AccessList{{Address: token, StorageKeys: []common.Hash{common.HexToHash("0xf9a42dc9f268c1720e130da18118febc65e0ca534e035a0e39d30cf8daea5f0a"), common.HexToHash("0x0c2d31ae2b93233fa550fc5df04cd7b0b742c0821a2494f91cd79ca74a9e2e48")}}}
	tx, e := types.SignTx(types.NewTx(&types.AccessListTx{ChainID: big.NewInt(80002), Nonce: 7, GasPrice: big.NewInt(3000000000), Gas: 100000, To: &token, Data: data, AccessList: list}), types.NewEIP2930Signer(big.NewInt(80002)), fixtureKey())
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
