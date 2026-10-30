# Published examples

Source: https://andreyobruchkov1996.substack.com/p/evm-tx-understanding-legacy-ethereum

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `196e7365b8062b188d1b11aad2189192ab698af4baa9c874080a27627bfd72b5`

````text
package account

const (
 projectMarker = “transaction-types”
 key1FilePath  = “account1.key”
 key2FilePath  = “account2.key”
)

// getPath returns the absolute path to the directory.
func getPath() string {
   // Get the path of the current file
   _, filename, _, _ := runtime.Caller(0)

   // Find index of your project root folder name
   idx := strings.Index(strings.ToLower(filename), strings.ToLower(projectMarker))

   if idx == -1 {
    panic(”project root folder not found in path”)
   }

   // Cut path up to the project root
   rootPath := filename[:idx+len(projectMarker)]

   // Append relative path to root
   return filepath.Join(rootPath, “account”)
}

// Generate new account if not exist, otherwise load saved account
func GetAccount(accNum int) (*common.Address, *ecdsa.PrivateKey) {
   var priv *ecdsa.PrivateKey

   path := getPath()
   var keyFilePath string
   switch accNum {
   case 1:
    keyFilePath = filepath.Join(path, key1FilePath)
   case 2:
    keyFilePath = filepath.Join(path, key2FilePath)
   default:
    log.Fatal(”Invalid account number. Use 1 or 2.”)
   }
  
   if _, err := os.Stat(keyFilePath); os.IsNotExist(err) {
    fmt.Println(”Key file not found. Generating new Ethereum key...”)

    priv, err = crypto.GenerateKey()
    if err != nil {
     log.Fatal(”Failed to generate key:”, err)
    }
    privBytes := crypto.FromECDSA(priv)

    err = os.WriteFile(keyFilePath, []byte(hex.EncodeToString(privBytes)), 0600)
    if err != nil {
     log.Fatal(”Failed to write key file:”, err)
    }

    fmt.Println(”New key saved to”, keyFilePath)
   } else {
    // Load existing key
    fmt.Println(”Loading existing key from”, keyFilePath)
    keyHex, err := os.ReadFile(keyFilePath)
    if err != nil {
     log.Fatal(”Failed to read key file:”, err)
    }

    privBytes, err := hex.DecodeString(string(keyHex))
    if err != nil {
     log.Fatal(”Invalid hex in key file:”, err)
    }

    priv, err = crypto.ToECDSA(privBytes)
    if err != nil {
     log.Fatal(”Invalid private key:”, err)
    }
   }
   // Print address and keys
   address := crypto.PubkeyToAddress(priv.PublicKey)
   pubBytes := crypto.FromECDSAPub(&priv.PublicKey)
   fmt.Println(”Address:    “, address.Hex())
   fmt.Println(”Public Key: “, hex.EncodeToString(pubBytes))
   fmt.Println(”Private Key:”, hex.EncodeToString(crypto.FromECDSA(priv)))
   return &address, priv
}
````

## Block 2

SHA-256: `52e6155bce80db38b8bb98cdedbdc3426406ef9bf7c1c33379a898307d4dbf7d`

````text
rlp([nonce, gasPrice, gasLimit, to, value, data, v, r, s])
````

## Block 3

SHA-256: `a3933209cb132c7e10b2da56bef60ed4d4c1a01dddcd3635efcc2810db6c9c40`

````text
{
  nonce:    “0x0”,            // Number of transactions made by the sender before this one.
  gasPrice: “0x01284a32b000”, // Gas price, in wei, provided by the sender.
  gasLimit: “0x21000”,         // Maximum gas provided by the sender.
  to:       “0x...”,          // Address of the recipient. Not used in contract creation transactions.
  value:    “0x0”,            // Value transferred, in wei.
  data:     “0x...”,          // Used for defining contract creation and interaction.
  v:        “0x1”,            // ECDSA recovery ID.
  r:        “0x...”,          // ECDSA signature r.
  s:        “0x...”,          // ECDSA signature s.
}
````

## Block 4

SHA-256: `515b3245dd2eac05cc344aefb3e1fc63074efc9566cc27e2f67f358ce69ac79f`

````text
package main

import (
 “context”
 “fmt”
 “log”
 “math/big”
 “time”
 “transactiontypes/account”
 “github.com/ethereum/go-ethereum/core/types”
 “github.com/ethereum/go-ethereum/ethclient”
 “github.com/samber/lo”
)

const (
   // Public RPC URL for Polygon Amoy Testnet
   NodeRPCURL  = “https://polygon-amoy.drpc.org”
   GasLimit    = 21000   // Standard gas limit for a simple ETH transfer
   AmoyChainID = 80002   // Polygon Amoy Testnet Chain ID
   ValueToSend = 0.01e18 // 0.01 ETH
)

func main() {
   acc1Addr, acc1Priv := account.GetAccount(1)
   acc2Addr, _ := account.GetAccount(2)
   ctx := context.Background()
   client, err := ethclient.Dial(NodeRPCURL)
   if err != nil {
    log.Fatal(”Failed to connect to Ethereum node:”, err)
   }
   nonce, err := client.PendingNonceAt(ctx, lo.FromPtr(acc1Addr))
   if err != nil {
    log.Fatal(”Failed to fetch nonce:”, err)
   }
   // Get suggested gas price
   gasPrice, err := client.SuggestGasPrice(ctx)
   if err != nil {
    log.Fatal(”Failed to fetch gas price:”, err)
   }
   // Create a types.LegacyTx
   tx := types.LegacyTx{
    Nonce:    nonce,
    GasPrice: gasPrice,
    Gas:      GasLimit,
    To:       acc2Addr, // Send to account 2
    Value:    big.NewInt(ValueToSend),
    Data:     []byte{},
   }
   // Convert it into a full types.Transaction object
   legacyTx := types.NewTx(&tx)

   chainID := big.NewInt(AmoyChainID) // Use your chain’s ID (80002 = Polygon Mumbai Testnet)
   // Note: Although this is a legacy transaction, we still need to sign it with the chain ID for EIP-155 compatibility.
   // Because most of the nodes protect against replay attacks by requiring the chain ID in the signature.
   // Nodes that not protect against this will be able to get signed transaction with:
   // types.SignTx(tx, types.HomesteadSigner{}, priv)
   signedTx, err := types.SignTx(legacyTx, types.NewEIP155Signer(chainID), acc1Priv)
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
