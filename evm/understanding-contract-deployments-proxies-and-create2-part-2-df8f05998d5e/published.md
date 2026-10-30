# Published examples

Source: https://andreyobruchkov1996.substack.com/p/understanding-contract-deployments-proxies-and-create2-part-2-df8f05998d5e

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `af838685797e188600b4b4f6b014d3d4eb25601fa2d8fe412bf492548a6950e3`

````text
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// The proxy
contract Proxiable {
    // Code position in storage is keccak256("PROXIABLE") = "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7"

    function updateCodeAddress(address newAddress) internal {
        require(
            bytes32(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7) == Proxiable(newAddress).proxiableUUID(),
            "Not compatible"
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
        require(msg.sender == owner, "Only owner is allowed to perform this action");
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
        require(initialized == true, "The library is locked. No direct 'call' is allowed");
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
        require(tokens[msg.sender] >= amount, "Not enough funds for transfer");
        tokens[to] += amount;
        tokens[msg.sender] -= amount;
    }
}
````

## Block 2

SHA-256: `2d40b55a7002eab3ed032be83ca8f5926abf4c0482204589f937b8b92abc5ddd`

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
    // Code position in storage is keccak256("PROXIABLE") = "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7"
    constructor(bytes memory constructData, address contractLogic) {
        // save the code address
        assembly {
            sstore(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7, contractLogic)
        }
        // call the constructor
        (bool success,  ) = contractLogic.delegatecall(constructData);
        require(success, "Construction failed");
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

SHA-256: `f1f31d3171c9017a3cfc243d1a3af894b1c9c46fc2f21e787809de148d6efeb2`

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
INIT_DATA=$(cast calldata "constructor1(uint256)" 1000000)
forge create src/UUPSProxy.sol:UUPSProxy --rpc-url localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast --constructor-args "$INIT_DATA" 0x5FbDB2315678afecb367f032d93F642f64180aa3

// expected output, something like:
// [⠊] Compiling...
// No files changed, compilation skipped
// Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// Deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
// Transaction hash: 0x60c04bf75c647a9c5bcd73155c8906675247ccf4f25fab20bf76e1b5a4ef129e
````

## Block 5

SHA-256: `d97cd64a3849cda6e806ba02acfa283109bd94ab82f8ae696da28ff377b790e5`

````text
// Note that 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 is the proxy address
cast call 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 "totalSupply()(uint256)" --rpc-url http://localhost:8545
````

## Block 6

SHA-256: `7fdc012a9d7af5ac38422f008ab3a533e2d81b2a6d7d7d4c1f60308bbed46d3f`

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
        require(msg.sender == owner, "not owner");
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

## Block 7

SHA-256: `50bc66d8aae5ae9020e15d53a103ddf91de202b3af5aeb3fd124b6861cdd2405`

````text
anvil
````

## Block 8

SHA-256: `832f5ebd5cd05216aada4832b5590c1ac6e632462ee94d942fc7c96ac2232839`

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
  "createCounter(address,uint256)(address)" \
  0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 42 \
  --rpc-url localhost:8545 --private-key <YOUR-ANVIL-PK>

// Logs expected in after this call with topics for each emited event
// and there you will find the contract addresses
````

## Block 9

SHA-256: `9d4a9e92416671174f06884cca4fd5d5d41743b5567707d85e97e832b3ea6388`

````text
363d3d373d3d3d363d73<20-byte-impl>5af43d82803e903d91602b57fd5bf3

// <20-byte-impl> can be: 0xbebebebebe.... (the shared logic address)
````

## Block 10

SHA-256: `6f8e419fef9c9963d322e8124e3ff01e7674fbd1728dc608e0022d503a655718`

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
        require(!_initialized, "already initialized");
        _initialized = true;
        owner = _owner;
        value = start;
    }

    function inc() external {
        require(msg.sender == owner, "not owner");
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
            hex"3d602d80600a3d3981f3",
            hex"363d3d373d3d3d363d73",
            impl,
            hex"5af43d82803e903d91602b57fd5bf3"
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
        // Initialize immediately (constructors don't run through clones)
        (bool ok, ) = clone.call(abi.encodeWithSignature("initialize(address,uint256)", owner_, start_));
        require(ok, "init failed");
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
        (bool ok, ) = clone.call(abi.encodeWithSignature("initialize(address,uint256)", owner_, start_));
        require(ok, "init failed");
        emit CloneCreated(clone, owner_, start_, salt);
    }
}
````

## Block 11

SHA-256: `50bc66d8aae5ae9020e15d53a103ddf91de202b3af5aeb3fd124b6861cdd2405`

````text
anvil
````

## Block 12

SHA-256: `ae4fa3ed03ed8b2f9ee32d996f679ba380a32147814fdd030832cd0f944ec142`

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

## Block 13

SHA-256: `39e44b56c140589015f6b4dd8ad383089295bed246f6ece2f973b4262d396f18`

````text
// Deploy first instance
cast send 0x0165878A594ca255338adfa4d48449f69242Eb8F \
  "createClone(address,address,uint256)(address)" \
  0x5FC8d32690cc91D4c39d9d3abcBD16989F875707 <YOUR-ANVIL-PK-ADDR> 100 \  
  --rpc-url localhost:8545 \
  --private-key <YOUR-ANVIL-PK>

// On success expected this log:
// logs [
// {"address":"0x0165878a594ca255338adfa4d48449f69242eb8f",
//    "topics":["0x6823f533242a9c540bd8ab230da11a7199723745abb9d484732bb57b4f34d4d1",
//              "0x0000000000000000000000003b02ff1e626ed7a8fd6ec5299e2c54e1421b626b",
//              "0x000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266"],
//              "data":"0x00000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000000",
//              "blockHash":"0xe7748e4f28f2492642e9f64e7252fd40e85079e5211523b7b5b35c82adceff69","blockNumber":"0x8","blockTimestamp":"0x68b92822","transactionHash":"0xe48d780a8268235887019e74d62e09a7e09164aaa37bdea60a2c0aa97f81d00c",
//              "transactionIndex":"0x0",
//              "logIndex":"0x0",
//              "removed":false}]
// 
// From logs we can see that the address is: 0x3b02ff1e626ed7a8fd6ec5299e2c54e1421b626b

// Deploy second instance
cast send 0x0165878A594ca255338adfa4d48449f69242Eb8F \
  "createClone(address,address,uint256)(address)" \
  0x5FC8d32690cc91D4c39d9d3abcBD16989F875707 <YOUR-ANVIL-PK-ADDR> 100 \
  --rpc-url localhost:8545 \
  --private-key <YOUR-ANVIL-PK>

// On success expected this log:
// [{"address":"0x0165878a594ca255338adfa4d48449f69242eb8f",
//   "topics":["0x6823f533242a9c540bd8ab230da11a7199723745abb9d484732bb57b4f34d4d1",
//   "0x000000000000000000000000ba12646cc07adbe43f8bd25d83fb628d29c8a762" ....
//
// From logs we can see that the address is: 0xba12646cc07adbe43f8bd25d83fb628d29c8a762
````

## Block 14

SHA-256: `f4b9dc7caa5f2538585d42f398b46107af1ad305db7a2b632b089715be891654`

````text
// Read the value of the first proxy
cast call 0x3b02ff1e626ed7a8fd6ec5299e2c54e1421b626b "value()(uint256)" --rpc-url localhost:8545
// Expected output: 100

// Read the value of the first proxy
cast call 0xba12646cc07adbe43f8bd25d83fb628d29c8a762 "value()(uint256)" --rpc-url localhost:8545
// Expected output: 100

// Write operation on first contract
cast send 0x3b02ff1e626ed7a8fd6ec5299e2c54e1421b626b "inc()" \
  --rpc-url http://localhost:8545 \
  --private-key <YOUR-ANVIL-PK>

// Read the value of the first proxy
cast call 0x3b02ff1e626ed7a8fd6ec5299e2c54e1421b626b "value()(uint256)" --rpc-url localhost:8545
// Expected output: 101

// Read the value of the first proxy
cast call 0xba12646cc07adbe43f8bd25d83fb628d29c8a762 "value()(uint256)" --rpc-url localhost:8545
// Expected output: 100
````
