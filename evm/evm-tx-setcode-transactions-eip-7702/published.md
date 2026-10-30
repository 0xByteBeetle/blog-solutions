# Published examples

Source: https://andreyobruchkov1996.substack.com/p/evm-tx-setcode-transactions-eip-7702

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `8d50f1d563e83782897a6377fc9cd76c50953b8a1c034539fe7e6b0bb6461f60`

````text
[chain_id, address, nonce, y_parity, r, s]
````

## Block 2

SHA-256: `1f8a6952997a9b2e41096571989b9e91ce48029be8f1d69cbd3a94cb6ba7c83b`

````text
0x04 || rlp([chain_id, nonce, max_priority_fee_per_gas, max_fee_per_gas, gas_limit,destination, value, data, access_list, authorization_list, signature_y_parity,signature_r, signature_s])
````

## Block 3

SHA-256: `b609ce94b634111057ed9862d73b8dfb59fdb3db96871e890436834b5e38c1ae`

````text
authorization_list = [[chain_id, address, nonce, y_parity, r, s], ...]
````

## Block 4

SHA-256: `b6f1ba50736bd3275c16a0295c775db81e1ab33a9238c4a7a966d0cf095f08b5`

````text
pragma solidity ^0.8.24;

contract Invoked {
    event Pinged(address sender);
    function ping() external {
        emit Pinged(msg.sender);
    }
}
````

## Block 5

SHA-256: `ac4291f322fa06c6b32d743b3a9531ff4558b9ad31dfccafa2810202680b6ebc`

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
                (bool ok, ) = someModule.call(abi.encodeWithSignature(”ping()”));
                require(ok, “Ping failed”);
                emit PingSuccess(from);
            } else {
                revert(”Not delegated or invalid delegation format”);
            }
        }
    }
}
````

## Block 6

SHA-256: `d15c75885668594640ed01532d700d0e6bc32b3d22b5fa602350ebf19c1eb2ab`

````text
for (uint i = 0; i < froms.length; i++) {
    address from = froms[i];
    …
}
````

## Block 7

SHA-256: `d0f25feaba57f0f81fea1e0c2fa0125d81b9297791d14c77559cb9b0ad23fd63`

````text
bytes memory code = new bytes(23);
assembly {
    extcodecopy(from, add(code, 0x20), 0, 23)
}
````

## Block 8

SHA-256: `de40b421391c280b72c85aad99992ea4f2cfc363ab342c79102da6144f9fe1cc`

````text
if (
    code.length == 23 &&
    uint8(code[0]) == 0xef &&
    uint8(code[1]) == 0x01 &&
    uint8(code[2]) == 0x00
) {
    …
} else {
    revert(”Not delegated or invalid delegation format”);
}
````

## Block 9

SHA-256: `5954c6475bf0bd692b0d53eaab6ce1a53fe3b0c0ea52deaa7a93cfc48c51eae9`

````text
address realModule;
assembly {
    realModule := shr(96, mload(add(code, 0x23)))
}
````

## Block 10

SHA-256: `a6e3c9aeff3682c7d089eaf92d7196a40446ebab8caf11bffa444c22c9dafcf1`

````text
(bool ok, ) = realModule.call(
    abi.encodeWithSignature(”ping()”)
);
require(ok, “Ping failed”);
emit PingSuccess(from);
````

## Block 11

SHA-256: `f0d8409659121cf7a28e883fe1a1eca5e0804da5c9b63cb73c3f5b773271b413`

````text
package main

import (
 “context”
 “crypto/ecdsa”
 “fmt”
 “log”
 “math/big”
 “strings”
 “time”
 “transactiontypes/account”
 “github.com/ethereum/go-ethereum/accounts/abi”
 “github.com/ethereum/go-ethereum/common”
 “github.com/ethereum/go-ethereum/core/types”
 “github.com/ethereum/go-ethereum/crypto”
 “github.com/ethereum/go-ethereum/ethclient”
 “github.com/ethereum/go-ethereum/rlp”
 “github.com/holiman/uint256”
)

const (
   // Public RPC URL for Polygon Amoy Testnet
   NodeRPCURL  = “https://polygon-amoy.drpc.org”
   AmoyChainID = 80002 // Polygon Amoy Testnet Chain ID
  )

func main() {
   ctx := context.Background()
   client, err := ethclient.Dial(NodeRPCURL)
   if err != nil {
    log.Fatal(”RPC connection failed:”, err)
   }

   // Load account
   acc2Addr, acc2Priv := account.GetAccount(2)
   acc1Addr, acc1Priv := account.GetAccount(1)
   to := common.HexToAddress(”0x87581c71b3693062f4d3e34617c3919ec1abf39b”)
   // Define contract and parameters
   moduleAddr := common.HexToAddress(”0x4f9c96915a9ce8cd5eb11a2c35ab587fc97d5126”)
   froms := []common.Address{
      *acc1Addr,
      *acc2Addr,
   }

   // Build calldata
   contractAbiJson := `[{”anonymous”: false,”inputs”: [{”indexed”: false,”internalType”: “address”,”name”: “from”,”type”: “address”}],”name”: “PingStart”,”type”: “event”},{”anonymous”: false,”inputs”: [{”indexed”: false,”internalType”: “address”,”name”: “from”,”type”: “address”}],”name”: “PingSuccess”,”type”: “event”},{”inputs”: [{”internalType”: “address[]”,”name”: “froms”,”type”: “address[]”}],”name”: “triggerPings”,”outputs”: [],”stateMutability”: “nonpayable”,”type”: “function”}]`
   parsedAbi, _ := abi.JSON(strings.NewReader(contractAbiJson))
   data, err := parsedAbi.Pack(”triggerPings”, froms)
   if err != nil {
      log.Fatal(”ABI pack error:”, err)
   }

   // Nonce and gas
   baseNonce2, err := client.PendingNonceAt(ctx, *acc2Addr)
   if err != nil {
      log.Fatal(”Nonce fetch failed:”, err)
   }

   nonce2 := baseNonce2 + 1
   nonce1, err := client.PendingNonceAt(ctx, *acc1Addr)
   if err != nil {
      log.Fatal(”Nonce fetch failed:”, err)
   }

   gasTipCap, err := client.SuggestGasTipCap(ctx)
   if err != nil {
      log.Fatal(”Failed to fetch gas tip cap:”, err)
   }

   baseFee, err := client.SuggestGasPrice(ctx)
   if err != nil {
      log.Fatal(”Failed to fetch base fee:”, err)
   }

   gasFeeCap := new(big.Int).Add(baseFee, gasTipCap)
   // Create EIP-712-style signature for delegation
   sig2, err := signEIP7702Delegation(acc2Priv, AmoyChainID, moduleAddr, nonce2)
   if err != nil {
      log.Fatal(”Signature failed:”, err)
   }

   sig1, err := signEIP7702Delegation(acc1Priv, AmoyChainID, moduleAddr, nonce1)
   if err != nil {
      log.Fatal(”Signature failed:”, err)
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
      log.Fatal(”Signing failed:”, err)
   }

   err = client.SendTransaction(ctx, signedTx)
   if err != nil {
      log.Fatal(”Tx failed:”, err)
   }

   fmt.Println(”EIP-7702 Tx sent:”, signedTx.Hash().Hex())
   time.Sleep(10 * time.Second)

   receipt, err := client.TransactionReceipt(ctx, signedTx.Hash())
   if err != nil {
      fmt.Println(”Waiting...”)
   } else {
      fmt.Println(”Tx mined in block”, receipt.BlockNumber)
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

## Block 12

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
