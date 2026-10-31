package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	ethmath "github.com/ethereum/go-ethereum/common/math"
	"github.com/ethereum/go-ethereum/crypto"
	"io"
	"math/big"
	"net/http"
	"net/url"
	"strings"
	"time"
)

func localRPC(endpoint string, method string, params []any) (string, error) {
	u, e := url.Parse(endpoint)
	if e != nil || u.Scheme != "http" || u.Hostname() != "127.0.0.1" || u.Port() == "" || u.User != nil || u.RawQuery != "" || u.Fragment != "" || (u.Path != "" && u.Path != "/") {
		return "", fmt.Errorf("explicit http://127.0.0.1:PORT required")
	}
	payload, _ := json.Marshal(map[string]any{"jsonrpc": "2.0", "id": 1, "method": method, "params": params})
	client := &http.Client{Timeout: 10 * time.Second, Transport: &http.Transport{}, CheckRedirect: func(_ *http.Request, _ []*http.Request) error { return fmt.Errorf("redirect refused") }}
	response, e := client.Post(endpoint, "application/json", bytes.NewReader(payload))
	if e != nil {
		return "", e
	}
	defer response.Body.Close()
	if response.StatusCode != 200 {
		return "", fmt.Errorf("RPC HTTP %d", response.StatusCode)
	}
	var body struct {
		Result string          `json:"result"`
		Error  json.RawMessage `json:"error"`
	}
	e = json.NewDecoder(io.LimitReader(response.Body, 1<<20)).Decode(&body)
	if e != nil {
		return "", e
	}
	if len(body.Error) > 0 && string(body.Error) != "null" {
		return "", fmt.Errorf("RPC: %s", body.Error)
	}
	return body.Result, nil
}
func verifyLocal(endpoint, verifier string) error {
	if !common.IsHexAddress(verifier) {
		return fmt.Errorf("explicit verifier address required")
	}
	chain, e := localRPC(endpoint, "eth_chainId", []any{})
	if e != nil {
		return e
	}
	if chain != "0x7a69" {
		return fmt.Errorf("expected owned Anvil chain 31337")
	}
	data := fixture()
	data.Domain.ChainId = ethmath.NewHexOrDecimal256(31337)
	data.Domain.VerifyingContract = verifier
	key, _ := crypto.HexToECDSA(fmt.Sprintf("%064x", 1))
	sig, e := crypto.Sign(digest(data), key)
	if e != nil {
		return e
	}
	owner := common.HexToAddress(data.Message["owner"].(string))
	parsed, e := abi.JSON(strings.NewReader(`[{"name":"verifyPermit","type":"function","inputs":[{"type":"address"},{"type":"address"},{"type":"uint256"},{"type":"uint256"},{"type":"uint256"},{"type":"uint8"},{"type":"bytes32"},{"type":"bytes32"}],"outputs":[{"type":"bool"}],"stateMutability":"view"}]`))
	if e != nil {
		return e
	}
	selector := crypto.Keccak256([]byte("verifyPermit(address,address,uint256,uint256,uint256,uint8,bytes32,bytes32)"))[:4]
	for _, value := range []int64{1000000000000000000, 999} {
		input := append([]byte{}, selector...)
		for _, v := range [][]byte{common.LeftPadBytes(owner.Bytes(), 32), common.LeftPadBytes(owner.Bytes(), 32), word(big.NewInt(value)), word(big.NewInt(0)), word(big.NewInt(2000000000)), word(big.NewInt(int64(sig[64]) + 27)), sig[:32], sig[32:64]} {
			input = append(input, v...)
		}
		packed, e := parsed.Pack("verifyPermit", owner, owner, big.NewInt(value), big.NewInt(0), big.NewInt(2000000000), uint8(sig[64])+27, common.BytesToHash(sig[:32]), common.BytesToHash(sig[32:64]))
		if e != nil {
			return e
		}
		if !bytes.Equal(packed, input) {
			return fmt.Errorf("ABI pack differs from independent argument words")
		}
		result, e := localRPC(endpoint, "eth_call", []any{map[string]string{"to": verifier, "data": fmt.Sprintf("0x%x", packed)}, "latest"})
		if e != nil {
			return e
		}
		decoded, e := parsed.Unpack("verifyPermit", common.FromHex(result))
		if e != nil {
			return e
		}
		if len(decoded) != 1 || decoded[0].(bool) != (value == 1000000000000000000) {
			return fmt.Errorf("verifyPermit returned unexpected bool: %s", result)
		}
		fmt.Printf("local eth_call value=%d signature valid=%t; no nonce/allowance mutation\n", value, value == 1000000000000000000)
	}
	return nil
}
