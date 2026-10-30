# Published examples

Source: https://andreyobruchkov1996.substack.com/p/understanding-contract-deployments-proxies-and-create2-part-1-696b0b11f8a5

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `f4a7e041f8d20a0176b6c16c79aefe9146f87b475be8339b8d8203f13fbbf3bc`

````text
address = keccak256(rlp(sender_address, sender_nonce))[12:]
````

## Block 2

SHA-256: `50bc66d8aae5ae9020e15d53a103ddf91de202b3af5aeb3fd124b6861cdd2405`

````text
anvil
````

## Block 3

SHA-256: `c8152b84a2e2c4b49db74921144f21d3b9ffc27e110e7e951df93aca8712d749`

````text
cast nonce <YOUR-ADDRESS> --rpc-url http://localhost:8545
````

## Block 4

SHA-256: `93b17e49936e02fd6bf9c08b5fabfa841436b8190e0dcc74cece1c70c99993e5`

````text
// <YOUR-ADDRESS> - can be address from anvil default addresses
cast compute-address <YOUR-ADDRESS> --nonce 1
Computed Address: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
````

## Block 5

SHA-256: `5e9290913b79ae5caf0103b4688ac6ac5cd1aee520db5155736685c63b440a74`

````text
address = keccak256( 0xff ++ sender ++ salt ++ keccak256(init_code) )[12:]
````

## Block 6

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

## Block 7

SHA-256: `bf2c370d58fe8e9cefe8307cdcf96b360239095f9dcc38c58c66cff917ffe515`

````text
forge inspect Storage bytecode
````

## Block 8

SHA-256: `e5e381edef9558eeb48acef1c5bb5af5f4212439dab6a6b6a41ee453ebd75c77`

````text
cast keccak $(forge inspect Storage bytecode)
````

## Block 9

SHA-256: `94214bfba2070c5d9ea075d21df3fa3f8c8e16ef3f632564da4c288f3c7b6d07`

````text
0x9e7ceb5009cf19fc3a77cbead52c79f881b81800108a8931565aa92f9f1f5b64
````

## Block 10

SHA-256: `668ed055bbb8475e36015643b1f4a3dfc807223217470cf78b5ad4d9c19a483b`

````text
0x0000000000000000000000000000000000000000000000000000000000000042
````

## Block 11

SHA-256: `7d81e08a56d00a5cd065b0e5da3929d5692eb2e3415afda08f67001da63b1d89`

````text
// <YOUR-ADDRESS> - can be address from anvil default addresses
cast compute-address <YOUR-ADDRESS>\
  --salt 0x0000000000000000000000000000000000000000000000000000000000000042 \
  --init-code-hash 0x9e7ceb5009cf19fc3a77cbead52c79f881b81800108a8931565aa92f9f1f5b64

Computed Address: 0x93eFaEdEe330e749D9AF79424398204EC04F89F1
````

## Block 12

SHA-256: `312bf18bbeec2c912d63a20f2f582d00cc2522ea1966900394ff5c6f3d7708b3`

````text
// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

contract StorageV1 {
    // IMPORTANT: storage lives in the proxy; layout must be stable across upgrades.
    uint256 public number;
    string public ownerName;

    bool private _initialized;

    // Will be initialized only once, you can use openzeppelin guard
    function initialize(uint256 n, string calldata who) external {
        require(!_initialized, "already initialized");
        _initialized = true;
        number = n;
        ownerName = who;
    }

    function setNumber(uint256 n) external {
        number = n;
    }
}
````

## Block 13

SHA-256: `35af57c149d48632f482bdc0304d6de9a149c3ef41ecbbe03449dc8a026636c6`

````text
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./StorageV1.sol";

contract StorageV2 is StorageV1 {
    // new vars only at the end
    string public note;

    function setNote(string calldata s) external { note = s; }
    function double() external view returns (uint256) { return number * 2; }
}
````

## Block 14

SHA-256: `7ead68e3fc5714cc6739f323cfbfdfd99c604d14338aa5c9dd99c66f70db743a`

````text
// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

/// @title Minimal Transparent Proxy (EIP-1967) – for education/demo
/// @notice Admin gets upgrade functions; non-admin callers are delegated to implementation.
///         Admin is blocked from fallback to avoid selector clashes.

contract TransparentProxy1967 {
    // EIP-1967 slots (implementation, admin)
    bytes32 private constant _IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    bytes32 private constant _ADMIN_SLOT =
        0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;

    event Upgraded(address indexed implementation);
    event AdminChanged(address previousAdmin, address newAdmin);

    // logic        - The address of the logic contract
    // initialAdmin - The admin of this proxy that can upgrade logic
    // data         - "constructor" for the logic contract
    constructor(address logic, address initialAdmin, bytes memory data) payable {
        require(_isContract(logic), "Proxy: logic not a contract");
        require(initialAdmin != address(0), "Proxy: admin zero");

        _setAddress(_ADMIN_SLOT, initialAdmin);
        _setAddress(_IMPLEMENTATION_SLOT, logic);

        // optional initializer call (acts like a constructor for the implementation)
        if (data.length > 0) {
            (bool ok, bytes memory err) = logic.delegatecall(data);
            require(ok, string(err));
        }
    }

    // -------- Admin control plane --------

    modifier ifAdmin() {
        if (msg.sender == _admin()) {
            _;
        } else {
            _fallback();
        }
    }

    function admin() external ifAdmin returns (address) { return _admin(); }

    function implementation() external ifAdmin returns (address) { return _implementation(); }

    function changeAdmin(address newAdmin) external ifAdmin {
        require(newAdmin != address(0), "Proxy: admin zero");
        emit AdminChanged(_admin(), newAdmin);
        _setAddress(_ADMIN_SLOT, newAdmin);
    }

    function upgradeTo(address newImplementation) external ifAdmin {
        _upgradeTo(newImplementation);
    }

    function upgradeToAndCall(address newImplementation, bytes calldata data) external payable ifAdmin {
        _upgradeTo(newImplementation);
        (bool ok, bytes memory err) = newImplementation.delegatecall(data);
        require(ok, string(err));
    }

    // -------- User surface (fallback/delegate) --------

    fallback() external payable { _fallback(); }
    receive() external payable { _fallback(); }

    function _fallback() internal {
        require(msg.sender != _admin(), "Transparent: admin cannot fallback");
        _delegate(_implementation());
    }

    function _delegate(address impl) internal {
        assembly {
            // 0x00–0x3f: scratch space the compiler may use temporarily.
            // Using memory at 0x00 is safe in this proxy fallback
            // because the assembly block never returns to Solidity.
            calldatacopy(0, 0, calldatasize())
            let ok := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch ok
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    // -------- Slot helpers & guards --------

    function _admin() internal view returns (address a) { a = _getAddress(_ADMIN_SLOT); }
    function _implementation() internal view returns (address a) { a = _getAddress(_IMPLEMENTATION_SLOT); }

    function _upgradeTo(address newImpl) internal {
        require(_isContract(newImpl), "Proxy: new impl not a contract");
        _setAddress(_IMPLEMENTATION_SLOT, newImpl);
        emit Upgraded(newImpl);
    }

    function _getAddress(bytes32 slot) internal view returns (address a) {
        assembly { a := sload(slot) }
    }

    function _setAddress(bytes32 slot, address a) internal {
        assembly { sstore(slot, a) }
    }

    function _isContract(address a) internal view returns (bool) {
        uint256 size; assembly { size := extcodesize(a) }
        return size > 0;
    }
}
````

## Block 15

SHA-256: `50bc66d8aae5ae9020e15d53a103ddf91de202b3af5aeb3fd124b6861cdd2405`

````text
anvil
````

## Block 16

SHA-256: `b4249f7212c7a9223e2aa80d6e9b0853c2313bb8e7a0fc2f348ce7e5d6552c18`

````text
forge create src/StorageV1.sol:StorageV1 --rpc-url http://localhost:8545 --private-key <PRIVATE-KEY-FROM-ANVIL> --broadcast

// Output will be:
// [⠊] Compiling...
// No files changed, compilation skipped
// Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// Deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
// Transaction hash: 0x35b7d8d461c60c3759ab08a733c2f66e5fd8e22656ca5e158b37eecec605a80e
````

## Block 17

SHA-256: `4acf2c0b4d2848aa1589a071822b97884f8485938a8588c644db4c0113a067ef`

````text
// Previuosly deployed contract
IMPL=0x5FbDB2315678afecb367f032d93F642f64180aa3
// ADMIN is the second address given by anvil, you can use any other admin
// for the sake of simplicity we will use this address
ADMIN=0x70997970C51812dc3A010C7d01b50e0d17dc79C8

# Build FULL calldata (selector + args)
# "constructor" of the logic contract
INIT_DATA=$(cast calldata "initialize(uint256,string)" 42 "some-owner")

// --private-key - in this case is the private key of the ADMIN we provided previously
// but any other deployer could be used
forge create src/TransparentProxy1967.sol:TransparentProxy1967 \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --broadcast \
  --constructor-args $IMPL $ADMIN "$INIT_DATA"

// Output should look like that:
// [⠊] Compiling...
// No files changed, compilation skipped
// Deployer: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
// Deployed to: 0x8464135c8F25Da09e49BC8782676a84730C318bC
// Transaction hash: 0x389ad3d17e7d8fe850c9325247cd3bd6d9c7bcd59757a73246656d56fb9425c3
````

## Block 18

SHA-256: `629a8d874defc9c920cba8970bb2ea16d9f3aed6e04f30a6e4dcc9594b822772`

````text
# read via proxy (uses delegatecall)
cast call 0x8464135c8F25Da09e49BC8782676a84730C318bC "number()(uint256)" --rpc-url http://127.0.0.1:8545
cast call 0x8464135c8F25Da09e49BC8782676a84730C318bC "ownerName()(string)" --rpc-url http://127.0.0.1:8545

// Output should look like:
// 42
// "some-owner"

# write via proxy
cast send 0x8464135c8F25Da09e49BC8782676a84730C318bC "setNumber(uint256)" 77 --private-key <YOUR-PRIVATE-KEY> --rpc-url http://127.0.0.1:8545

# Check that it worked
cast call 0x8464135c8F25Da09e49BC8782676a84730C318bC "number()(uint256)" --rpc-url http://127.0.0.1:8545

// Expected output: 77
````

## Block 19

SHA-256: `fdfd8cded5b28ce9f36f8691b52a4bb640d0a5810e0b4bd34d4c988e1673f6e9`

````text
# this reverts: "Transparent: admin cannot fallback"
cast call 0x8464135c8F25Da09e49BC8782676a84730C318bC "number()(uint256)" --from 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --rpc-url http://127.0.0.1:8545

// Expected output:
// server returned an error response: error code 3: execution reverted: Transparent: admin cannot fallback...
````

## Block 20

SHA-256: `cc94a5679f38ebf5b506d52299af8c8f9ad439b7a4d72e69cfa20a3bdc1aa06c`

````text
# admin slot (last 20 bytes)
cast storage 0x8464135c8F25Da09e49BC8782676a84730C318bC 0xB53127684A568B3173AE13B9F8A6016E243E63B6E8EE1178D6A717850B5D6103 --rpc-url http://127.0.0.1:8545

# logic contract address slot (last 20 bytes)
cast storage 0x8464135c8F25Da09e49BC8782676a84730C318bC 0x360894A13BA1A3210667C828492DB98DCA3E2076CC3735A920A3CA505D382BBC --rpc-url http://127.0.0.1:8545

// Expected outputs:
// 0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8
// 0x0000000000000000000000005fbdb2315678afecb367f032d93f642f64180aa3
````

## Block 21

SHA-256: `e8f1a0d2fb2f7e31b552c649445495f4c6390c1156d7070a95863b743f3c70b9`

````text
forge create src/StorageV2.sol:StorageV2 --rpc-url  http://127.0.0.1:8545 --private-key <YOUR-PRIVATE-KEY> --broadcast

// Output should be something like
// [⠊] Compiling...
// No files changed, compilation skipped
// Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// Deployed to: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
// Transaction hash: 0x80fd23c7145fff6853e17439b1e4d1332b41526a411dfaa842a4f985d55f936c
````

## Block 22

SHA-256: `6c9b7642458d7780a0a1c7266f2d5e423a7e77d22c41f96da043be3f497bd69b`

````text
cast send 0x8464135c8F25Da09e49BC8782676a84730C318bC "upgradeTo(address)" 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 --from 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --rpc-url http://127.0.0.1:8545 --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
````
