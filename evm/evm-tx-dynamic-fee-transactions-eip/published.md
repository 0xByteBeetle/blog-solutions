# Published examples

Source: https://andreyobruchkov1996.substack.com/p/evm-tx-dynamic-fee-transactions-eip

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `b0f3f2f62172de7df04f4285a53ea59bd6fbf52140d55f3c4a89c820b09aba1f`

````text
0x02 || rlp([chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit, destination, amount, data, access_list, signature_y_parity, signature_r, signature_s])
````

## Block 2

SHA-256: `25efcd9f09c24a34b03cfab30e2de25d2a7b908e63b727fc3c0d20482e6753e8`

````text
{
  nonce:                “0x0”,         // Number of transactions made by the sender before this one.
  gasLimit:             “0x2710”,      // Maximum gas provided by the sender.
  maxPriorityFeePerGas: “0x0”,         // Maximum fee, in wei, the sender is willing to pay per gas above the base fee.
  maxFeePerGas:         “0x6f4d3132b”, // Maximum total fee (base fee + priority fee), in wei, the sender is willing to pay per gas.
  to:                   “0x...”,       // Address of the recipient. Not used in contract creation transactions.
  value:                “0x0”,         // Value transferred, in wei.
  data:                 “0x...”,       // Used for defining contract creation and interaction.
  yParity:              “0x1”          // Parity of the y-value of a secp256k1 signature.
  r:                    “0x...”,       // ECDSA signature r.
  s:                    “0x...”,       // ECDSA signature s.
  chainId:              “0x...”,       // Chain ID of the transaction.
  accessList:           [],            // List of addresses and storage keys the transaction plans to access.
}
````

## Block 3

SHA-256: `e1b2dc0b933ef173030e7c5e887c9432212d99e03c0a523f20e27d52a11e53e6`

````text
base fee + tip ≤ max fee
````

## Block 4

SHA-256: `779c2eb240ae8ee7df92778f74ae0681fe7e9307e5e7d33f977cfbef85ed22ae`

````text
curl -X POST https://polygon-amoy.drpc.org \
  -H “Content-Type: application/json” \
  -d ‘{
    “jsonrpc”:”2.0”,
    “method”:”eth_feeHistory”,
    “params”: [”0x05”, “latest”, []],
    “id”:1
  }’ | jq
````

## Block 5

SHA-256: `0056441c6b52e7d2274e49f6598f6099f0864d57b7201106de60cb11bff36395`

````text
{
  “id”: 1,
  “jsonrpc”: “2.0”,
  “result”: {
    “oldestBlock”: “0x46d5609”,
    “baseFeePerGas”: [”0x1205”,”0x11f3”,”0x1214”,”0x1233”,”0x121b”,”0x121d”],
    “gasUsedRatio”: [0.3687491333333333,0.7324738666666667,0.7207432,0.3332721777777778,0.5188374666666666],
    ....
  }
}
````

## Block 6

SHA-256: `a80513a53713f50c60ba6b49aa884e0a5e86dc18a3a0b40842ccd7fa68e24f9a`

````text
package main

const (
   // Public RPC URL for Polygon Amoy Testnet
   NodeRPCURL  = “https://polygon-amoy.drpc.org”
   AmoyChainID = 80002 // Polygon Amoy Testnet Chain ID
)

func main() {
   acc2Addr, acc2Priv := account.GetAccount(2)
   to := lo.ToPtr(common.HexToAddress(”0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904”))
   ctx := context.Background()

   client, err := ethclient.Dial(NodeRPCURL)
   if err != nil {
    log.Fatal(”Failed to connect to Ethereum node:”, err)
   }

   nonce, err := client.PendingNonceAt(ctx, lo.FromPtr(acc2Addr))
   if err != nil {
    log.Fatal(”Failed to fetch nonce:”, err)
   }

   feeHistory, err := client.FeeHistory(ctx, 5, nil, nil)
   if err != nil {
    log.Fatal(”Failed to fetch gas price:”, err)
   }

   GasTipCap, err := client.SuggestGasTipCap(ctx)
   if err != nil {
    log.Fatal(”Failed to fetch gas price:”, err)
   }

   // base fee from most recent block
   latestBaseFee := feeHistory.BaseFee[len(feeHistory.BaseFee)-1]
   // GasFeeCap = baseFee + tip
   // Add a 12% buffer to latest base fee to avoid underpricing
   // but you can also use the average or median from the fee history.
   bufferedBaseFee := new(big.Int).Mul(latestBaseFee, big.NewInt(112))
   bufferedBaseFee.Div(bufferedBaseFee, big.NewInt(100))
   // Final GasFeeCap = bufferedBaseFee + GasTipCap
   GasFeeCap := new(big.Int).Add(bufferedBaseFee, GasTipCap)
   chainID := big.NewInt(AmoyChainID) // Use your chain’s ID (80002 = Polygon Mumbai Testnet)
   gasLimit, err := client.EstimateGas(ctx, ethereum.CallMsg{
    From: *acc2Addr,
    To:   to,
    Data: common.FromHex(”0xa9059cbb0000000000000000000000008056361b1c1361436D61D187d761233b42d1c20e000000000000000000000000000000000000000000000000016345785D8A0000”),
   })
   if err != nil {
    log.Fatal(”Failed to fetch gas limit:”, err)
   }

   tx := types.DynamicFeeTx{
    ChainID:   chainID,
    Nonce:     nonce,
    GasTipCap: GasTipCap,
    GasFeeCap: GasFeeCap,
    Gas:       gasLimit,
    To:        to,
    Data:      common.FromHex(”0xa9059cbb0000000000000000000000008056361b1c1361436D61D187d761233b42d1c20e000000000000000000000000000000000000000000000000016345785D8A0000”),
   }
   // Convert it into a full types.Transaction object
   eip1559Tx := types.NewTx(&tx)
   signedTx, err := types.SignTx(eip1559Tx, types.LatestSignerForChainID(chainID), acc2Priv)
   if err != nil {
    log.Fatal(”Failed to sign transaction:”, err)
   }

   // Broadcast the transaction
   err = client.SendTransaction(ctx, signedTx)
   if err != nil {
    log.Fatal(”Broadcast failed:”, err)
   }

   fmt.Println(”Transaction sent!”)
   fmt.Println(”Tx hash:”, signedTx.Hash().Hex())
   // Optionally wait for inclusion
   time.Sleep(10 * time.Second)
   receipt, err := client.TransactionReceipt(ctx, signedTx.Hash())
   if err != nil {
    fmt.Println(”Tx not mined yet.”)
   } else {
    fmt.Println(”Tx mined in block:”, receipt.BlockNumber)
   }
}
````
