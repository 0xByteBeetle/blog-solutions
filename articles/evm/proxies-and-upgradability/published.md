# Published examples

Source: https://andreyobruchkov1996.substack.com/p/proxies-and-upgradability

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `8ca8d451f31cd28b334d32dea62bf4624c321bdab9378a77aa35ef62e7464e6b`

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
        require(!_initialized, “already initialized”);
        _initialized = true;
        number = n;
        ownerName = who;
    }
    function setNumber(uint256 n) external {
        number = n;
    }
}
````

## Block 2

SHA-256: `4008a73374502dd71556615f7f9603caab2826b91d575bf7010af7e7f044fd29`

````text
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import “./StorageV1.sol”;
contract StorageV2 is StorageV1 {
    // new vars only at the end
    string public note;
    function setNote(string calldata s) external { note = s; }
    function double() external view returns (uint256) { return number * 2; }
}
````

## Block 3

SHA-256: `76ffc1820c51c632fd745b0b3b2a1e7a6f84ab9def820c25c1832cf3578ead23`

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
    // data         - “constructor” for the logic contract
    constructor(address logic, address initialAdmin, bytes memory data) payable {
        require(_isContract(logic), “Proxy: logic not a contract”);
        require(initialAdmin != address(0), “Proxy: admin zero”);
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
        require(newAdmin != address(0), “Proxy: admin zero”);
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
        require(msg.sender != _admin(), “Transparent: admin cannot fallback”);
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
        require(_isContract(newImpl), “Proxy: new impl not a contract”);
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

## Block 4

SHA-256: `50bc66d8aae5ae9020e15d53a103ddf91de202b3af5aeb3fd124b6861cdd2405`

````text
anvil
````

## Block 5

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

## Block 6

SHA-256: `5e3ce03c4cf43953826de75b1a940e2b3da7d1207e936d7a522cf7063405f56c`

````text
// Previuosly deployed contract
IMPL=0x5FbDB2315678afecb367f032d93F642f64180aa3
// ADMIN is the second address given by anvil, you can use any other admin
// for the sake of simplicity we will use this address
ADMIN=0x70997970C51812dc3A010C7d01b50e0d17dc79C8

# Build FULL calldata (selector + args)
# “constructor” of the logic contract
INIT_DATA=$(cast calldata “initialize(uint256,string)” 42 “some-owner”)
// --private-key - in this case is the private key of the ADMIN we provided previously
// but any other deployer could be used
forge create src/TransparentProxy1967.sol:TransparentProxy1967 \
  --rpc-url http://127.0.0.1:8545 \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --broadcast \
  --constructor-args $IMPL $ADMIN “$INIT_DATA”
// Output should look like that:
// [⠊] Compiling...
// No files changed, compilation skipped
// Deployer: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
// Deployed to: 0x8464135c8F25Da09e49BC8782676a84730C318bC
// Transaction hash: 0x389ad3d17e7d8fe850c9325247cd3bd6d9c7bcd59757a73246656d56fb9425c3
````

## Block 7

SHA-256: `1ee90028f2cbd2b72a5bfcfd6d88bda03871b4fd74a0167cd3d9e6e3920c27e1`

````text
# read via proxy (uses delegatecall)
cast call 0x8464135c8F25Da09e49BC8782676a84730C318bC “number()(uint256)” --rpc-url http://127.0.0.1:8545
cast call 0x8464135c8F25Da09e49BC8782676a84730C318bC “ownerName()(string)” --rpc-url http://127.0.0.1:8545

// Output should look like:
// 42
// “some-owner”
# write via proxy
cast send 0x8464135c8F25Da09e49BC8782676a84730C318bC “setNumber(uint256)” 77 --private-key <YOUR-PRIVATE-KEY> --rpc-url http://127.0.0.1:8545
# Check that it worked
cast call 0x8464135c8F25Da09e49BC8782676a84730C318bC “number()(uint256)” --rpc-url http://127.0.0.1:8545
// Expected output: 77
````

## Block 8

SHA-256: `ad3c5e1ebe4e1113318d9a92a3bfa630290fc17d3d56a4e32791b5bd4a81a261`

````text
# this reverts: “Transparent: admin cannot fallback”
cast call 0x8464135c8F25Da09e49BC8782676a84730C318bC “number()(uint256)” --from 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --rpc-url http://127.0.0.1:8545

// Expected output:
// server returned an error response: error code 3: execution reverted: Transparent: admin cannot fallback...
````

## Block 9

SHA-256: `301713bc328fc8e5b2c3ea0b4a8b50846908f027c890d3759fd26f26a59faa32`

````text
# admin slot (last 20 bytes)
cast storage 0x8464135c8F25Da09e49BC8782676a84730C318bC 0xB53127684A568B3173AE13B9F8A6016E243E63B6E8EE1178D6A717850B5D6103 --rpc-url http://127.0.0.1:8545

# logic contract address slot (last 20 bytes)
cast storage 0x8464135c8F25Da09e49BC8782676a84730C318bC 0x360894A13BA1A3210667C828492DB98DCA3E2076CC3735A920A3CA505D382BBC --rpc-url http://127.0.0.1:8545
// Expected outputs:
// 0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8
// 0x0000000000000000000000005fbdb2315678afecb367f032d93f642f64180aa3
````

## Block 10

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

## Block 11

SHA-256: `e695126550a8075372b91eff3b3de65f08d16fadb3dcad0eb23ffd5faec407e3`

````text
cast send 0x8464135c8F25Da09e49BC8782676a84730C318bC “upgradeTo(address)” 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 --from 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --rpc-url http://127.0.0.1:8545 --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
````
