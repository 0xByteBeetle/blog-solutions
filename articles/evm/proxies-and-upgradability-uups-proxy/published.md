# Published examples

Source: https://andreyobruchkov1996.substack.com/p/proxies-and-upgradability-uups-proxy

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `cf27b90678b9a78791f0928d66593ee88374f33c12052fa43f08a3ff0aca4421`

````text
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// The proxy
contract Proxiable {
    // Code position in storage is keccak256(”PROXIABLE”) = “0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7”
    function updateCodeAddress(address newAddress) internal {
        require(
            bytes32(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7) == Proxiable(newAddress).proxiableUUID(),
            “Not compatible”
        );
        assembly { // solium-disable-line
            sstore(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7, newAddress)
        }
    }
    function proxiableUUID() public pure returns (bytes32) {
        return 0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7;
    }
}
// Controls that only owner can do changes
contract Owned {
    address owner;
    function setOwner(address _owner) internal {
        owner = _owner;
    }
    modifier onlyOwner() {
        require(msg.sender == owner, “Only owner is allowed to perform this action”);
        _;
    }
}

contract LibraryLockDataLayout {
  bool public initialized = false;
}

// Locking mechaninsm.
contract LibraryLock is LibraryLockDataLayout {
    // Ensures no one can manipulate the Logic Contract once it is deployed.
    // PARITY WALLET HACK PREVENTION
    modifier delegatedOnly() {
        require(initialized == true, “The library is locked. No direct ‘call’ is allowed”);
        _;
    }
    function initialize() internal {
        initialized = true;
    }
}

contract ERC20DataLayout is LibraryLockDataLayout {
  uint256 public totalSupply;
  mapping(address=>uint256) public tokens;
}

contract MyToken is Owned, ERC20DataLayout, Proxiable, LibraryLock {
    function constructor1(uint256 _initialSupply) public {
        totalSupply = _initialSupply;
        tokens[msg.sender] = _initialSupply;
        initialize();
        setOwner(msg.sender);
    }
    function updateCode(address newCode) public onlyOwner delegatedOnly  {
        updateCodeAddress(newCode);
    }
    function transfer(address to, uint256 amount) public delegatedOnly {
        require(tokens[msg.sender] >= amount, “Not enough funds for transfer”);
        tokens[to] += amount;
        tokens[msg.sender] -= amount;
    }
}
````

## Block 2

SHA-256: `7d2b16b9b5a0f74fd32c6e8114a6680ea2c77c7a2f52435aac1d729a07d1f768`

````text
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

/*
 * Very simplified UUPS pattern.
 * - Proxy stores state and delegates calls.
 * - Implementation holds upgrade logic.
 */
// ---------------- Proxy ----------------
contract UUPSProxy {
    // Code position in storage is keccak256(”PROXIABLE”) = “0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7”
    constructor(bytes memory constructData, address contractLogic) {
        // save the code address
        assembly {
            sstore(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7, contractLogic)
        }
        // call the constructor
        (bool success,  ) = contractLogic.delegatecall(constructData);
        require(success, “Construction failed”);
    }
    // This fallback will actually call the logic contract
    // because every function with databytes will arrive here
    fallback() external payable {
        assembly {
            // load the logic contract address
            let contractLogic := sload(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7)
            calldatacopy(0x0, 0x0, calldatasize())
            // call the logic contract with the databytes
            let success := delegatecall(sub(gas(), 10000), contractLogic, 0x0, calldatasize(), 0, 0)
            let retSz := returndatasize()
            returndatacopy(0, 0, retSz)
            switch success
            case 0 {
                revert(0, retSz)
            }
            default {
                return(0, retSz)
            }
        }
    }
}
````

## Block 3

SHA-256: `50bc66d8aae5ae9020e15d53a103ddf91de202b3af5aeb3fd124b6861cdd2405`

````text
anvil
````

## Block 4

SHA-256: `bbf28054d624af42b4d35124c793c301b41e6649f980bf84921bd35e68e19e9d`

````text
// Deploy the contract logic
forge create src/UUPSLogicContract.sol:MyToken --rpc-url localhost:8545 --private-key <YOUR-ANVIL-PRIVATE-KEY> --broadcast

// expected output, something like:
// [⠊] Compiling...
// [⠒] Compiling 1 files with Solc 0.8.30
// [⠆] Solc 0.8.30 finished in 69.50ms
// Compiler run successful!
// Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
// Transaction hash: 0xfd7f81e7a54dba55a1a6399e465ed9ff67dc0d95a3f2fbbf85542fd7b0ffdf81
// Deploy the UUPS proxy
INIT_DATA=$(cast calldata “constructor1(uint256)” 1000000)
forge create src/UUPSProxy.sol:UUPSProxy --rpc-url localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast --constructor-args “$INIT_DATA” 0x5FbDB2315678afecb367f032d93F642f64180aa3
// expected output, something like:
// [⠊] Compiling...
// No files changed, compilation skipped
// Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// Deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
// Transaction hash: 0x60c04bf75c647a9c5bcd73155c8906675247ccf4f25fab20bf76e1b5a4ef129e
````

## Block 5

SHA-256: `743e06901b78da6cfc8ced7d9059e75cc8c2ffd040101b4f9ca0262d93d825d1`

````text
// Note that 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 is the proxy address
cast call 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 “totalSupply()(uint256)” --rpc-url http://localhost:8545
````
