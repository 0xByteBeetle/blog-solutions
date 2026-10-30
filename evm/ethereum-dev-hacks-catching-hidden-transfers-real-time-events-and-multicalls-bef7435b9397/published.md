# Published examples

Source: https://andreyobruchkov1996.substack.com/p/ethereum-dev-hacks-catching-hidden-transfers-real-time-events-and-multicalls-bef7435b9397

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `a495df46e9b937256c956665661a4b327d792b2757cb47d4ed71d7f9d232230a`

````text
event Transfer(address indexed from, address indexed to, uint256 value);
````

## Block 2

SHA-256: `8a2a0e0fd2f65cbaaf05d1a9e54c7e8c8271fbbe67168d0bb49d87a3f947279d`

````text
curl -s -X POST https://polygon-amoy-bor-rpc.publicnode.com \
  -H "Content-Type: application/json" \
  --data '{
    "jsonrpc":"2.0",
    "method":"eth_getLogs",
    "params":[{
      "fromBlock":"0x182e86c",
      "toBlock":"0x182e86c",
      "address":"0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904",
      "topics":[
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000007f8b1ca29f95274e06367b60fc4a539e4910fd0c"
      ]
    }],
    "id":1
  }' | jq
````

## Block 3

SHA-256: `b40286efcfec89785511332fca197472c7ee0a84077b7d4c1145be22d263d539`

````text
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": [
    {
      "address": "0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904",
      "topics": [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000007f8b1ca29f95274e06367b60fc4a539e4910fd0c",
        "0x0000000000000000000000002a51ae0ad42dc7d2eb89462a7d41e79502bcf697"
      ],
      "data": "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000",
      "blockNumber": "0x182e86c",
      "transactionHash": "0x330e48c4c3adcc17b0819b7bf7344bb5010beee59551713231e977508ee1b236",
      "transactionIndex": "0x2",
      "blockHash": "0xb48487df956cb9fd6cc9750e2438b03c99d146910a2a1159850712c38ee85681",
      "logIndex": "0x3",
      "removed": false
    }
  ]
}
````

## Block 4

SHA-256: `7c237e6f673bf7282b5448271dc25d30b4e3cfd1e413a96429c9bc71b0a44aff`

````text
package main

import (
 "context"
 "fmt"
 "log"

 "github.com/ethereum/go-ethereum"
 "github.com/ethereum/go-ethereum/common"
 "github.com/ethereum/go-ethereum/core/types"
 "github.com/ethereum/go-ethereum/ethclient"
)

func main() {
 // Connect to Polygon Amoy WS endpoint
 client, err := ethclient.Dial("wss://polygon-amoy-bor-rpc.publicnode.com")
 if err != nil {
  log.Fatal(err)
 }
 defer client.Close()

 // Transfer event signature
 transferSig := common.HexToHash("0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef")

 // Filter: all Transfer events from this token
 query := ethereum.FilterQuery{
  Addresses: []common.Address{
   common.HexToAddress("0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904"), // LINK on Amoy
  },
  Topics: [][]common.Hash{
   {transferSig},
   {common.HexToHash("0x0000000000000000000000007f8b1ca29f95274e06367b60fc4a539e4910fd0c")}, // topic[1]: from
  },
 }

 logs := make(chan types.Log)

 // Subscribe to logs
 sub, err := client.SubscribeFilterLogs(context.Background(), query, logs)
 if err != nil {
  log.Fatal(err)
 }
 fmt.Println("Listening for Transfer events...")

 // Print events as they come in
 for {
  select {
  case err := <-sub.Err():
   log.Fatal(err)
  case vLog := <-logs:
   fmt.Printf("New Transfer log in block %d, tx %s\n", vLog.BlockNumber, vLog.TxHash.Hex())
   fmt.Println("Raw topics:", vLog.Topics)
   fmt.Println("Data:", vLog.Data)
  }
 }
}
````

## Block 5

SHA-256: `cf534f7f522e06557edae7034eeb0368867529f0fb71bdc5e2c221fcee5ec280`

````text
curl -s -X POST <YOUR-BLOCKCHAIN-NODE-URL>\
  -H "Content-Type: application/json" \
  --data '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"trace_replayTransaction",
    "params":[
      "<tx-hash>",
      ["trace"]
    ]
  }' \
| jq -r '.result.trace[]
| select(.action.value!="0x0")
| {type, from:.action.from, to:.action.to, value:.action.value}'
````

## Block 6

SHA-256: `b41ba0085eb4f7e4b9ec12ad3669e0eace27e3827735a25f7f23350b06de5568`

````text
{
  "type": "call",
  "from": "<addr1>",
  "to": "<addr2>",
  "value": "0x22e92f1cfbaaacd5d"
}
{
  "type": "call",
  "from": "<addr3>",
  "to": "<addr4>",
  "value": "0x22e92f1cfbaaacd5d"
}
````

## Block 7

SHA-256: `aa9871ecfa25e1114e293cd548b233bd66d2b99830ad8f7f7f613e39c60f3a5f`

````text
function collectEthTransfers(node):
  if node.value > 0:
    record(from=node.from, to=node.to, value=node.value, type=node.type)
  for child in node.calls:
    collectEthTransfers(child)
````

## Block 8

SHA-256: `e265068e5f9eb1d77e99177791067e9a826a1890f3374c4873bc83862cdf6ae2`

````text
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

const multicallABI = `[
  {
    "inputs":[
      {"internalType":"bool","name":"requireSuccess","type":"bool"},
      {
        "components":[
          {"internalType":"address","name":"target","type":"address"},
          {"internalType":"bytes","name":"callData","type":"bytes"}
        ],
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

const erc20ABI = `[
  {"name":"balanceOf","type":"function","stateMutability":"view","inputs":[{"name":"owner","type":"address"}],"outputs":[{"type":"uint256"}]},
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
````

## Block 9

SHA-256: `c859bf5826fc3a95a2baa7aceef4602a69483ed95fbf3f7effc258af34b0ea9f`

````text
Symbol: LINK, Decimals: 18
Balance(0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904): 38000000000000000000
````
