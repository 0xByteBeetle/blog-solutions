# Published examples

Source: https://andreyobruchkov1996.substack.com/p/evm-tx-access-list-transactions-eip

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `5195a92bddefb730c2891e6d4e4f4bf1c65e93afdc3afded64465a891d7d8c1d`

````text
0x01 || rlp([chainId, nonce, gasPrice, gasLimit, to, value, data, accessList, signatureYParity, signatureR, signatureS]).
````

## Block 2

SHA-256: `3714c69221874345bd158b17092e3fd9fda1671df1b32da9540ef4874708fb01`

````text
{
  nonce:    “0x0”,            // Number of transactions made by the sender before this one.
  gasPrice: “0x09184e72a000”, // Gas price, in wei, provided by the sender.
  gasLimit: “0x21000”,        // Maximum gas provided by the sender.
  to:       “0x...”,          // Address of the recipient. Not used in contract creation transactions.
  value:    “0x0”,            // Value transferred, in wei.
  data:     “0x...”,          // Used for defining contract creation and interaction.
  r:        “0x...”,          // ECDSA signature r.
  s:        “0x...”,          // ECDSA signature s.
  y_parity: “0x1”             // Parity of the y-value of a secp256k1 signature.
  chainId:  “0x...”,          // Chain ID of the transaction.
  accessList: [               // List of addresses and storage keys the transaction plans to access.
    {
      “address”: “0x...”,
      “storageKeys”: [”...”]
    }
  ],
}
````

## Block 3

SHA-256: `cae52656555796fd0ceece5fc4f01dddb101ec09d273ffa8dcb88a4ed5245a4b`

````text
curl https://polygon-amoy.drpc.org \
  -X POST \
  -H “Content-Type: application/json” \
  -d ‘{”method”: “eth_createAccessList”, “params”: [{”from”: “<your-sending-address>”,”gas”: “0x50000”, “gasPrice”: “0x6fee2d00”,”to”: “0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904”, “data”: “0xa9059cbb0000000000000000000000008056361b1c1361436D61D187d761233b42d1c20e0000000000000000000000000000000000000000000000000DE0B6B3A7640000”}, “pending”], “id”: 1, “jsonrpc”: “2.0”}’
````

## Block 4

SHA-256: `de88de5307aca9b37d33395694f382720d57895a195a0016b65015114218b135`

````text
{”id”:1,”jsonrpc”:”2.0”,”result”:{”accessList”:[{”address”:”0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904”,”storageKeys”:[”0xf9a42dc9f268c1720e130da18118febc65e0ca534e035a0e39d30cf8daea5f0a”,”0x0c2d31ae2b93233fa550fc5df04cd7b0b742c0821a2494f91cd79ca74a9e2e48”]}],”gasUsed”:”0xd1a4”}}
````

## Block 5

SHA-256: `8bf921ca57705d0cc46293b6756b24486810694111f231f6176e8b8a05e7ee09`

````text
forge inspect srv/Storage.sol:Storage storage
````

## Block 6

SHA-256: `941f1e4572897a0cc142a3c40fe30007f6b9499f40128582242ec073feeadd93`

````text
package main

const (
   NodeRPCURL  = “https://polygon-amoy.drpc.org”
   AmoyChainID = 80002   // Polygon Amoy Testnet Chain ID
   ValueToSend = 0.01e18 // 0.01 ETH
)

func main() {
   acc2Addr, acc2Priv := account.GetAccount(2)
   to := lo.ToPtr(common.HexToAddress(”0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904”))
   ctx := context.Background()

   client, err := ethclient.Dial(NodeRPCURL)
   if err != nil {
    log.Fatal(”Failed to connect to Ethereum node:”, err)
   }

   // Nonce
   nonce, err := client.PendingNonceAt(ctx, lo.FromPtr(acc2Addr))
   if err != nil {
    log.Fatal(”Failed to fetch nonce:”, err)
   }

   // Gas price
   gasPrice, err := client.SuggestGasPrice(ctx)
   if err != nil {
    log.Fatal(”Failed to fetch gas price:”, err)
   }

   accessList := types.AccessList{
    {
     Address:     common.Address(common.HexToAddress(”0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904”)),
     StorageKeys: []common.Hash{common.HexToHash(”0xf9a42dc9f268c1720e130da18118febc65e0ca534e035a0e39d30cf8daea5f0a”), common.HexToHash(”0x0c2d31ae2b93233fa550fc5df04cd7b0b742c0821a2494f91cd79ca74a9e2e48”)},
    },
   }

   gasLimit, err := client.EstimateGas(ctx, ethereum.CallMsg{
    From:       *acc2Addr,
    To:         to,
    Data:       common.FromHex(”0xa9059cbb0000000000000000000000008056361b1c1361436D61D187d761233b42d1c20e000000000000000000000000000000000000000000000000016345785D8A0000”),
    AccessList: accessList,
   })
   if err != nil {
    log.Fatal(”Failed to fetch gas limit:”, err)
   }

   chainID := big.NewInt(AmoyChainID) // Use your chain’s ID (80002 = Polygon Mumbai Testnet)
   // Construct AccessListTx
   txData := types.AccessListTx{
    ChainID:    chainID,
    Nonce:      nonce,
    GasPrice:   gasPrice,
    Gas:        gasLimit,
    To:         to,
    Data:       common.FromHex(”0xa9059cbb0000000000000000000000008056361b1c1361436D61D187d761233b42d1c20e000000000000000000000000000000000000000000000000016345785D8A0000”),
    AccessList: accessList,
   }
   tx := types.NewTx(&txData)
   // Sign it
   signedTx, err := types.SignTx(tx, types.NewEIP2930Signer(chainID), acc2Priv)
   if err != nil {
    log.Fatal(”Failed to sign tx:”, err)
   }

   // Broadcast
   err = client.SendTransaction(ctx, signedTx)
   if err != nil {
    log.Fatal(”Broadcast failed:”, err)
   }

   fmt.Println(”Access List Transaction Sent!”)
   fmt.Println(”Tx hash:”, signedTx.Hash().Hex())
   // Optionally wait for mining
   time.Sleep(10 * time.Second)
   receipt, err := client.TransactionReceipt(ctx, signedTx.Hash())
   if err != nil {
    fmt.Println(”Tx not mined yet.”)
   } else {
    fmt.Println(”Mined in block:”, receipt.BlockNumber)
   }
}
````
