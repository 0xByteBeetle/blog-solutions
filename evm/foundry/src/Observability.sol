// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract EventToken {
    event Transfer(address indexed from, address indexed to, uint256 value);

    mapping(address account => uint256 balance) public balanceOf;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
}

contract NativeTransferVault {
    receive() external payable {}

    function forward(address payable recipient, uint256 amount) external {
        (bool ok,) = recipient.call{value: amount}("");
        require(ok, "native transfer failed");
    }
}

contract TokenMetadata {
    string public name;
    string public symbol;
    uint8 public immutable decimals;

    constructor(string memory name_, string memory symbol_, uint8 decimals_) {
        name = name_;
        symbol = symbol_;
        decimals = decimals_;
    }
}

contract StaticMulticall {
    struct Call {
        address target;
        bytes callData;
    }

    error CallFailed(uint256 index, bytes reason);

    function aggregate(Call[] calldata calls) external view returns (bytes[] memory results) {
        results = new bytes[](calls.length);
        for (uint256 index; index < calls.length; index++) {
            (bool ok, bytes memory result) = calls[index].target.staticcall(calls[index].callData);
            if (!ok) revert CallFailed(index, result);
            results[index] = result;
        }
    }
}
