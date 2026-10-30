# Published examples

Source: https://andreyobruchkov1996.substack.com/p/factories-how-smart-contracts-deploy

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `3e70d3ba22a9f914feae4e73ef5288d20d964d33b5fbfb8e19c79899826070cc`

````text
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    address public owner;
    uint256 public value;
    constructor(address _owner, uint256 start) {
        owner = _owner;
        value = start;
    }
    function inc() external {
        require(msg.sender == owner, “not owner”);
        value += 1;
    }
}

contract CounterFactory {
    event CounterCreated(address indexed counter, address indexed owner, uint256 start);

    function createCounter(address owner_, uint256 start_) external returns (address addr) {
        for (uint256 i = 0; i < 5; i++) {
            Counter c = new Counter(owner_, start_);
            addr = address(c);
            emit CounterCreated(addr, owner_, start_);
        }
    }
}
````

## Block 2

SHA-256: `50bc66d8aae5ae9020e15d53a103ddf91de202b3af5aeb3fd124b6861cdd2405`

````text
anvil
````

## Block 3

SHA-256: `a2e3646f8b0c7fea333b458d6d85e4022ac597daebe0350096baba6131c46731`

````text
// Deploy the factory contract
forge create src/basicfactory.sol:CounterFactory \
  --rpc-url localhost:8545 \
  --private-key <YOUR-ANVIL-PK>

// Expected output:
// [⠊] Compiling...
// [⠒] Compiling 1 files with Solc 0.8.30
// [⠢] Solc 0.8.30 finished in 52.99ms
// Compiler run successful!
// Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// Deployed to: 0x610178dA211FEF7D417bC0e6FeD39F05609AD788
// Transaction hash: 0x5c25685d15aacde7128a648d48dcd8b975ffc6e20aac9605bce2f582125b6437
// Call the factory
cast send 0x610178dA211FEF7D417bC0e6FeD39F05609AD788 \
  “createCounter(address,uint256)(address)” \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 42 \
  --rpc-url localhost:8545 --private-key <YOUR-ANVIL-PK>
// Logs expected in after this call with topics for each emited event
// and there you will find the contract addresses
````
