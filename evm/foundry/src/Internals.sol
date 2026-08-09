// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract StorageExample {
    struct Record {
        uint256 number;
        string owner;
    }

    Record private record;
    uint256 public value;

    function store(Record calldata next) external {
        record = next;
    }

    function retrieve() external view returns (Record memory) {
        return record;
    }

    function set(uint256 next) external {
        value = next;
    }
}

contract CalldataInspector {
    bytes4 public lastSelector;
    bytes public lastCalldata;
    uint256 public received;

    receive() external payable {
        received += msg.value;
    }

    fallback(bytes calldata input) external payable returns (bytes memory) {
        lastSelector = msg.sig;
        lastCalldata = input;
        received += msg.value;
        return abi.encode(msg.sig, input.length, msg.value);
    }

    function getLastCalldata() external view returns (bytes memory) {
        return lastCalldata;
    }
}

contract CallTarget {
    uint256 public number;
    address public observedSender;
    uint256 public observedValue;

    function setNumber(uint256 next) external payable returns (uint256) {
        number = next;
        observedSender = msg.sender;
        observedValue = msg.value;
        return next + 1;
    }

    function readNumber() external view returns (uint256) {
        return number;
    }

    function failWithReason() external pure {
        revert("target failed");
    }
}

contract CallHarness {
    uint256 public number;
    address public observedSender;
    uint256 public observedValue;

    function callSet(address target, uint256 next) external payable returns (uint256) {
        (bool ok, bytes memory result) = target.call{value: msg.value}(
            abi.encodeCall(CallTarget.setNumber, (next))
        );
        if (!ok) _bubble(result);
        return abi.decode(result, (uint256));
    }

    function delegateSet(address target, uint256 next) external payable returns (uint256) {
        (bool ok, bytes memory result) = target.delegatecall(
            abi.encodeCall(CallTarget.setNumber, (next))
        );
        if (!ok) _bubble(result);
        return abi.decode(result, (uint256));
    }

    function staticRead(address target) external view returns (uint256) {
        (bool ok, bytes memory result) = target.staticcall(
            abi.encodeCall(CallTarget.readNumber, ())
        );
        if (!ok) _bubble(result);
        return abi.decode(result, (uint256));
    }

    function callAndBubble(address target) external {
        (bool ok, bytes memory result) = target.call(
            abi.encodeCall(CallTarget.failWithReason, ())
        );
        if (!ok) _bubble(result);
    }

    function _bubble(bytes memory reason) private pure {
        assembly {
            revert(add(reason, 0x20), mload(reason))
        }
    }
}
