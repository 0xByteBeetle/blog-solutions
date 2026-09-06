# Published examples

Source: https://andreyobruchkov1996.substack.com/p/evm-message-signtypeddata-eip-712

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `75a8013a5483b2cfc9e4d610ee278fa8f0889851cb5584407a29258302db8bc1`

````text
struct Mail { address from; address to; string contents; }
````

## Block 2

SHA-256: `69eb57ddadfe282326c9ccdca71f59e52581abbee57593f92db6cecdce49b180`

````text
domainSeparator = hashStruct(eip712Domain);
````

## Block 3

SHA-256: `9a544b44b083b22c85836188530db5c3be1691cb1390a22fb04b353f7c238f3f`

````text
pragma solidity ^0.8.0;

import “@openzeppelin/contracts/utils/cryptography/EIP712.sol”;
import “@openzeppelin/contracts/utils/cryptography/ECDSA.sol”;

contract PermitVerifier is EIP712 {
    // keccak256(”Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)”)
    bytes32 public constant PERMIT_TYPEHASH =
        0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;
    constructor() EIP712(”MyDApp”, “1”) {}

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

## Block 4

SHA-256: `bd8f38ad7ad8f46a357611dc497c349d47f95e8195151ac2a1c720138081daa5`

````text
package main

const (
   // Public RPC URL for Polygon Amoy Testnet
   NodeRPCURL  = “https://polygon-amoy.drpc.org”
   AmoyChainID = 80002 // Polygon Amoy Testnet Chain ID
  )

func main() {
   // 1) Connect to Amoy
   client, err := ethclient.Dial(”https://polygon-amoy.drpc.org”)
   if err != nil {
      log.Fatal(err)
   }

   ctx := context.Background()
   // 2) Prepare the same EIP‑712 TypedData that the user signed
   acc2Addr, acc2Priv := account.GetAccount(2)
   verifierAddr := common.HexToAddress(”0xf80bb731f8ba49624dce8edb1a8188782287ff1e”)
   domain := apitypes.TypedDataDomain{
      Name:              “MyDApp”,
      Version:           “1”,
      ChainId:           math.NewHexOrDecimal256(AmoyChainID),
      VerifyingContract: verifierAddr.Hex(),
   }

   types := apitypes.Types{
      “EIP712Domain”: {
       {Name: “name”, Type: “string”},
       {Name: “version”, Type: “string”},
       {Name: “chainId”, Type: “uint256”},
       {Name: “verifyingContract”, Type: “address”},
      },
      “Permit”: {
       {Name: “owner”, Type: “address”},
       {Name: “spender”, Type: “address”},
       {Name: “value”, Type: “uint256”},
       {Name: “nonce”, Type: “uint256”},
       {Name: “deadline”, Type: “uint256”},
      },
   }

   deadline := big.NewInt(time.Now().Add(time.Hour).Unix())
   nonce := big.NewInt(0) 
   message := apitypes.TypedDataMessage{
      “owner”:    acc2Addr.Hex(),
      “spender”:  acc2Addr.Hex(), 
      “value”:    “1000000000000000000”,
      “nonce”:    nonce.String(),
      “deadline”: deadline.String(),
   }

   typedData := apitypes.TypedData{
      Types:       types,
      PrimaryType: “Permit”,
      Domain:      domain,
      Message:     message,
   }

   // 3) Sign or supply your existing (v,r,s)
   domainSep, _ := typedData.HashStruct(”EIP712Domain”, typedData.Domain.Map())
   msgHash, _ := typedData.HashStruct(”Permit”, typedData.Message)
   digest := crypto.Keccak256(
      []byte(”\x19\x01”),
      domainSep,
      msgHash,
   )

   sig, _ := crypto.Sign(digest, acc2Priv)
   r := common.BytesToHash(sig[:32])
   s := common.BytesToHash(sig[32:64])
   v := uint8(sig[64]) + 27

   // 4) ABI‑encode verifyPermit(owner,spender,value,nonce,deadline,v,r,s)
   verifierABI := `[{”inputs”:[{”internalType”:”address”,”name”:”owner”,”type”:”address”},{”internalType”:”address”,”name”:”spender”,”type”:”address”},{”internalType”:”uint256”,”name”:”value”,”type”:”uint256”},{”internalType”:”uint256”,”name”:”nonce”,”type”:”uint256”},{”internalType”:”uint256”,”name”:”deadline”,”type”:”uint256”},{”internalType”:”uint8”,”name”:”v”,”type”:”uint8”},{”internalType”:”bytes32”,”name”:”r”,”type”:”bytes32”},{”internalType”:”bytes32”,”name”:”s”,”type”:”bytes32”}],”name”:”verifyPermit”,”outputs”:[{”internalType”:”bool”,”name”:”“,”type”:”bool”}],”stateMutability”:”view”,”type”:”function”}]`
   parsed, _ := abi.JSON(strings.NewReader(verifierABI))

   calldata, _ := parsed.Pack(
      “verifyPermit”,
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
   out, err := parsed.Unpack(”verifyPermit”, res)
   if err != nil {
      log.Fatal(err)
   }

   fmt.Println(”Signature valid?”, out[0].(bool))
   if !out[0].(bool) {
      log.Fatal(”Signature verification failed”)
   }

   fmt.Printf(”Signature verified successfully for owner: %s\n”, acc2Addr.Hex())
}
````

## Block 5

SHA-256: `0f9955976f188baceef61cd7c9ea9d5a95f355b0e7501c05e8a4553c36c27575`

````text
Signature verified successfully for owner: <your-address>
````
