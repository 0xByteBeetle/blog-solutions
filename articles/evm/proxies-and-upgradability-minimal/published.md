# Published examples

Source: https://andreyobruchkov1996.substack.com/p/proxies-and-upgradability-minimal

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `9d4a9e92416671174f06884cca4fd5d5d41743b5567707d85e97e832b3ea6388`

````text
363d3d373d3d3d363d73<20-byte-impl>5af43d82803e903d91602b57fd5bf3

// <20-byte-impl> can be: 0xbebebebebe.... (the shared logic address)
````

## Block 2

SHA-256: `46f6fc34c7728fd545aa2d23ba2e67c0883fcbfca278e6c721ece8b9f9493223`

````text
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/* ---------------------------------- */
/* 1) Implementation (shared logic)   */
/* ---------------------------------- */
contract Counter {
    address public owner;
    uint256 public value;
    bool private _initialized;
    // Called via the clone after deployment
    function initialize(address _owner, uint256 start) external {
        require(!_initialized, “already initialized”);
        _initialized = true;
        owner = _owner;
        value = start;
    }
    function inc() external {
        require(msg.sender == owner, “not owner”);
        unchecked { value += 1; }
    }
    // Optional: prevent initializing the logic contract itself
    constructor() {
        _initialized = true;
    }
}
/* ---------------------------------- */
/* 2) Minimal Clone Factory           */
/* ---------------------------------- */
contract CounterCloneFactory {
    event CloneCreated(address indexed clone, address indexed owner, uint256 start, bytes32 salt);
    /* ---- Internal helpers: build creation code for the clone ---- */
    // Clone creation code = small prologue that returns the 45-byte runtime
    function _cloneCreationCode(address impl) internal pure returns (bytes memory code) {
        // creation: 3d602d80600a3d3981f3  -> return(next 0x37 bytes)
        // runtime:  363d3d373d3d3d363d73 <impl> 5af43d82803e903d91602b57fd5bf3
        code = abi.encodePacked(
            hex”3d602d80600a3d3981f3”,
            hex”363d3d373d3d3d363d73”,
            impl,
            hex”5af43d82803e903d91602b57fd5bf3”
        );
    }
    /* ---- Deploy a clone with CREATE ---- */
    function createClone(address implementation, address owner_, uint256 start_)
        external
        returns (address clone)
    {
        bytes memory code = _cloneCreationCode(implementation);
        assembly {
            clone := create(0, add(code, 0x20), mload(code))
            if iszero(clone) { revert(0, 0) }
        }
        // Initialize immediately (constructors don’t run through clones)
        (bool ok, ) = clone.call(abi.encodeWithSignature(”initialize(address,uint256)”, owner_, start_));
        require(ok, “init failed”);
        emit CloneCreated(clone, owner_, start_, bytes32(0));
    }
    /* ---- Deploy a deterministic clone with CREATE2 ---- */
    function createCloneDeterministic(address implementation, address owner_, uint256 start_, bytes32 salt)
        external
        returns (address clone)
    {
        bytes memory code = _cloneCreationCode(implementation);
        assembly {
            clone := create2(0, add(code, 0x20), mload(code), salt)
            if iszero(clone) { revert(0, 0) }
        }
        (bool ok, ) = clone.call(abi.encodeWithSignature(”initialize(address,uint256)”, owner_, start_));
        require(ok, “init failed”);
        emit CloneCreated(clone, owner_, start_, salt);
    }
}
````

## Block 3

SHA-256: `50bc66d8aae5ae9020e15d53a103ddf91de202b3af5aeb3fd124b6861cdd2405`

````text
anvil
````

## Block 4

SHA-256: `661eafc7996ace4553006cdc1cc8515c17d1fa59651ba818d0175dc55ec456ee`

````text
// Deployment of the shared logic
forge create src/minimalProxy.sol:Counter \
  --rpc-url localhost:8545 \
  --private-key <YOUR-ANVIL-PK> --broadcast

// Expected output:
// [⠊] Compiling...
// No files changed, compilation skipped
// Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// Deployed to: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
//Transaction hash: 0x43f37888e5c370cc1a398f1891cea860a80815fdf59716d4e2d8adb198b5edb8
// Deployment of the minimal proxy factory 
forge create src/minimalProxy.sol:CounterCloneFactory \
  --rpc-url localhost:8545 \
  --private-key <YOUR-ANVIL-PK> --broadcast
// Expected output:
// [⠊] Compiling...
// No files changed, compilation skipped
// Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// Deployed to: 0x0165878A594ca255338adfa4d48449f69242Eb8F
// Transaction hash: 0x6ddac050694baf16fc7bcfde90dcf0516bd1777b6a1b8ea23fd8019bc20391b2
````

## Block 5

SHA-256: `f7edd28eedaac7af66768f2009b7a06a6183ea1ba6be511043550582d42772a7`

````text
// Deploy first instance
cast send 0x0165878A594ca255338adfa4d48449f69242Eb8F \
  “createClone(address,address,uint256)(address)” \
  0x5FC8d32690cc91D4c39d9d3abcBD16989F875707 <YOUR-ANVIL-PK-ADDR> 100 \  
  --rpc-url localhost:8545 \
  --private-key <YOUR-ANVIL-PK>

// On success expected this log:
// logs [
// {”address”:”0x0165878a594ca255338adfa4d48449f69242eb8f”,
//    “topics”:[”0x6823f533242a9c540bd8ab230da11a7199723745abb9d484732bb57b4f34d4d1”,
//              “0x0000000000000000000000003b02ff1e626ed7a8fd6ec5299e2c54e1421b626b”,
//              “0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266”],
//              “data”:”0x00000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000000”,
//              “blockHash”:”0xe7748e4f28f2492642e9f64e7252fd40e85079e5211523b7b5b35c82adceff69”,”blockNumber”:”0x8”,”blockTimestamp”:”0x68b92822”,”transactionHash”:”0xe48d780a8268235887019e74d62e09a7e09164aaa37bdea60a2c0aa97f81d00c”,
//              “transactionIndex”:”0x0”,
//              “logIndex”:”0x0”,
//              “removed”:false}]
// 
// From logs we can see that the address is: 0x3b02ff1e626ed7a8fd6ec5299e2c54e1421b626b
// Deploy second instance
cast send 0x0165878A594ca255338adfa4d48449f69242Eb8F \
  “createClone(address,address,uint256)(address)” \
  0x5FC8d32690cc91D4c39d9d3abcBD16989F875707 <YOUR-ANVIL-PK-ADDR> 100 \
  --rpc-url localhost:8545 \
  --private-key <YOUR-ANVIL-PK>
// On success expected this log:
// [{”address”:”0x0165878a594ca255338adfa4d48449f69242eb8f”,
//   “topics”:[”0x6823f533242a9c540bd8ab230da11a7199723745abb9d484732bb57b4f34d4d1”,
//   “0x000000000000000000000000ba12646cc07adbe43f8bd25d83fb628d29c8a762” ....
//
// From logs we can see that the address is: 0xba12646cc07adbe43f8bd25d83fb628d29c8a762
````

## Block 6

SHA-256: `b21e889923f4b62774e077f61557e96a3097db6f36d300e31b355aa78e9cf0ce`

````text
// Read the value of the first proxy
cast call 0x3b02ff1e626ed7a8fd6ec5299e2c54e1421b626b “value()(uint256)” --rpc-url localhost:8545
// Expected output: 100

// Read the value of the first proxy
cast call 0xba12646cc07adbe43f8bd25d83fb628d29c8a762 “value()(uint256)” --rpc-url localhost:8545
// Expected output: 100
// Write operation on first contract
cast send 0x3b02ff1e626ed7a8fd6ec5299e2c54e1421b626b “inc()” \
  --rpc-url http://localhost:8545 \
  --private-key <YOUR-ANVIL-PK>
// Read the value of the first proxy
cast call 0x3b02ff1e626ed7a8fd6ec5299e2c54e1421b626b “value()(uint256)” --rpc-url localhost:8545
// Expected output: 101
// Read the value of the first proxy
cast call 0xba12646cc07adbe43f8bd25d83fb628d29c8a762 “value()(uint256)” --rpc-url localhost:8545
// Expected output: 100
````
