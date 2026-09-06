// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ExampleFacet {
    uint256 internal counter;

    function increment() external { unchecked { counter++; } }
    function getCounter() external view returns (uint256) { return counter; }
}
