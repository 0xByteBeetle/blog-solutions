// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ExampleFacetV2 {
    uint256 public counter;

    function increment() external {
        counter++;
    }

    function getCounter() external view returns (uint256) {
        return counter;
    }

    // New functionality!
    function decrement() external {
        require(counter > 0, "already zero");
        counter--;
    }
}
