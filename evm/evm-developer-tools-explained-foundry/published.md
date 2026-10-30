# Published examples

Source: https://andreyobruchkov1996.substack.com/p/evm-developer-tools-explained-foundry

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `da2d504f9a1c8c43a6b7f95f5cff820263dadb08b82987b8ffc1c5ff3fbd604c`

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
            revert(”Number too large”);
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
