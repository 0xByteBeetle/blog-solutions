// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./StorageV1.sol";
contract StorageV2 is StorageV1 {
    // new vars only at the end
    string public note;
    function setNote(string calldata s) external { note = s; }
    function double() external view returns (uint256) { return number * 2; }
}
