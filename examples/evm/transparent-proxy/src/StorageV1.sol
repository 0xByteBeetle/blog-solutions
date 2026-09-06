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
