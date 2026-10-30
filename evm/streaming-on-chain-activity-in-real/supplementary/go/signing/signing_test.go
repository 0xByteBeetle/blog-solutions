package signing

import (
	"math/big"
	"testing"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
)

func TestPersonalSignUsesEIP191PrefixAndRecoversSigner(t *testing.T) {
	key, err := crypto.HexToECDSA("0000000000000000000000000000000000000000000000000000000000000001")
	if err != nil {
		t.Fatal(err)
	}
	message := []byte("Login to app.xyz")
	signature, digest, err := PersonalSign(key, message)
	if err != nil {
		t.Fatal(err)
	}
	if digest == crypto.Keccak256Hash(message) {
		t.Fatal("personal_sign digest must include the EIP-191 prefix")
	}
	recovered, err := Recover(digest, signature)
	if err != nil {
		t.Fatal(err)
	}
	want := crypto.PubkeyToAddress(key.PublicKey)
	if recovered != want {
		t.Fatalf("got %s, want %s", recovered, want)
	}
}

func TestEIP712DomainAndMessageAreBothBoundIntoDigest(t *testing.T) {
	key, _ := crypto.HexToECDSA("0000000000000000000000000000000000000000000000000000000000000001")
	owner := crypto.PubkeyToAddress(key.PublicKey)
	spender := common.HexToAddress("0x000000000000000000000000000000000000BEEF")
	verifier := common.HexToAddress("0x000000000000000000000000000000000000CAFE")
	data := PermitTypedData(
		big.NewInt(31337),
		verifier,
		owner,
		spender,
		big.NewInt(125),
		big.NewInt(0),
		big.NewInt(2_000_000_000),
	)

	signature, digest, err := TypedDataSign(key, data)
	if err != nil {
		t.Fatal(err)
	}
	recovered, err := Recover(digest, signature)
	if err != nil {
		t.Fatal(err)
	}
	if recovered != owner {
		t.Fatalf("got %s, want %s", recovered, owner)
	}

	differentDomain := data
	differentDomain.Domain.VerifyingContract = common.HexToAddress("0x000000000000000000000000000000000000D00D").Hex()
	domainDigest, err := TypedDataDigest(differentDomain)
	if err != nil {
		t.Fatal(err)
	}
	if domainDigest == digest {
		t.Fatal("changing the verifying contract must change the digest")
	}

	differentMessage := data
	differentMessage.Message = make(map[string]interface{}, len(data.Message))
	for key, value := range data.Message {
		differentMessage.Message[key] = value
	}
	differentMessage.Message["nonce"] = "1"
	messageDigest, err := TypedDataDigest(differentMessage)
	if err != nil {
		t.Fatal(err)
	}
	if messageDigest == digest {
		t.Fatal("changing the nonce must change the digest")
	}
}
