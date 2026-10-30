package main

import (
	"bytes"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"testing"
)

func TestPrefixByteLengthAndRecovery(t *testing.T) {
	golden := map[string]string{"Login to app.xyz": "0x9ebab044560303562376f745e565c97c0995cba432397d082cf3260c5e1d6f78", "": "0x5f35dce98ba4fba25530a026ed80b2cecdaa31091ba4958b99b52ea1d068adad", "é⚓": "0x32e6726a51c4b92d8d7dc2c582f8fb6dce4fe9aec97d96261291e4b74cacd0d9"}
	for text, expected := range golden {
		message := []byte(text)
		digest, sig := sign(message)
		if common.BytesToHash(digest).Hex() != expected {
			t.Fatal("prefix length", text)
		}
		if len(sig) != 65 || sig[64] > 1 {
			t.Fatal("r,s,y-parity")
		}
		public, e := crypto.SigToPub(digest, sig)
		if e != nil || crypto.PubkeyToAddress(*public) != fixtureSender {
			t.Fatal("recover", e)
		}
	}
}
func TestWrongMessageAndUnprefixedHash(t *testing.T) {
	digest, sig := sign([]byte("Login to app.xyz"))
	for _, wrong := range [][]byte{func() []byte { h, _ := sign([]byte("Login to attacker.xyz")); return h }(), crypto.Keccak256([]byte("Login to app.xyz"))} {
		if bytes.Equal(digest, wrong) {
			t.Fatal("hash collision")
		}
		public, e := crypto.SigToPub(wrong, sig)
		if e == nil && crypto.PubkeyToAddress(*public) == fixtureSender {
			t.Fatal("wrong message recovered expected signer")
		}
	}
}
