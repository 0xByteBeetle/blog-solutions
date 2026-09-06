package main

import (
   "context"
   "fmt"
   "log"
   "math/big"
   "strings"
   "github.com/ethereum/go-ethereum"
   "github.com/ethereum/go-ethereum/accounts/abi"
   "github.com/ethereum/go-ethereum/common"
   "github.com/ethereum/go-ethereum/ethclient"
)

const multicallABI = `[  {    "inputs":[      {"internalType":"bool","name":"requireSuccess","type":"bool"},      {        "components":[          {"internalType":"address","name":"target","type":"address"},          {"internalType":"bytes","name":"callData","type":"bytes"}        ],
        "internalType":"struct Call[]",
        "name":"calls",
        "type":"tuple[]"
      }
    ],
    "name":"tryAggregate",
    "outputs":[
      {
        "components":[
          {"internalType":"bool","name":"success","type":"bool"},
          {"internalType":"bytes","name":"returnData","type":"bytes"}
        ],
        "internalType":"struct Result[]",
        "name":"returnData",
        "type":"tuple[]"
      }
    ],
    "stateMutability":"nonpayable",
    "type":"function"
  }
]`

const erc20ABI = `[  {"name":"balanceOf","type":"function","stateMutability":"view","inputs":[{"name":"owner","type":"address"}],"outputs":[{"type":"uint256"}]},
  {"name":"symbol","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"string"}]},
  {"name":"decimals","type":"function","stateMutability":"view","inputs":[],"outputs":[{"type":"uint8"}]}
]`

var (
   RPC            = "https://polygon-amoy.drpc.org"
   MULTICALL_ADDR = common.HexToAddress("0xcA11bde05977b3631167028862bE2a173976CA11") // Multicall3
   TOKEN_ADDR     = common.HexToAddress("0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904") // LINK on Amoy
   USER           = common.HexToAddress("0x7F8b1ca29F95274E06367b60fC4a539E4910FD0c")
)

func main() {
   ctx := context.Background()
   client, err := ethclient.Dial(RPC)
   if err != nil {
      log.Fatalf("dial rpc: %v", err)
   }

   mabi, err := abi.JSON(strings.NewReader(multicallABI))
   if err != nil {
      log.Fatalf("parse multicall abi: %v", err)
   }
   eabi, err := abi.JSON(strings.NewReader(erc20ABI))
   if err != nil {
      log.Fatalf("parse erc20 abi: %v", err)
   }

   // Build calldata for ERC20 reads
   balData, err := eabi.Pack("balanceOf", USER)
   if err != nil {
      log.Fatalf("pack balanceOf: %v", err)
   }

   symData, err := eabi.Pack("symbol")
   if err != nil {
      log.Fatalf("pack symbol: %v", err)
   }

   decData, err := eabi.Pack("decimals")
   if err != nil {
      log.Fatalf("pack decimals: %v", err)
   }

   type Call struct {
    Target   common.Address
    CallData []byte
   }

   calls := []Call{
      {Target: TOKEN_ADDR, CallData: balData},
      {Target: TOKEN_ADDR, CallData: symData},
      {Target: TOKEN_ADDR, CallData: decData},
   }

   input, err := mabi.Pack("tryAggregate", false, calls)
   if err != nil {
      log.Fatalf("pack tryAggregate: %v", err)
   }

   // Single eth_call
   msg := ethereum.CallMsg{To: &MULTICALL_ADDR, Data: input}
   out, err := client.CallContract(ctx, msg, nil)
   if err != nil {
      log.Fatalf("CallContract (eth_call): %v", err)
   }

   // Decode results
   var results []struct {
      Success    bool
      ReturnData []byte
   }

   if err := mabi.UnpackIntoInterface(&results, "tryAggregate", out); err != nil {
      log.Fatalf("unpack tryAggregate: %v", err)
   }
   if len(results) != 3 {
      log.Fatalf("unexpected results len: %d", len(results))
   }

   var (
      balance  *big.Int
      symbol   string
      decimals uint8
   )

   // 0: balanceOf
   if results[0].Success {
      vals, err := eabi.Unpack("balanceOf", results[0].ReturnData)
      if err != nil {
       log.Fatalf("unpack balanceOf: %v", err)
      }
      balance = vals[0].(*big.Int)
   } else {
      log.Printf("balanceOf failed")
   }

   // 1: symbol
   if results[1].Success {
      vals, err := eabi.Unpack("symbol", results[1].ReturnData)
      if err != nil {
         log.Fatalf("unpack symbol: %v", err)
      }
      symbol = vals[0].(string)
   } else {
        log.Printf("symbol failed")
   }

   // 2: decimals
   if results[2].Success {
      vals, err := eabi.Unpack("decimals", results[2].ReturnData)
      if err != nil {
         log.Fatalf("unpack decimals: %v", err)
      }
      decimals = vals[0].(uint8)
   } else {
      log.Printf("decimals failed")
   }

   fmt.Printf("Symbol: %s, Decimals: %d\n", symbol, decimals)

   if balance != nil {
      fmt.Printf("Balance(%s): %s\n", TOKEN_ADDR.Hex(), balance.String())
   }
}
