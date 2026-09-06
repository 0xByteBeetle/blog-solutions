# Published examples

Source: https://andreyobruchkov1996.substack.com/p/what-every-blockchain-developer-should-know-about-evm-internals-part-3-b6813d964592

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `7d73ec75414e9ad43a536d1ff54f9f25cb4a97d4ae7fdeb503a6e101719ede52`

````text
pragma solidity ^0.8.12;

contract Storage {
    struct my_storage_struct {
        uint256 number;
        string owner;
    }

    my_storage_struct my_storage;


    function store(my_storage_struct calldata new_storage) public {
        if (new_storage.number > 100) {
            revert("Number too large");
        }
        my_storage = new_storage;
    }

    function retrieve() public view returns (my_storage_struct memory){
        return my_storage;
    }
}
````

## Block 2

SHA-256: `81f8fb62bbba660fc3bcc18ecab610896df96364635fe95eb35b2002c5a8e975`

````text
curl -L https://foundry.paradigm.xyz | bash
foundryup
````

## Block 3

SHA-256: `319d78093482a77d23de073b59919584bb2b371582af990d3cf532a5f1ec3524`

````text
forge --version
cast --version
anvil --version
````

## Block 4

SHA-256: `0ea6fcf6ce2e8638fc5ba0638a3ba122038083ae02328d7390083872010ef13b`

````text
mkdir evm-trace-demo
cd evm-trace-demo
forge init
````

## Block 5

SHA-256: `50bc66d8aae5ae9020e15d53a103ddf91de202b3af5aeb3fd124b6861cdd2405`

````text
anvil
````

## Block 6

SHA-256: `af1dcb1aa4c60adbc01f20ec53e09cc01041824666a8e00ccc473ff6cb467285`

````text
forge create src/Storage.sol:Storage \
  --rpc-url http://localhost:8545 \
  --private-key <your-key> \
  --broadcast
````

## Block 7

SHA-256: `68522e34158931c5f336cfe2f6d37ecdf08849ed17de55d3a3940019f830e0d9`

````text
[⠊] Compiling...
[⠒] Compiling 1 files with Solc 0.8.30
[⠢] Solc 0.8.30 finished in 37.11ms
Compiler run successful!
Deployer: <your-address>
Deployed to: <the-address-of-the-smart-contract>
Transaction hash: <some-tx-hash>
````

## Block 8

SHA-256: `722d00560d43fe941419fb16b4742f404bd05327ce7595c310ea7bb2baf2f728`

````text
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "forge-std/Test.sol";
import "../src/Storage.sol";

contract StorageTest is Test {
    Storage public storageContract;

    function setUp() public {
        storageContract = new Storage();
    }

    function testStoreStruct() public {
        Storage.my_storage_struct memory input = Storage.my_storage_struct({
            number: 25,
            owner: "bob"
        });

        storageContract.store(input);
    }
}
````

## Block 9

SHA-256: `8ac84484d3a7050215f2f81afc00322dadb2b7be7dc8fdacea27026704ef481b`

````text
forge test --match-test testStoreStruct -vvvvv
````

## Block 10

SHA-256: `7077bbabc730ec2818d7a3f10509cad6cd8d5bf798edb128ee3268e2934cdc9b`

````text
 cast calldata "store((uint256,string))" "(25,"bob")"

// Output should be: 0xddd356b30000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001900000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000003626f620000000000000000000000000000000000000000000000000000000000
````

## Block 11

SHA-256: `6ffe4f20f1dcad83067690490c53b823307cf63c2a34f9e2a6d21ad0df21594b`

````text
cast rpc debug_traceCall \
  '{"to":"<your-contract-address>", "data":"0xddd356b30000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001900000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000003626f620000000000000000000000000000000000000000000000000000000000"}' \
  latest | jq '.' > trace.json
````

## Block 12

SHA-256: `a91ad97a9399b4d03ce2c5ad65d3bb1ac7781f0f146238e7dc94760ee0e7de2b`

````text
{
  "failed": false,
  "gas": 52080,
  "returnValue": "",
  ...
}
````

## Block 13

SHA-256: `95f4d8554401c2b0b896e87dbc8cabc5923823ad800d3fbcc89afd71d690c3d5`

````text
function testStoreStructReverts() public {
    Storage.my_storage_struct memory input = Storage.my_storage_struct({
        number: 101,
        owner: "too much"
    });

    storageContract.store(input);
}
````

## Block 14

SHA-256: `e86b6de92f8ce28cd6a4079d1cad6d466df360d14fd1328be79029a34b568e92`

````text
forge test --match-test testStoreStructReverts
````

## Block 15

SHA-256: `a1d645ac5b2b8e5f12be065d6a6cf8fb3b27b46d1eb1408ee651c4ad7c6af8a4`

````text
function testStoreStructReverts() public {
    Storage.my_storage_struct memory input = Storage.my_storage_struct({
        number: 101,
        owner: "too much"
    });

    vm.expectRevert("Number too large");
    storageContract.store(input);
}
````

## Block 16

SHA-256: `85ac84e0f876ed313a3ad9fc2897a7dedf7a7fd2c4e0f1234a0a01153f57aea1`

````text
{
  "failed": true,
  "gas": 23190,
  "returnValue": "08c379a0..."  // ABI-encoded error string
  ...
}
````

## Block 17

SHA-256: `be21828d6058c4b575e6a8ab0db6457b9d65db62b5409d42fbf3ae4aafc0722b`

````text
pragma solidity ^0.8.12;

import "forge-std/Script.sol";
import "../src/Storage.sol";

contract DebugStore is Script {
    function run() external {
        Storage s = new Storage();
        s.store(Storage.my_storage_struct({ number: 101, owner: "bob" }));
    }
}
````

## Block 18

SHA-256: `3873c275ec8920fe0ae93704d938dc541f08d9024ea21f127b67f9cf8b314975`

````text
forge script script/DebugStore.s.sol:DebugStore \
  --fork-url http://localhost:8545 \
  --debug
````
