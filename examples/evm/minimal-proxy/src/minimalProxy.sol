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
