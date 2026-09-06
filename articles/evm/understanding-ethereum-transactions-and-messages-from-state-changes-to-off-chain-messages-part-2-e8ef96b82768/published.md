# Published examples

Source: https://andreyobruchkov1996.substack.com/p/understanding-ethereum-transactions-and-messages-from-state-changes-to-off-chain-messages-part-2-e8ef96b82768

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `071486f5932868cdd43d88dadda160f8aa3e3c3abc39c44be4e3cb08c0eb6796`

````text
0x03 || rlp(chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit, to, value, data, access_list, max_fee_per_blob_gas, blob_versioned_hashes, y_parity, r, s]).
````

## Block 2

SHA-256: `97f3473a7ad01fb7c7a6a01ba2af9f76e8fd280ac396af60c7ee56c82f94fc18`

````text
package main

// mined Tx:
// https://sepolia.etherscan.io/tx/0xfd044e8bccdba170a8afd3ec9248cb97fb4ebce49adbe392c47385c23ea82c3b

const (
 // Public RPC URL for Sepolia Testnet (confirm Dencun support)
 NodeRPCURL     = "https://eth-sepolia.public.blastapi.io" // Or a Dencun-enabled testnet like Sepolia
 SepoliaChainID = 11155111                                 // Sepolia Testnet Chain ID

 // Make sure you have this file in the specified path!
 // File is available here: https://github.com/ethereum/c-kzg-4844/blob/main/src/trusted_setup.txt
 TrustedSetupFilePath = "./trusted_setup.txt"
)

func main() {
 // --- KZG Trusted Setup Initialization (CRITICAL FOR BLOB TXS) ---
 fmt.Println("Loading KZG trusted setup using c-kzg-4844 bindings...")
 // LoadTrustedSetupFile returns an error. It internally sets up the KZG settings
 // which the go-ethereum/crypto/kzg4844 package then uses.
 // The '0' argument is for 'precompute', typically 0 for default.
 err := kzgBindings.LoadTrustedSetupFile(TrustedSetupFilePath, 0)
 if err != nil {
  log.Fatalf("Failed to load KZG trusted setup from %s: %v", TrustedSetupFilePath, err)
 }
 fmt.Println("KZG trusted setup loaded successfully.")
 // --- End KZG Trusted Setup Initialization ---

 acc2Addr, acc2Priv := account.GetAccount(2)
 to := lo.ToPtr(common.HexToAddress("0x7F8b1ca29F95274E06367b60fC4a539E4910FD0c"))

 ctx := context.Background()
 client, err := ethclient.Dial(NodeRPCURL)
 if err != nil {
  log.Fatal("Failed to connect to Ethereum node:", err)
 }

 nonce, err := client.PendingNonceAt(ctx, lo.FromPtr(acc2Addr))
 if err != nil {
  log.Fatal("Failed to fetch nonce:", err)
 }

 // EIP-1559 gas parameters (MaxPriorityFeePerGas and MaxFeePerGas)
 gasTipCap, err := client.SuggestGasTipCap(ctx)
 if err != nil {
  log.Fatal("Failed to fetch gas tip cap:", err)
 }

 feeHistory, err := client.FeeHistory(ctx, 5, nil, nil) // 5 blocks, last block is nil for current
 if err != nil {
  log.Fatal("Failed to fetch fee history:", err)
 }

 // base fee from most recent block
 latestBaseFee := feeHistory.BaseFee[len(feeHistory.BaseFee)-1]

 bufferedBaseFee := new(big.Int).Mul(latestBaseFee, big.NewInt(112))
 bufferedBaseFee.Div(bufferedBaseFee, big.NewInt(100))
 gasFeeCap := new(big.Int).Add(bufferedBaseFee, gasTipCap)

 chainID := big.NewInt(SepoliaChainID)

 // --- EIP-4844 Specifics ---
 var blobData kzg4844.Blob
 content := []byte("Hello, EIP-4844 Blob Transaction on Sepolia! This is some arbitrary data for the blob payload.")
 // 131072 its a MAX blob size
 if len(content) > 131072 {
  log.Fatalf("Content size (%d) exceeds single blob size (%d)", len(content), 131072)
 }
 copy(blobData[:], content)

 // Pass kzg4844.Blob by value to BlobToCommitment
 kzgCommitment, err := kzg4844.BlobToCommitment(&blobData)
 if err != nil {
  log.Fatal("Failed to compute KZG commitment:", err)
 }

 var kzgProof kzg4844.Proof
 var commitmentAsPoint kzg4844.Point
 copy(commitmentAsPoint[:], kzgCommitment[:])

 kzgProof, err = kzg4844.ComputeBlobProof(&blobData, kzgCommitment)
 if err != nil {
  log.Fatal("Failed to compute KZG proof:", err)
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
  log.Fatal("Failed to fetch gas limit:", err)
 }

 fmt.Println("nonce:", nonce)

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
  log.Fatal("Failed to sign transaction:", err)
 }

 // Broadcast the transaction
 err = client.SendTransaction(ctx, signedTx)
 if err != nil {
  log.Fatal("Broadcast failed:", err)
 }

 fmt.Println("EIP-4844 Transaction sent!")
 fmt.Println("Tx hash:", signedTx.Hash().Hex())

 // Optionally wait for inclusion
 time.Sleep(10 * time.Second)
 receipt, err := client.TransactionReceipt(ctx, signedTx.Hash())
 if err != nil {
  fmt.Println("Tx not mined yet or error fetching receipt:", err)
 } else {
  fmt.Println("Tx mined in block:", receipt.BlockNumber)
  fmt.Println("Blob Gas Used:", receipt.BlobGasUsed)
  fmt.Println("Blob Gas Price:", receipt.BlobGasPrice)
  fmt.Println("Excess Blob Gas:", receipt.BlobGasUsed)
 }
}
````

## Block 3

SHA-256: `8d50f1d563e83782897a6377fc9cd76c50953b8a1c034539fe7e6b0bb6461f60`

````text
[chain_id, address, nonce, y_parity, r, s]
````

## Block 4

SHA-256: `1f8a6952997a9b2e41096571989b9e91ce48029be8f1d69cbd3a94cb6ba7c83b`

````text
0x04 || rlp([chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit,destination, value, data, access_list, authorization_list, signature_y_parity,signature_r, signature_s])
````

## Block 5

SHA-256: `b609ce94b634111057ed9862d73b8dfb59fdb3db96871e890436834b5e38c1ae`

````text
authorization_list = [[chain_id, address, nonce, y_parity, r, s], ...]
````

## Block 6

SHA-256: `20c2f65be92efda633f49bd6ec02dd3e4107eab1662fb63a3a9fec8d5b1662f5`

````text

pragma solidity ^0.8.24;

contract Invoked {
    event Pinged(address sender);

    function ping() external {
        emit Pinged(msg.sender);
    }
}
````

## Block 7

SHA-256: `593c568a93ebba00374f50c155d3dcc4b9fa0f409d935b46524e200afa4c153b`

````text

pragma solidity ^0.8.24;

contract MultiDelegationInvoker {
    event PingSuccess(address from);
    event PingStart(address from);

    function triggerPings(address[] calldata froms) external {
        emit PingStart(msg.sender);
        
        for (uint i = 0; i < froms.length; i++) {
            address from = froms[i];
            bytes memory code = new bytes(23);

            // Load the first 23 bytes of the code at `from`
            assembly {
                extcodecopy(from, add(code, 0x20), 0, 23)
            }

            // Check if it starts with 0xef0100
            if (
                code.length == 23 &&
                uint8(code[0]) == 0xef &&
                uint8(code[1]) == 0x01 &&
                uint8(code[2]) == 0x00
            ) {
                // After verifying code starts with 0xef0100
                address someModule;
                assembly {
                    someModule := shr(96, mload(add(code, 0x23)))
                }

                (bool ok, ) = someModule.call(abi.encodeWithSignature("ping()"));
                require(ok, "Ping failed");

                emit PingSuccess(from);
            } else {
                revert("Not delegated or invalid delegation format");
            }
        }
    }
}
````

## Block 8

SHA-256: `d15c75885668594640ed01532d700d0e6bc32b3d22b5fa602350ebf19c1eb2ab`

````text
for (uint i = 0; i < froms.length; i++) {
    address from = froms[i];
    …
}
````

## Block 9

SHA-256: `d0f25feaba57f0f81fea1e0c2fa0125d81b9297791d14c77559cb9b0ad23fd63`

````text
bytes memory code = new bytes(23);
assembly {
    extcodecopy(from, add(code, 0x20), 0, 23)
}
````

## Block 10

SHA-256: `3ae5b727fe51c894e3145f91fe52cb816fb79cd7089e6ef8491c08ec1fa4345f`

````text
if (
    code.length == 23 &&
    uint8(code[0]) == 0xef &&
    uint8(code[1]) == 0x01 &&
    uint8(code[2]) == 0x00
) {
    …
} else {
    revert("Not delegated or invalid delegation format");
}
````

## Block 11

SHA-256: `5954c6475bf0bd692b0d53eaab6ce1a53fe3b0c0ea52deaa7a93cfc48c51eae9`

````text
address realModule;
assembly {
    realModule := shr(96, mload(add(code, 0x23)))
}
````

## Block 12

SHA-256: `77f5c15f245e2fc893055e5750abac807a75b00ba17ab0faa3877d2ef4b231dd`

````text
(bool ok, ) = realModule.call(
    abi.encodeWithSignature("ping()")
);
require(ok, "Ping failed");
emit PingSuccess(from);
````

## Block 13

SHA-256: `51fc4baf6369a327be4882678ec3ae21370996c9e1829c3773bdb62a08beaf71`

````text
package main

import (
 "context"
 "crypto/ecdsa"
 "fmt"
 "log"
 "math/big"
 "strings"
 "time"
 "transactiontypes/account"

 "github.com/ethereum/go-ethereum/accounts/abi"
 "github.com/ethereum/go-ethereum/common"
 "github.com/ethereum/go-ethereum/core/types"
 "github.com/ethereum/go-ethereum/crypto"
 "github.com/ethereum/go-ethereum/ethclient"
 "github.com/ethereum/go-ethereum/rlp"
 "github.com/holiman/uint256"
)

const (
 // Public RPC URL for Polygon Amoy Testnet
 NodeRPCURL  = "https://polygon-amoy.drpc.org"
 AmoyChainID = 80002 // Polygon Amoy Testnet Chain ID
)

func main() {
 ctx := context.Background()
 client, err := ethclient.Dial(NodeRPCURL)
 if err != nil {
  log.Fatal("RPC connection failed:", err)
 }

 // Load account
 acc2Addr, acc2Priv := account.GetAccount(2)
 acc1Addr, acc1Priv := account.GetAccount(1)

 to := common.HexToAddress("0x87581c71b3693062f4d3e34617c3919ec1abf39b")

 // Define contract and parameters
 moduleAddr := common.HexToAddress("0x4f9c96915a9ce8cd5eb11a2c35ab587fc97d5126")

 froms := []common.Address{
  *acc1Addr,
  *acc2Addr,
 }

 // Build calldata
 contractAbiJson := `[{"anonymous": false,"inputs": [{"indexed": false,"internalType": "address","name": "from","type": "address"}],"name": "PingStart","type": "event"},{"anonymous": false,"inputs": [{"indexed": false,"internalType": "address","name": "from","type": "address"}],"name": "PingSuccess","type": "event"},{"inputs": [{"internalType": "address[]","name": "froms","type": "address[]"}],"name": "triggerPings","outputs": [],"stateMutability": "nonpayable","type": "function"}]`
 parsedAbi, _ := abi.JSON(strings.NewReader(contractAbiJson))
 data, err := parsedAbi.Pack("triggerPings", froms)
 if err != nil {
  log.Fatal("ABI pack error:", err)
 }

 // Nonce and gas
 baseNonce2, err := client.PendingNonceAt(ctx, *acc2Addr)
 if err != nil {
  log.Fatal("Nonce fetch failed:", err)
 }
 nonce2 := baseNonce2 + 1

 nonce1, err := client.PendingNonceAt(ctx, *acc1Addr)
 if err != nil {
  log.Fatal("Nonce fetch failed:", err)
 }

 gasTipCap, err := client.SuggestGasTipCap(ctx)
 if err != nil {
  log.Fatal("Failed to fetch gas tip cap:", err)
 }
 baseFee, err := client.SuggestGasPrice(ctx)
 if err != nil {
  log.Fatal("Failed to fetch base fee:", err)
 }
 gasFeeCap := new(big.Int).Add(baseFee, gasTipCap)

 // Create EIP-712-style signature for delegation
 sig2, err := signEIP7702Delegation(acc2Priv, AmoyChainID, moduleAddr, nonce2)
 if err != nil {
  log.Fatal("Signature failed:", err)
 }

 sig1, err := signEIP7702Delegation(acc1Priv, AmoyChainID, moduleAddr, nonce1)
 if err != nil {
  log.Fatal("Signature failed:", err)
 }

 r2 := new(big.Int).SetBytes(sig2[:32])
 s2 := new(big.Int).SetBytes(sig2[32:64])
 v2 := uint8(sig2[64])

 r1 := new(big.Int).SetBytes(sig1[:32])
 s1 := new(big.Int).SetBytes(sig1[32:64])
 v1 := uint8(sig1[64])

 // Build EIP-7702 TxWithDelegation
 delegation := types.SetCodeTx{
  ChainID:   uint256.NewInt(AmoyChainID),
  Nonce:     baseNonce2,
  GasTipCap: uint256.MustFromBig(gasTipCap),
  GasFeeCap: uint256.MustFromBig(gasFeeCap),
  Gas:       120000,
  To:        to,
  Data:      data,
  AuthList: []types.SetCodeAuthorization{
   {
    ChainID: *uint256.NewInt(AmoyChainID),
    Address: moduleAddr,
    Nonce:   nonce1,
    R:       *uint256.MustFromBig(r1),
    S:       *uint256.MustFromBig(s1),
    V:       v1,
   },
   {
    ChainID: *uint256.NewInt(AmoyChainID),
    Address: moduleAddr,
    Nonce:   nonce2,
    R:       *uint256.MustFromBig(r2),
    S:       *uint256.MustFromBig(s2),
    V:       v2,
   },
  },
 }

 fullTx := types.NewTx(&delegation)
 signedTx, err := types.SignTx(fullTx, types.LatestSignerForChainID(big.NewInt(AmoyChainID)), acc2Priv)
 if err != nil {
  log.Fatal("Signing failed:", err)
 }

 err = client.SendTransaction(ctx, signedTx)
 if err != nil {
  log.Fatal("Tx failed:", err)
 }

 fmt.Println("EIP-7702 Tx sent:", signedTx.Hash().Hex())

 time.Sleep(10 * time.Second)
 receipt, err := client.TransactionReceipt(ctx, signedTx.Hash())
 if err != nil {
  fmt.Println("Waiting...")
 } else {
  fmt.Println("Tx mined in block", receipt.BlockNumber)
 }
}

// signEIP7702Delegation creates a hash of (chainID, from, nonce) and signs it
func signEIP7702Delegation(priv *ecdsa.PrivateKey, chainID int64, from common.Address, nonce uint64) ([]byte, error) {
 // Encode [chain_id, address, nonce] in RLP
 msgPayload, err := rlp.EncodeToBytes([]interface{}{
  big.NewInt(chainID),
  from,
  big.NewInt(int64(nonce)),
 })
 if err != nil {
  return nil, err
 }

 // Prepend MAGIC 0x05
 prefixed := append([]byte{0x05}, msgPayload...)

 // Hash
 msgHash := crypto.Keccak256Hash(prefixed)
 return crypto.Sign(msgHash.Bytes(), priv)
}
````

## Block 14

SHA-256: `b873f02f89e8b0be7e9c8a52aac1e19b3917b444e009436804adeed82c2661da`

````text
&types.SetCodeTx{
  ChainID: AmoyChainID,
  Nonce:   baseNonce2,        
  To:      to,                
  Data:    data,              
  Gas:     120_000, // some hardcoded fee to not write too much code
  AuthList: []SetCodeAuthorization{
    { Address: moduleAddr, Nonce: nonce1, R:…, S:…, V:… },
    { Address: moduleAddr, Nonce: nonce2, R:…, S:…, V:… },
  },
}
````

## Block 15

SHA-256: `75a8013a5483b2cfc9e4d610ee278fa8f0889851cb5584407a29258302db8bc1`

````text
struct Mail { address from; address to; string contents; }
````

## Block 16

SHA-256: `69eb57ddadfe282326c9ccdca71f59e52581abbee57593f92db6cecdce49b180`

````text
domainSeparator = hashStruct(eip712Domain);
````

## Block 17

SHA-256: `ac63ca4b08703862bb1a0b126d768a4aec2fd4eb2cb006b846e742dfd67e7818`

````text
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract PermitVerifier is EIP712 {
    // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)")
    bytes32 public constant PERMIT_TYPEHASH =
        0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;

    constructor() EIP712("MyDApp", "1") {}

    function verifyPermit(
        address owner,
        address spender,
        uint256 value,
        uint256 nonce,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external view returns (bool) {
        bytes32 structHash = keccak256(
            abi.encode(
                PERMIT_TYPEHASH,
                owner,
                spender,
                value,
                nonce,
                deadline
            )
        );
        bytes32 digest = _hashTypedDataV4(structHash);
        return ECDSA.recover(digest, v, r, s) == owner;
    }
}
````

## Block 18

SHA-256: `668e4f6d21daaef1f0e5318ec70be3b7f26e2181bb6f441bddda002ff5618a92`

````text
package main

const (
 // Public RPC URL for Polygon Amoy Testnet
 NodeRPCURL  = "https://polygon-amoy.drpc.org"
 AmoyChainID = 80002 // Polygon Amoy Testnet Chain ID
)

func main() {
 // 1) Connect to Amoy
 client, err := ethclient.Dial("https://polygon-amoy.drpc.org")
 if err != nil {
  log.Fatal(err)
 }
 ctx := context.Background()

 // 2) Prepare the same EIP‑712 TypedData that the user signed
 acc2Addr, acc2Priv := account.GetAccount(2)

 verifierAddr := common.HexToAddress("0xf80bb731f8ba49624dce8edb1a8188782287ff1e")

 domain := apitypes.TypedDataDomain{
  Name:              "MyDApp",
  Version:           "1",
  ChainId:           math.NewHexOrDecimal256(AmoyChainID),
  VerifyingContract: verifierAddr.Hex(),
 }
 types := apitypes.Types{
  "EIP712Domain": {
   {Name: "name", Type: "string"},
   {Name: "version", Type: "string"},
   {Name: "chainId", Type: "uint256"},
   {Name: "verifyingContract", Type: "address"},
  },
  "Permit": {
   {Name: "owner", Type: "address"},
   {Name: "spender", Type: "address"},
   {Name: "value", Type: "uint256"},
   {Name: "nonce", Type: "uint256"},
   {Name: "deadline", Type: "uint256"},
  },
 }
 deadline := big.NewInt(time.Now().Add(time.Hour).Unix())
 nonce := big.NewInt(0) 
 message := apitypes.TypedDataMessage{
  "owner":    acc2Addr.Hex(),
  "spender":  acc2Addr.Hex(), 
  "value":    "1000000000000000000",
  "nonce":    nonce.String(),
  "deadline": deadline.String(),
 }
 typedData := apitypes.TypedData{
  Types:       types,
  PrimaryType: "Permit",
  Domain:      domain,
  Message:     message,
 }

 // 3) Sign or supply your existing (v,r,s)
 domainSep, _ := typedData.HashStruct("EIP712Domain", typedData.Domain.Map())
 msgHash, _ := typedData.HashStruct("Permit", typedData.Message)
 digest := crypto.Keccak256(
  []byte("\x19\x01"),
  domainSep,
  msgHash,
 )
 sig, _ := crypto.Sign(digest, acc2Priv)
 r := common.BytesToHash(sig[:32])
 s := common.BytesToHash(sig[32:64])
 v := uint8(sig[64]) + 27

 // 4) ABI‑encode verifyPermit(owner,spender,value,nonce,deadline,v,r,s)
 verifierABI := `[{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"nonce","type":"uint256"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"verifyPermit","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}]`
 parsed, _ := abi.JSON(strings.NewReader(verifierABI))
 calldata, _ := parsed.Pack(
  "verifyPermit",
  acc2Addr,
  acc2Addr, // spender (must match what was signed)
  big.NewInt(1e18),
  nonce,
  deadline,
  v, r, s,
 )

 // 5) Do an eth_call
 msg := ethereum.CallMsg{
  To:   &verifierAddr,
  Data: calldata,
 }
 res, err := client.CallContract(ctx, msg, nil)
 if err != nil {
  log.Fatal(err)
 }

 // 6) Decode the bool result
 out, err := parsed.Unpack("verifyPermit", res)
 if err != nil {
  log.Fatal(err)
 }
 fmt.Println("Signature valid?", out[0].(bool))

 if !out[0].(bool) {
  log.Fatal("Signature verification failed")
 }

 fmt.Printf("Signature verified successfully for owner: %s\n", acc2Addr.Hex())
}
````

## Block 19

SHA-256: `0f9955976f188baceef61cd7c9ea9d5a95f355b0e7501c05e8a4553c36c27575`

````text
Signature verified successfully for owner: <your-address>
````
