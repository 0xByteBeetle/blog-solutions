package main

import (
	"bytes"
	"encoding/hex"
	"encoding/json"
	"io"
	"math/big"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
)

// Supplemental tests execute unchanged main against an owned loopback mock.
// The mock verifies calldata and returns deterministic ABI fixtures, not chain data.
func TestMainLoopback(t *testing.T) {
	for _, failedSymbol := range []bool{false, true} {
		name := "all_success"
		if failedSymbol {
			name = "failed_symbol"
		}
		t.Run(name, func(t *testing.T) {
			mabi, err := abi.JSON(strings.NewReader(multicallABI))
			if err != nil {
				t.Fatal(err)
			}
			eabi, err := abi.JSON(strings.NewReader(erc20ABI))
			if err != nil {
				t.Fatal(err)
			}
			type result struct {
				Success    bool
				ReturnData []byte
			}
			balance, err := eabi.Methods["balanceOf"].Outputs.Pack(big.NewInt(12345))
			if err != nil {
				t.Fatal(err)
			}
			symbol, err := eabi.Methods["symbol"].Outputs.Pack("MOCK")
			if err != nil {
				t.Fatal(err)
			}
			decimals, err := eabi.Methods["decimals"].Outputs.Pack(uint8(18))
			if err != nil {
				t.Fatal(err)
			}
			results := []result{{true, balance}, {!failedSymbol, symbol}, {true, decimals}}
			encoded, err := mabi.Methods["tryAggregate"].Outputs.Pack(results)
			if err != nil {
				t.Fatal(err)
			}
			requests := 0
			server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				requests++
				var request struct {
					ID     json.RawMessage
					Method string
					Params []json.RawMessage
				}
				if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
					t.Error(err)
					return
				}
				if request.Method != "eth_call" || len(request.Params) != 2 {
					t.Errorf("unexpected request: %+v", request)
					return
				}
				var call struct {
					To    string
					Input string
					Data  string
				}
				if err := json.Unmarshal(request.Params[0], &call); err != nil {
					t.Error(err)
					return
				}
				if !strings.EqualFold(call.To, MULTICALL_ADDR.Hex()) {
					t.Errorf("wrong target %s", call.To)
				}
				data := call.Input
				if data == "" {
					data = call.Data
				}
				raw, err := hex.DecodeString(strings.TrimPrefix(data, "0x"))
				if err != nil || len(raw) < 4 {
					t.Errorf("invalid calldata: %s", data)
					return
				}
				method := mabi.Methods["tryAggregate"]
				if !bytes.Equal(raw[:4], method.ID) {
					t.Error("wrong selector")
					return
				}
				args, err := method.Inputs.Unpack(raw[4:])
				if err != nil {
					t.Error(err)
					return
				}
				if args[0].(bool) {
					t.Error("requireSuccess must be false")
				}
				type Call struct {
					Target   common.Address
					CallData []byte
				}
				calls := *abi.ConvertType(args[1], new([]Call)).(*[]Call)
				if len(calls) != 3 {
					t.Errorf("got %d calls", len(calls))
					return
				}
				for i, methodName := range []string{"balanceOf", "symbol", "decimals"} {
					var expected []byte
					if i == 0 {
						expected, err = eabi.Pack(methodName, USER)
					} else {
						expected, err = eabi.Pack(methodName)
					}
					if err != nil {
						t.Error(err)
						return
					}
					if calls[i].Target != TOKEN_ADDR || !bytes.Equal(calls[i].CallData, expected) {
						t.Errorf("wrong call %d", i)
					}
				}
				if string(request.Params[1]) != "\"latest\"" {
					t.Errorf("block tag %s", request.Params[1])
				}
				w.Header().Set("Content-Type", "application/json")
				_ = json.NewEncoder(w).Encode(map[string]any{"jsonrpc": "2.0", "id": request.ID, "result": "0x" + hex.EncodeToString(encoded)})
			}))
			defer server.Close()
			oldRPC := RPC
			RPC = server.URL
			defer func() { RPC = oldRPC }()
			oldStdout := os.Stdout
			reader, writer, err := os.Pipe()
			if err != nil {
				t.Fatal(err)
			}
			defer reader.Close()
			defer func() { os.Stdout = oldStdout; writer.Close() }()
			os.Stdout = writer
			main()
			writer.Close()
			os.Stdout = oldStdout
			output, err := io.ReadAll(reader)
			if err != nil {
				t.Fatal(err)
			}
			want := "Symbol: MOCK, Decimals: 18"
			if failedSymbol {
				want = "Symbol: , Decimals: 18"
			}
			if !strings.Contains(string(output), want) || !strings.Contains(string(output), "12345") {
				t.Errorf("unexpected output %q", output)
			}
			if requests != 1 {
				t.Errorf("wanted one eth_call, got %d", requests)
			}
		})
	}
}

func TestMalformedReturnRejectedByABI(t *testing.T) {
	parsed, err := abi.JSON(strings.NewReader(multicallABI))
	if err != nil {
		t.Fatal(err)
	}
	if _, err := parsed.Unpack("tryAggregate", []byte{1, 2, 3}); err == nil {
		t.Fatal("truncated result accepted")
	}
}
