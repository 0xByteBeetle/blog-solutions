package main

import (
	"bytes"
	"fmt"
	"github.com/ethereum/go-ethereum/common"
	ethmath "github.com/ethereum/go-ethereum/common/math"
	"github.com/ethereum/go-ethereum/crypto"
	"math/big"
	"testing"
)

func TestIndependentABIWordsMatchTypedDataAndRecover(t *testing.T) {
	data := fixture()
	address := common.HexToAddress(data.Message["owner"].(string))
	owner := common.LeftPadBytes(address.Bytes(), 32)
	domain := crypto.Keccak256(crypto.Keccak256([]byte("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)")), crypto.Keccak256([]byte("MyDApp")), crypto.Keccak256([]byte("1")), word(big.NewInt(80002)), common.LeftPadBytes(common.HexToAddress(data.Domain.VerifyingContract).Bytes(), 32))
	message := crypto.Keccak256(crypto.Keccak256([]byte("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)")), owner, owner, word(big.NewInt(1000000000000000000)), word(big.NewInt(0)), word(big.NewInt(2000000000)))
	manual := crypto.Keccak256([]byte{0x19, 0x01}, domain, message)
	if !bytes.Equal(manual, digest(data)) {
		t.Fatal("typed data differs from independent ABI words")
	}
	key, _ := crypto.HexToECDSA(fmt.Sprintf("%064x", 1))
	sig, _ := crypto.Sign(manual, key)
	public, e := crypto.SigToPub(manual, sig)
	if e != nil || crypto.PubkeyToAddress(*public) != address {
		t.Fatal("recover", e)
	}
}
func TestDomainAndNonceBindDigest(t *testing.T) {
	original := digest(fixture())
	for _, field := range []string{"nonce", "deadline", "spender"} {
		data := fixture()
		if field == "spender" {
			data.Message[field] = "0x0000000000000000000000000000000000000002"
		} else {
			data.Message[field] = "1"
		}
		if bytes.Equal(original, digest(data)) {
			t.Fatal("unbound message", field)
		}
	}
	for _, field := range []string{"name", "version", "chainId", "verifyingContract"} {
		data := fixture()
		switch field {
		case "name":
			data.Domain.Name = "OtherDApp"
		case "version":
			data.Domain.Version = "2"
		case "chainId":
			data.Domain.ChainId = ethmath.NewHexOrDecimal256(1)
		case "verifyingContract":
			data.Domain.VerifyingContract = "0x0000000000000000000000000000000000000002"
		}
		if bytes.Equal(original, digest(data)) {
			t.Fatal("unbound domain", field)
		}
	}
}

func TestLocalRPCRejectsExternalOrAmbiguousTargets(t *testing.T) {
	for _, url := range []string{"https://polygon-amoy.drpc.org", "http://localhost:8545", "http://127.0.0.1:8545/?redirect=x", "http://user:pass@127.0.0.1:8545"} {
		if _, e := localRPC(url, "eth_chainId", nil); e == nil {
			t.Fatal("accepted target", url)
		}
	}
}
