# Published examples

Source: https://andreyobruchkov1996.substack.com/p/tracing-ethereum-transactions-how

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `e2ac2f6fe2426c2b784fcc2ca6c8b312c32834ffd23acd70639f32bb9aba6789`

````text
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import “forge-std/Test.sol”;
import “../src/Storage.sol”;
contract StorageTest is Test {
    Storage public storageContract;
    function setUp() public {
        storageContract = new Storage();
    }
    function testStoreStruct() public {
        Storage.my_storage_struct memory input = Storage.my_storage_struct({
            number: 25,
            owner: “bob”
        });
        storageContract.store(input);
    }
}
````

## Block 2

SHA-256: `8ac84484d3a7050215f2f81afc00322dadb2b7be7dc8fdacea27026704ef481b`

````text
forge test --match-test testStoreStruct -vvvvv
````

## Block 3

SHA-256: `700828a8e2a3081ce451276645e3bd51e78d6602b0774f6199292d425f8d12a3`

````text
cast calldata “store((uint256,string))” “(25,”bob”)”

// Output should be: 0xddd356b30000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001900000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000003626f620000000000000000000000000000000000000000000000000000000000
````

## Block 4

SHA-256: `da8f8927b5c05075275aa5e3deb2cf0c0f7b035bb4b48d0257b885e5288a8a6d`

````text
cast rpc debug_traceCall \
  ‘{”to”:”<your-contract-address>”, “data”:”0xddd356b30000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001900000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000003626f620000000000000000000000000000000000000000000000000000000000”}’ \
  latest | jq ‘.’ > trace.json
````

## Block 5

SHA-256: `f8fac8735ba8a00f22e3d6b5f86c47bd284cd01447155336d3771b5f20aa30b0`

````text
{
  “failed”: false,
  “gas”: 52080,
  “returnValue”: “”,
  ...
}
````

## Block 6

SHA-256: `18ecd5ec9a5e5d121d7213474bae559956926338d6885c773fd0b157193ba21e`

````text
function testStoreStructReverts() public {
    Storage.my_storage_struct memory input = Storage.my_storage_struct({
        number: 101,
        owner: “too much”
    });

    storageContract.store(input);
}
````

## Block 7

SHA-256: `e86b6de92f8ce28cd6a4079d1cad6d466df360d14fd1328be79029a34b568e92`

````text
forge test --match-test testStoreStructReverts
````

## Block 8

SHA-256: `07865709de14a63377941fc8960245940177bac33d098009003afac8b6f14cb8`

````text
function testStoreStructReverts() public {
    Storage.my_storage_struct memory input = Storage.my_storage_struct({
        number: 101,
        owner: “too much”
    });

    vm.expectRevert(”Number too large”);
    storageContract.store(input);
}
````

## Block 9

SHA-256: `12cdca6489b1ebfc9bcd1442ad2579242e5d3424599bfece86e86878e421c821`

````text
{
  “failed”: true,
  “gas”: 23190,
  “returnValue”: “08c379a0...”  // ABI-encoded error string
  ...
}
````

## Block 10

SHA-256: `d06f5d4c5ab16a6709f0caf54da21bb6696a7511869ce0dc632b0fc6e0ca87e7`

````text
pragma solidity ^0.8.12;

import “forge-std/Script.sol”;
import “../src/Storage.sol”;
contract DebugStore is Script {
    function run() external {
        Storage s = new Storage();
        s.store(Storage.my_storage_struct({ number: 101, owner: “bob” }));
    }
}
````

## Block 11

SHA-256: `3873c275ec8920fe0ae93704d938dc541f08d9024ea21f127b67f9cf8b314975`

````text
forge script script/DebugStore.s.sol:DebugStore \
  --fork-url http://localhost:8545 \
  --debug
````
