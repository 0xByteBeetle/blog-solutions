# Published examples

Source: https://andreyobruchkov1996.substack.com/p/evm-tx-blob-transactions-eip-4844

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `071486f5932868cdd43d88dadda160f8aa3e3c3abc39c44be4e3cb08c0eb6796`

````text
0x03 || rlp(chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit, to, value, data, access_list, max_fee_per_blob_gas, blob_versioned_hashes, y_parity, r, s]).
````

## Block 2

SHA-256: `02dd9a1692252f20fffa5fa7e26858b9f3b5f87e2749477b3e4317232af3977b`

````text
package main

// mined Tx:
// https://sepolia.etherscan.io/tx/0xfd044e8bccdba170a8afd3ec9248cb97fb4ebce49adbe392c47385c23ea82c3b
const (
   // Public RPC URL for Sepolia Testnet (confirm Dencun support)
   NodeRPCURL     = “https://eth-sepolia.public.blastapi.io” // Or a Dencun-enabled testnet like Sepolia
   SepoliaChainID = 11155111                                 // Sepolia Testnet Chain ID
   // Make sure you have this file in the specified path!
   // File is available here: https://github.com/ethereum/c-kzg-4844/blob/main/src/trusted_setup.txt
   TrustedSetupFilePath = “./trusted_setup.txt”
)

func main() {
   // --- KZG Trusted Setup Initialization (CRITICAL FOR BLOB TXS) ---
   fmt.Println(”Loading KZG trusted setup using c-kzg-4844 bindings...”)
   // LoadTrustedSetupFile returns an error. It internally sets up the KZG settings
   // which the go-ethereum/crypto/kzg4844 package then uses.
   // The ‘0’ argument is for ‘precompute’, typically 0 for default.
   err := kzgBindings.LoadTrustedSetupFile(TrustedSetupFilePath, 0)
   if err != nil {
    log.Fatalf(”Failed to load KZG trusted setup from %s: %v”, TrustedSetupFilePath, err)
   }

   fmt.Println(”KZG trusted setup loaded successfully.”)
   // --- End KZG Trusted Setup Initialization ---
   acc2Addr, acc2Priv := account.GetAccount(2)
   to := lo.ToPtr(common.HexToAddress(”0x7F8b1ca29F95274E06367b60fC4a539E4910FD0c”))
   ctx := context.Background()

   client, err := ethclient.Dial(NodeRPCURL)
   if err != nil {
    log.Fatal(”Failed to connect to Ethereum node:”, err)
   }

   nonce, err := client.PendingNonceAt(ctx, lo.FromPtr(acc2Addr))
   if err != nil {
    log.Fatal(”Failed to fetch nonce:”, err)
   }

   // EIP-1559 gas parameters (MaxPriorityFeePerGas and MaxFeePerGas)
   gasTipCap, err := client.SuggestGasTipCap(ctx)
   if err != nil {
    log.Fatal(”Failed to fetch gas tip cap:”, err)
   }

   feeHistory, err := client.FeeHistory(ctx, 5, nil, nil) // 5 blocks, last block is nil for current
   if err != nil {
    log.Fatal(”Failed to fetch fee history:”, err)
   }

   // base fee from most recent block
   latestBaseFee := feeHistory.BaseFee[len(feeHistory.BaseFee)-1]
   bufferedBaseFee := new(big.Int).Mul(latestBaseFee, big.NewInt(112))
   bufferedBaseFee.Div(bufferedBaseFee, big.NewInt(100))
   gasFeeCap := new(big.Int).Add(bufferedBaseFee, gasTipCap)
   chainID := big.NewInt(SepoliaChainID)
   // --- EIP-4844 Specifics ---
   var blobData kzg4844.Blob
   content := []byte(”Hello, EIP-4844 Blob Transaction on Sepolia! This is some arbitrary data for the blob payload.”)
   // 131072 its a MAX blob size
   if len(content) > 131072 {
    log.Fatalf(”Content size (%d) exceeds single blob size (%d)”, len(content), 131072)
   }

   copy(blobData[:], content)
   // Pass kzg4844.Blob by value to BlobToCommitment
   kzgCommitment, err := kzg4844.BlobToCommitment(&blobData)
   if err != nil {
    log.Fatal(”Failed to compute KZG commitment:”, err)
   }

   var kzgProof kzg4844.Proof
   var commitmentAsPoint kzg4844.Point
   copy(commitmentAsPoint[:], kzgCommitment[:])
   kzgProof, err = kzg4844.ComputeBlobProof(&blobData, kzgCommitment)
   if err != nil {
    log.Fatal(”Failed to compute KZG proof:”, err)
   }

   // Create a new SHA256 hasher.
   hasher := sha256.New()
   blobVersionedHash := kzg4844.CalcBlobHashV1(hasher, &kzgCommitment) // Pass commitment by pointer
   blobVersionedHashes := []common.Hash{common.Hash(blobVersionedHash)}
   // The BlobTxSidecar contains the actual blobs and KZG proofs.
   // It is transmitted alongside the transaction but not part of the RLP-encoded transaction itself.
   // The go-ethereum client handles attaching this when sending a BlobTx.
   sidecar := &types.BlobTxSidecar{
    Blobs:       []kzg4844.Blob{blobData},            // Actual blob data 
    Commitments: []kzg4844.Commitment{kzgCommitment}, // Calculated comitment
    Proofs:      []kzg4844.Proof{kzgProof},           // Calculated proof
   }

   value := uint256.MustFromBig(big.NewInt(100000000000000))
   gasLimit, err := client.EstimateGas(ctx, ethereum.CallMsg{
    From: *acc2Addr,
    To:   to,
    Value: value.ToBig(),
   })
   if err != nil {
    log.Fatal(”Failed to fetch gas limit:”, err)
   }

   fmt.Println(”nonce:”, nonce)
   // Construct the EIP-4844 transaction
   tx := types.BlobTx{
    ChainID:    uint256.NewInt(SepoliaChainID),
    Nonce:      nonce,
    GasTipCap:  uint256.MustFromBig(gasTipCap),
    GasFeeCap:  uint256.MustFromBig(gasFeeCap),
    Gas:        gasLimit,
    To:         *to,
    Value:      value,
    BlobFeeCap: uint256.MustFromBig(big.NewInt(2000000)), // Calculate the real blob fee
    BlobHashes: blobVersionedHashes,
   }

   // Convert it into a full types.Transaction object
   eip4844Tx := types.NewTx(&tx)
   // Attach the BlobTxSidecar to the transaction. This is crucial for sending blobs.
   eip4844TxWithSidecar := eip4844Tx.WithBlobTxSidecar(sidecar)
   // Sign the transaction
   signedTx, err := types.SignTx(eip4844TxWithSidecar, types.LatestSignerForChainID(chainID), acc2Priv)
   if err != nil {
    log.Fatal(”Failed to sign transaction:”, err)
   }

   // Broadcast the transaction
   err = client.SendTransaction(ctx, signedTx)
   if err != nil {
    log.Fatal(”Broadcast failed:”, err)
   }

   fmt.Println(”EIP-4844 Transaction sent!”)
   fmt.Println(”Tx hash:”, signedTx.Hash().Hex())
   // Optionally wait for inclusion
   time.Sleep(10 * time.Second)

   receipt, err := client.TransactionReceipt(ctx, signedTx.Hash())
   if err != nil {
    fmt.Println(”Tx not mined yet or error fetching receipt:”, err)
   } else {
    fmt.Println(”Tx mined in block:”, receipt.BlockNumber)
    fmt.Println(”Blob Gas Used:”, receipt.BlobGasUsed)
    fmt.Println(”Blob Gas Price:”, receipt.BlobGasPrice)
    fmt.Println(”Excess Blob Gas:”, receipt.BlobGasUsed)
   }
 }
````
