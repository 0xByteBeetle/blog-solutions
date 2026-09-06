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
