# Published examples

Source: https://andreyobruchkov1996.substack.com/p/streaming-on-chain-activity-in-real

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `d59085012cdcf35b35834f586c9120cb3d3447dd05499febb1b833b6cde2b04b`

````text
package main

import (
   “context”
   “fmt”
   “log”
   “github.com/ethereum/go-ethereum”
   “github.com/ethereum/go-ethereum/common”
   “github.com/ethereum/go-ethereum/core/types”
   “github.com/ethereum/go-ethereum/ethclient”
)

func main() {
   // Connect to Polygon Amoy WS endpoint
   client, err := ethclient.Dial(”wss://polygon-amoy-bor-rpc.publicnode.com”)
   if err != nil {
      log.Fatal(err)
   }

   defer client.Close()
   // Transfer event signature
   transferSig := common.HexToHash(”0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef”)
   // Filter: all Transfer events from this token
   query := ethereum.FilterQuery{
    Addresses: []common.Address{
       common.HexToAddress(”0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904”), // LINK on Amoy
    },
    Topics: [][]common.Hash{
       {transferSig},
       {common.HexToHash(”0x0000000000000000000000007f8b1ca29f95274e06367b60fc4a539e4910fd0c”)}, // topic[1]: from
    },
   }

   logs := make(chan types.Log)
   // Subscribe to logs
   sub, err := client.SubscribeFilterLogs(context.Background(), query, logs)
   if err != nil {
      log.Fatal(err)
   }

   fmt.Println(”Listening for Transfer events...”)
   // Print events as they come in
   for {
      select {
      case err := <-sub.Err():
         log.Fatal(err)
      case vLog := <-logs:
         fmt.Printf(”New Transfer log in block %d, tx %s\n”, vLog.BlockNumber, vLog.TxHash.Hex())
         fmt.Println(”Raw topics:”, vLog.Topics)
         fmt.Println(”Data:”, vLog.Data)
      }
   }
}
````
