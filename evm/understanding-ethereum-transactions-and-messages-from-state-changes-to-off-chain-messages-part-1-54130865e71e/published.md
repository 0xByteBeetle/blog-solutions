# Published examples

Source: https://andreyobruchkov1996.substack.com/p/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-1-54130865e71e

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `3a9853407da9144002b3cbbcfe045c47cf504a03eb8be42e3a84d38622ade386`

````text
func RlpEncode(input any) []byte {
 switch v := input.(type) {
 case string:
  data := []byte(v)
  if len(data) == 1 && data[0] < 0x80 {
   return data
  }
  return append(encodeLength(len(data), 0x80), data...)

 case []byte:
  if len(v) == 1 && v[0] < 0x80 {
   return v
  }
  return append(encodeLength(len(v), 0x80), v...)

 default:
  // Handle slices of any type (e.g., []string, []int, []any)
  reflectedValue := reflect.ValueOf(input)
  kind := reflectedValue.Kind()

  if reflectedValue.Kind() == reflect.Slice {
   var output []byte
   for i := 0; i < reflectedValue.Len(); i++ {
    item := reflectedValue.Index(i).Interface()
    output = append(output, RlpEncode(item)...)
   }
   return append(encodeLength(len(output), 0xc0), output...)
  }

  // Handle all integer kinds (signed and unsigned)
  if isIntegerKind(kind) {
   n := toInt(reflectedValue)
   if n == 0 {
    return []byte{0x80}
   }
   return encodeInteger(n)
  }

  panic(fmt.Sprintf("unsupported type: %T", input))
 }
}

func encodeLength(length int, offset int) []byte {
 if length < 56 {
  return []byte{byte(length + offset)}
 }

 l := big.NewInt(int64(length))
 limit := new(big.Int).Lsh(big.NewInt(1), 64) // 2^64
 // len more than 2^64 are not allowed
 if l.Cmp(limit) >= 0 {
  panic("input too long")
 }

 bl := toBinary(length)
 return append([]byte{byte(len(bl) + offset + 55)}, bl...)
}

func toBinary(x int) []byte {
 if x == 0 {
  return []byte{}
 }
 var buf bytes.Buffer
 for x > 0 {
  buf.WriteByte(byte(x & 0xff))
  x >>= 8
 }
 // Reverse to make big-endian
 b := buf.Bytes()
 for i, j := 0, len(b)-1; i < j; i, j = i+1, j-1 {
  b[i], b[j] = b[j], b[i]
 }
 return b
}

func encodeInteger(n int) []byte {
 if n < 0 {
  panic("RLP only supports unsigned integers")
 }
 buf := toBinary(n)
 if len(buf) == 1 && buf[0] < 0x80 {
  return buf
 }
 return append(encodeLength(len(buf), 0x80), buf...)
}

func isIntegerKind(kind reflect.Kind) bool {
 switch kind {
 case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64,
  reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
  return true
 default:
  return false
 }
}

func toInt(v reflect.Value) int {
 // Convert to int (you can use int64 if you want bigger range)
 switch v.Kind() {
 case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
  return int(v.Int())
 case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
  return int(v.Uint())
 default:
  panic("not an integer kind")
 }
}
````

## Block 2

SHA-256: `2019b8c1b2cc9a0dfa29b266b33450bde819a46dcd4c3b249b915673dcd6fab6`

````text
// RlpDecode decodes an RLP-encoded byte slice into a Go value.
// It returns either a []byte or a []any representing a list.
func RlpDecode(input []byte) (interface{}, error) {
 val, _, err := decodeItem(input)
 return val, err
}

// decodeItem handles a single RLP value, which could be:
// - a single byte
// - a string (short or long)
// - a list (short or long)
func decodeItem(data []byte) (any, int, error) {
 if len(data) == 0 {
  return nil, 0, errors.New("empty input")
 }

 prefix := data[0]

 switch {
 // Case 1: single byte (0x00 to 0x7f) — value is the byte itself
 case prefix <= 0x7f:
  return data[:1], 1, nil

 // Case 2: short string (0x80 to 0xb7)
 // The first byte = 0x80 + length of the string
 case prefix <= 0xb7:
  strLen := int(prefix - 0x80)
  if len(data) < 1+strLen {
   return nil, 0, errors.New("short string too short")
  }
  return data[1 : 1+strLen], 1 + strLen, nil

 // Case 3: long string (0xb8 to 0xbf)
 // The first byte = 0xb7 + length of length (lenOfLen)
 // Next lenOfLen bytes = actual length of the string
 case prefix <= 0xbf:
  lenOfLen := int(prefix - 0xb7)
  if len(data) < 1+lenOfLen {
   return nil, 0, errors.New("long string length prefix too short")
  }
  strLen := decodeLength(data[1 : 1+lenOfLen])
  if len(data) < 1+lenOfLen+strLen {
   return nil, 0, errors.New("long string too short")
  }
  return data[1+lenOfLen : 1+lenOfLen+strLen], 1 + lenOfLen + strLen, nil

 // Case 4: short list (0xc0 to 0xf7)
 // First byte = 0xc0 + total payload length of encoded items
 case prefix <= 0xf7:
  listLen := int(prefix - 0xc0)
  if len(data) < 1+listLen {
   return nil, 0, errors.New("short list too short")
  }
  items, err := decodeList(data[1 : 1+listLen])
  return items, 1 + listLen, err

 // Case 5: long list (0xf8 to 0xff)
 // First byte = 0xf7 + length of length (lenOfLen)
 // Next lenOfLen bytes = actual length of list payload
 default:
  lenOfLen := int(prefix - 0xf7)
  if len(data) < 1+lenOfLen {
   return nil, 0, errors.New("long list length prefix too short")
  }
  listLen := decodeLength(data[1 : 1+lenOfLen])
  if len(data) < 1+lenOfLen+listLen {
   return nil, 0, errors.New("long list too short")
  }
  items, err := decodeList(data[1+lenOfLen : 1+lenOfLen+listLen])
  return items, 1 + lenOfLen + listLen, err
 }
}

// decodeList walks through a byte slice that represents a list payload,
// recursively decoding each RLP item in the list.
func decodeList(data []byte) ([]any, error) {
 // Should return an empty slice instead of nil
 if len(data) == 0 {
  return []any{}, nil // Return empty slice instead of nil
 }

 var result []any
 for len(data) > 0 {
  val, consumed, err := decodeItem(data)
  if err != nil {
   return nil, err
  }
  result = append(result, val)
  data = data[consumed:]
 }
 return result, nil
}

// decodeLength interprets a big-endian byte slice as an integer length.
// This is used for long strings/lists where the length is itself encoded.
func decodeLength(b []byte) int {
 n := 0
 for _, by := range b {
  // Shift left and add next byte (big-endian)
  n = (n << 8) + int(by)
 }
 return n
}
````

## Block 3

SHA-256: `b16912214b3dc7b0127a4aee4206d2ddf1ffface8ba3375fc7e6cb8fd1f20a86`

````text
package account

const (
 projectMarker = "transaction-types"
 key1FilePath  = "account1.key"
 key2FilePath  = "account2.key"
)

// getPath returns the absolute path to the directory.
func getPath() string {
 // Get the path of the current file
 _, filename, _, _ := runtime.Caller(0)

 // Find index of your project root folder name
 idx := strings.Index(strings.ToLower(filename), strings.ToLower(projectMarker))
 if idx == -1 {
  panic("project root folder not found in path")
 }

 // Cut path up to the project root
 rootPath := filename[:idx+len(projectMarker)]

 // Append relative path to root
 return filepath.Join(rootPath, "account")
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
  log.Fatal("Invalid account number. Use 1 or 2.")
 }

 if _, err := os.Stat(keyFilePath); os.IsNotExist(err) {
  fmt.Println("Key file not found. Generating new Ethereum key...")
  priv, err = crypto.GenerateKey()
  if err != nil {
   log.Fatal("Failed to generate key:", err)
  }

  privBytes := crypto.FromECDSA(priv)
  err = os.WriteFile(keyFilePath, []byte(hex.EncodeToString(privBytes)), 0600)
  if err != nil {
   log.Fatal("Failed to write key file:", err)
  }

  fmt.Println("New key saved to", keyFilePath)
 } else {
  // Load existing key
  fmt.Println("Loading existing key from", keyFilePath)
  keyHex, err := os.ReadFile(keyFilePath)
  if err != nil {
   log.Fatal("Failed to read key file:", err)
  }

  privBytes, err := hex.DecodeString(string(keyHex))
  if err != nil {
   log.Fatal("Invalid hex in key file:", err)
  }

  priv, err = crypto.ToECDSA(privBytes)
  if err != nil {
   log.Fatal("Invalid private key:", err)
  }
 }

 // Print address and keys
 address := crypto.PubkeyToAddress(priv.PublicKey)
 pubBytes := crypto.FromECDSAPub(&priv.PublicKey)

 fmt.Println("Address:    ", address.Hex())
 fmt.Println("Public Key: ", hex.EncodeToString(pubBytes))
 fmt.Println("Private Key:", hex.EncodeToString(crypto.FromECDSA(priv)))

 return &address, priv
}
````

## Block 4

SHA-256: `52e6155bce80db38b8bb98cdedbdc3426406ef9bf7c1c33379a898307d4dbf7d`

````text
rlp([nonce, gasPrice, gasLimit, to, value, data, v, r, s])
````

## Block 5

SHA-256: `b6d0f05a7d197829b1ac41cc746d71cfca1e7ee9573daadfac5f35eec1c06c1e`

````text
{
  nonce:    "0x0",            // Number of transactions made by the sender before this one.
  gasPrice: "0x01284a32b000", // Gas price, in wei, provided by the sender.
  gasLimit: "0x21000",         // Maximum gas provided by the sender.
  to:       "0x...",          // Address of the recipient. Not used in contract creation transactions.
  value:    "0x0",            // Value transferred, in wei.
  data:     "0x...",          // Used for defining contract creation and interaction.
  v:        "0x1",            // ECDSA recovery ID.
  r:        "0x...",          // ECDSA signature r.
  s:        "0x...",          // ECDSA signature s.
}
````

## Block 6

SHA-256: `dbc3880e2b34688a53450de5a3967d77bc2c285325754a7891b62cf720cf8bbd`

````text
package main

import (
 "context"
 "fmt"
 "log"
 "math/big"
 "time"
 "transactiontypes/account"

 "github.com/ethereum/go-ethereum/core/types"
 "github.com/ethereum/go-ethereum/ethclient"
 "github.com/samber/lo"
)

const (
 // Public RPC URL for Polygon Amoy Testnet
 NodeRPCURL  = "https://polygon-amoy.drpc.org"
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
  log.Fatal("Failed to connect to Ethereum node:", err)
 }

 nonce, err := client.PendingNonceAt(ctx, lo.FromPtr(acc1Addr))
 if err != nil {
  log.Fatal("Failed to fetch nonce:", err)
 }

 // Get suggested gas price
 gasPrice, err := client.SuggestGasPrice(ctx)
 if err != nil {
  log.Fatal("Failed to fetch gas price:", err)
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

 chainID := big.NewInt(AmoyChainID) // Use your chain's ID (80002 = Polygon Mumbai Testnet)
 // Note: Although this is a legacy transaction, we still need to sign it with the chain ID for EIP-155 compatibility.
 // Because most of the nodes protect against replay attacks by requiring the chain ID in the signature.
 // Nodes that not protect against this will be able to get signed transaction with:
 // types.SignTx(tx, types.HomesteadSigner{}, priv)
 signedTx, err := types.SignTx(legacyTx, types.NewEIP155Signer(chainID), acc1Priv)
 if err != nil {
  log.Fatal("Failed to sign transaction:", err)
 }

 // Broadcast the transaction
 err = client.SendTransaction(ctx, signedTx)
 if err != nil {
  log.Fatal("Broadcast failed:", err)
 }

 fmt.Println("Transaction sent!")
 fmt.Println("Tx hash:", signedTx.Hash().Hex())

 // Optionally wait for inclusion
 time.Sleep(10 * time.Second)
 receipt, err := client.TransactionReceipt(ctx, signedTx.Hash())
 if err != nil {
  fmt.Println("Tx not mined yet.")
 } else {
  fmt.Println("Tx mined in block:", receipt.BlockNumber)
 }
}
````

## Block 7

SHA-256: `5195a92bddefb730c2891e6d4e4f4bf1c65e93afdc3afded64465a891d7d8c1d`

````text
0x01 || rlp([chainId, nonce, gasPrice, gasLimit, to, value, data, accessList, signatureYParity, signatureR, signatureS]).
````

## Block 8

SHA-256: `73a04bf7cc3adbf0c34b4fd7a287cd6d10e2f4a641742c66d0d0bf191879aece`

````text
{
  nonce:    "0x0",            // Number of transactions made by the sender before this one.
  gasPrice: "0x09184e72a000", // Gas price, in wei, provided by the sender.
  gasLimit: "0x21000",        // Maximum gas provided by the sender.
  to:       "0x...",          // Address of the recipient. Not used in contract creation transactions.
  value:    "0x0",            // Value transferred, in wei.
  data:     "0x...",          // Used for defining contract creation and interaction.
  r:        "0x...",          // ECDSA signature r.
  s:        "0x...",          // ECDSA signature s.
  y_parity: "0x1"             // Parity of the y-value of a secp256k1 signature.
  chainId:  "0x...",          // Chain ID of the transaction.
  accessList: [               // List of addresses and storage keys the transaction plans to access.
    {
      "address": "0x...",
      "storageKeys": ["..."]
    }
  ],
}
````

## Block 9

SHA-256: `695629eada6160d4e61fb834823bb75fea11ac37460c2f50338501cc58aa5bd6`

````text
curl https://polygon-amoy.drpc.org \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"method": "eth_createAccessList", "params": [{"from": "<your-sending-address>","gas": "0x50000", "gasPrice": "0x6fee2d00","to": "0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904", "data": "0xa9059cbb0000000000000000000000008056361b1c1361436D61D187d761233b42d1c20e0000000000000000000000000000000000000000000000000DE0B6B3A7640000"}, "pending"], "id": 1, "jsonrpc": "2.0"}' 
````

## Block 10

SHA-256: `040ae8446b2b3be3ee8aa25ac5b60d15868134d2f8ce784903d83fbdbb207270`

````text
{"id":1,"jsonrpc":"2.0","result":{"accessList":[{"address":"0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904","storageKeys":["0xf9a42dc9f268c1720e130da18118febc65e0ca534e035a0e39d30cf8daea5f0a","0x0c2d31ae2b93233fa550fc5df04cd7b0b742c0821a2494f91cd79ca74a9e2e48"]}],"gasUsed":"0xd1a4"}}
````

## Block 11

SHA-256: `8bf921ca57705d0cc46293b6756b24486810694111f231f6176e8b8a05e7ee09`

````text
forge inspect srv/Storage.sol:Storage storage
````

## Block 12

SHA-256: `9c93ff50788a489a94f8360d9341df2ccce91d785c4949602bfe921e08c80d73`

````text
package main

const (
 NodeRPCURL  = "https://polygon-amoy.drpc.org"
 AmoyChainID = 80002   // Polygon Amoy Testnet Chain ID
 ValueToSend = 0.01e18 // 0.01 ETH
)

func main() {
 acc2Addr, acc2Priv := account.GetAccount(2)
 to := lo.ToPtr(common.HexToAddress("0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904"))

 ctx := context.Background()
 client, err := ethclient.Dial(NodeRPCURL)
 if err != nil {
  log.Fatal("Failed to connect to Ethereum node:", err)
 }

 // Nonce
 nonce, err := client.PendingNonceAt(ctx, lo.FromPtr(acc2Addr))
 if err != nil {
  log.Fatal("Failed to fetch nonce:", err)
 }

 // Gas price
 gasPrice, err := client.SuggestGasPrice(ctx)
 if err != nil {
  log.Fatal("Failed to fetch gas price:", err)
 }

 accessList := types.AccessList{
  {
   Address:     common.Address(common.HexToAddress("0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904")),
   StorageKeys: []common.Hash{common.HexToHash("0xf9a42dc9f268c1720e130da18118febc65e0ca534e035a0e39d30cf8daea5f0a"), common.HexToHash("0x0c2d31ae2b93233fa550fc5df04cd7b0b742c0821a2494f91cd79ca74a9e2e48")},
  },
 }

 gasLimit, err := client.EstimateGas(ctx, ethereum.CallMsg{
  From:       *acc2Addr,
  To:         to,
  Data:       common.FromHex("0xa9059cbb0000000000000000000000008056361b1c1361436D61D187d761233b42d1c20e000000000000000000000000000000000000000000000000016345785D8A0000"),
  AccessList: accessList,
 })
 if err != nil {
  log.Fatal("Failed to fetch gas limit:", err)
 }

 chainID := big.NewInt(AmoyChainID) // Use your chain's ID (80002 = Polygon Mumbai Testnet)

 // Construct AccessListTx
 txData := types.AccessListTx{
  ChainID:    chainID,
  Nonce:      nonce,
  GasPrice:   gasPrice,
  Gas:        gasLimit,
  To:         to,
  Data:       common.FromHex("0xa9059cbb0000000000000000000000008056361b1c1361436D61D187d761233b42d1c20e000000000000000000000000000000000000000000000000016345785D8A0000"),
  AccessList: accessList,
 }
 tx := types.NewTx(&txData)

 // Sign it
 signedTx, err := types.SignTx(tx, types.NewEIP2930Signer(chainID), acc2Priv)
 if err != nil {
  log.Fatal("Failed to sign tx:", err)
 }

 // Broadcast
 err = client.SendTransaction(ctx, signedTx)
 if err != nil {
  log.Fatal("Broadcast failed:", err)
 }

 fmt.Println("Access List Transaction Sent!")
 fmt.Println("Tx hash:", signedTx.Hash().Hex())

 // Optionally wait for mining
 time.Sleep(10 * time.Second)
 receipt, err := client.TransactionReceipt(ctx, signedTx.Hash())
 if err != nil {
  fmt.Println("Tx not mined yet.")
 } else {
  fmt.Println("Mined in block:", receipt.BlockNumber)
 }
}
````

## Block 13

SHA-256: `b0f3f2f62172de7df04f4285a53ea59bd6fbf52140d55f3c4a89c820b09aba1f`

````text
0x02 || rlp([chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit, destination, amount, data, access_list, signature_y_parity, signature_r, signature_s])
````

## Block 14

SHA-256: `4f672015de9e625d4a4e9cfd6a006c9466a7c802a23f535853a892d0c4146d3e`

````text
{
  nonce:                "0x0",         // Number of transactions made by the sender before this one.
  gasLimit:             "0x2710",      // Maximum gas provided by the sender.
  maxPriorityFeePerGas: "0x0",         // Maximum fee, in wei, the sender is willing to pay per gas above the base fee.
  maxFeePerGas:         "0x6f4d3132b", // Maximum total fee (base fee + priority fee), in wei, the sender is willing to pay per gas.
  to:                   "0x...",       // Address of the recipient. Not used in contract creation transactions.
  value:                "0x0",         // Value transferred, in wei.
  data:                 "0x...",       // Used for defining contract creation and interaction.
  yParity:              "0x1"          // Parity of the y-value of a secp256k1 signature.
  r:                    "0x...",       // ECDSA signature r.
  s:                    "0x...",       // ECDSA signature s.
  chainId:              "0x...",       // Chain ID of the transaction.
  accessList:           [],            // List of addresses and storage keys the transaction plans to access.
}
````

## Block 15

SHA-256: `e1b2dc0b933ef173030e7c5e887c9432212d99e03c0a523f20e27d52a11e53e6`

````text
base fee + tip ≤ max fee
````

## Block 16

SHA-256: `73a0dd9d5823b6357c3d1a52ac7f95276fb1c146ccc34791de55bae9f4b3ca3c`

````text
curl -X POST https://polygon-amoy.drpc.org \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_feeHistory",
    "params": ["0x05", "latest", []],
    "id":1
  }' | jq
````

## Block 17

SHA-256: `ec8ec943bc6131b7283a85f31cad0656c4e4539d4afedd5109c9db1bd5a2bbf9`

````text
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "oldestBlock": "0x46d5609",
    "baseFeePerGas": ["0x1205","0x11f3","0x1214","0x1233","0x121b","0x121d"],
    "gasUsedRatio": [0.3687491333333333,0.7324738666666667,0.7207432,0.3332721777777778,0.5188374666666666],
    ....
  }
}
````

## Block 18

SHA-256: `5f93fc84daccb5c86821e784ce44c3e076b4579091af037769cd474794abd9fc`

````text
package main

const (
 // Public RPC URL for Polygon Amoy Testnet
 NodeRPCURL  = "https://polygon-amoy.drpc.org"
 AmoyChainID = 80002 // Polygon Amoy Testnet Chain ID
)

func main() {
 acc2Addr, acc2Priv := account.GetAccount(2)
 to := lo.ToPtr(common.HexToAddress("0x0fd9e8d3af1aaee056eb9e802c3a762a667b1904"))

 ctx := context.Background()
 client, err := ethclient.Dial(NodeRPCURL)
 if err != nil {
  log.Fatal("Failed to connect to Ethereum node:", err)
 }

 nonce, err := client.PendingNonceAt(ctx, lo.FromPtr(acc2Addr))
 if err != nil {
  log.Fatal("Failed to fetch nonce:", err)
 }

 feeHistory, err := client.FeeHistory(ctx, 5, nil, nil)
 if err != nil {
  log.Fatal("Failed to fetch gas price:", err)
 }

 GasTipCap, err := client.SuggestGasTipCap(ctx)
 if err != nil {
  log.Fatal("Failed to fetch gas price:", err)
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

 chainID := big.NewInt(AmoyChainID) // Use your chain's ID (80002 = Polygon Mumbai Testnet)

 gasLimit, err := client.EstimateGas(ctx, ethereum.CallMsg{
  From: *acc2Addr,
  To:   to,
  Data: common.FromHex("0xa9059cbb0000000000000000000000008056361b1c1361436D61D187d761233b42d1c20e000000000000000000000000000000000000000000000000016345785D8A0000"),
 })
 if err != nil {
  log.Fatal("Failed to fetch gas limit:", err)
 }

 tx := types.DynamicFeeTx{
  ChainID:   chainID,
  Nonce:     nonce,
  GasTipCap: GasTipCap,
  GasFeeCap: GasFeeCap,
  Gas:       gasLimit,
  To:        to,
  Data:      common.FromHex("0xa9059cbb0000000000000000000000008056361b1c1361436D61D187d761233b42d1c20e000000000000000000000000000000000000000000000000016345785D8A0000"),
 }

 // Convert it into a full types.Transaction object
 eip1559Tx := types.NewTx(&tx)

 signedTx, err := types.SignTx(eip1559Tx, types.LatestSignerForChainID(chainID), acc2Priv)
 if err != nil {
  log.Fatal("Failed to sign transaction:", err)
 }

 // Broadcast the transaction
 err = client.SendTransaction(ctx, signedTx)
 if err != nil {
  log.Fatal("Broadcast failed:", err)
 }

 fmt.Println("Transaction sent!")
 fmt.Println("Tx hash:", signedTx.Hash().Hex())

 // Optionally wait for inclusion
 time.Sleep(10 * time.Second)
 receipt, err := client.TransactionReceipt(ctx, signedTx.Hash())
 if err != nil {
  fmt.Println("Tx not mined yet.")
 } else {
  fmt.Println("Tx mined in block:", receipt.BlockNumber)
 }
}
````

## Block 19

SHA-256: `916a6d64b4b7fc643b74fe0697203f28fe9043b51c4586b3616fdf9bc641731a`

````text
"\x19" || version || data
````

## Block 20

SHA-256: `3bf5f5862f193475e81c6d54ab4fa9071c95d4ee58d5f386f0415eae29ca2b77`

````text
0x19 <0x45 (E)> <thereum Signed Message:\n" + len(message)> <data to sign>
````

## Block 21

SHA-256: `cdbe40c4e7536c4774398f910ab6f8a2acc3480fc3c76f6ffdea580013eb1bd4`

````text
"\x19Ethereum Signed Message:\n5hello"
````

## Block 22

SHA-256: `d71bf6f71ab8fcdb0f00dbced675a84d7a0e05191e2cc1f502c72e75b117b2fd`

````text
hash = keccak256("\x19Ethereum Signed Message:\n" + len(message) + message)
````

## Block 23

SHA-256: `6821d3e70d793d89db7cec58e1c19e34abcd5c8f50a72de205f5fc608df77a98`

````text
package main

func main() {
 _, acc2Priv := account.GetAccount(2)

 message := []byte("Login to app.xyz")
 prefixed := fmt.Sprintf("\x19Ethereum Signed Message:\n%d%s", len(message), message)

 hash := crypto.Keccak256Hash([]byte(prefixed))

 // Sign the hash
 signature, err := crypto.Sign(hash.Bytes(), acc2Priv)
 if err != nil {
  log.Fatal(err)
 }

 fmt.Printf("Message: %s\n", message)
 fmt.Printf("Prefixed Hash: 0x%x\n", hash.Bytes())
 fmt.Printf("Signature: 0x%x\n", signature)

 // Recover the public key
 pubKey, err := crypto.SigToPub(hash.Bytes(), signature)
 if err != nil {
  log.Fatal(err)
 }

 recoveredAddr := crypto.PubkeyToAddress(*pubKey)
 fmt.Printf("Recovered Address: %s\n", recoveredAddr.Hex())
}
````

## Block 24

SHA-256: `ebf1460db49c96f101d128414cd02ec459028df0d99e9fcb0912b4afb21350d6`

````text
Message: Login to app.xyz
Prefixed Hash: 0x9ebab044560303562376f745e565c97c0995cba432397d082cf3260c5e1d6f78
Signature: 0xe89fe57d906e3fa29381c074462c823ecef612485f83cc34ecb6bb511a3da7cf6d82fc7ec21416f1542957e19e154ef00a9bcdd13510af2e911b6e3a6ea3fdd600
Recovered Address: 0xCBAf22b5fA52647af668bb1E895Bb8458028cDE6
````
