package main

import (
	"encoding/hex"
	"encoding/json"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"math/big"
	"net/http"
	"net/http/httptest"
	"os"
	"os/exec"
	"strings"
	"sync/atomic"
	"testing"
)

func TestOriginalMainHelper(t *testing.T) {
	if os.Getenv("MULTICALL_TEST_HELPER") != "1" {
		return
	}
	RPC = os.Getenv("MULTICALL_TEST_RPC")
	main()
}
func TestOriginalMainUsesOneEthCallAndDecodesResults(t *testing.T) {
	for _, scenario := range []string{"success", "failed-symbol", "malformed"} {
		t.Run(scenario, func(t *testing.T) {
			mabi, err := abi.JSON(strings.NewReader(multicallABI))
			if err != nil {
				t.Fatal(err)
			}
			eabi, err := abi.JSON(strings.NewReader(erc20ABI))
			if err != nil {
				t.Fatal(err)
			}
			var calls atomic.Int32
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				calls.Add(1)
				var req struct {
					ID     json.RawMessage   `json:"id"`
					Method string            `json:"method"`
					Params []json.RawMessage `json:"params"`
				}
				if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
					t.Error(err)
					return
				}
				if req.Method != "eth_call" || len(req.Params) != 2 {
					t.Errorf("unexpected RPC %s", req.Method)
					return
				}
				var call map[string]string
				if err := json.Unmarshal(req.Params[0], &call); err != nil {
					t.Error(err)
					return
				}
				if !strings.EqualFold(call["to"], MULTICALL_ADDR.Hex()) {
					t.Error("wrong Multicall target")
				}
				input := call["input"]
				if input == "" {
					input = call["data"]
				}
				raw, err := hex.DecodeString(strings.TrimPrefix(input, "0x"))
				if err != nil || len(raw) < 4 {
					t.Error("invalid input")
					return
				}
				if hex.EncodeToString(raw[:4]) != "bce38bd7" {
					t.Error("not tryAggregate")
				}
				values, err := mabi.Methods["tryAggregate"].Inputs.Unpack(raw[4:])
				if err != nil {
					t.Error(err)
					return
				}
				type Call struct {
					Target   common.Address
					CallData []byte
				}
				items := *abi.ConvertType(values[1], new([]Call)).(*[]Call)
				if values[0].(bool) || len(items) != 3 {
					t.Error("requireSuccess or count")
				}
				for i, selector := range []string{"70a08231", "95d89b41", "313ce567"} {
					if items[i].Target != TOKEN_ADDR || hex.EncodeToString(items[i].CallData[:4]) != selector {
						t.Error("wrong ERC20 subcall")
					}
				}
				if len(items[0].CallData) != 36 || common.BytesToAddress(items[0].CallData[16:]) != USER {
					t.Error("balanceOf owner")
				}
				result := "0x1234"
				if scenario != "malformed" {
					balance, _ := eabi.Methods["balanceOf"].Outputs.Pack(big.NewInt(123456789))
					symbol, _ := eabi.Methods["symbol"].Outputs.Pack("LINK")
					decimals, _ := eabi.Methods["decimals"].Outputs.Pack(uint8(18))
					encoded, err := mabi.Methods["tryAggregate"].Outputs.Pack([]struct {
						Success    bool
						ReturnData []byte
					}{{true, balance}, {scenario != "failed-symbol", symbol}, {true, decimals}})
					if err != nil {
						t.Error(err)
						return
					}
					result = "0x" + hex.EncodeToString(encoded)
				}
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(map[string]interface{}{"jsonrpc": "2.0", "id": req.ID, "result": result})
			}))
			defer server.Close()
			cmd := exec.Command(os.Args[0], "-test.run=^TestOriginalMainHelper$")
			cmd.Env = append(os.Environ(), "MULTICALL_TEST_HELPER=1", "MULTICALL_TEST_RPC="+server.URL)
			output, err := cmd.CombinedOutput()
			if scenario == "malformed" {
				if err == nil || !strings.Contains(string(output), "unpack tryAggregate") {
					t.Fatalf("malformed response: %s / %v", output, err)
				}
			} else {
				if err != nil || !strings.Contains(string(output), "123456789") || !strings.Contains(string(output), "Decimals: 18") {
					t.Fatalf("%s / %v", output, err)
				}
				if scenario == "success" && !strings.Contains(string(output), "Symbol: LINK") {
					t.Fatal(string(output))
				}
				if scenario == "failed-symbol" && !strings.Contains(string(output), "symbol failed") {
					t.Fatal(string(output))
				}
			}
			if calls.Load() != 1 {
				t.Fatalf("want one batched eth_call, got %d", calls.Load())
			}
		})
	}
}
