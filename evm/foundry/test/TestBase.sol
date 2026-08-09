// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface Vm {
    struct Log {
        bytes32[] topics;
        bytes data;
        address emitter;
    }

    function addr(uint256 privateKey) external returns (address);
    function deal(address account, uint256 balance) external;
    function expectRevert() external;
    function expectRevert(bytes calldata revertData) external;
    function expectRevert(bytes4 selector) external;
    function getNonce(address account) external view returns (uint64);
    function load(address target, bytes32 slot) external view returns (bytes32);
    function prank(address sender) external;
    function recordLogs() external;
    function getRecordedLogs() external returns (Log[] memory);
}

abstract contract TestBase {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function assertTrue(bool value) internal pure {
        require(value, "assertTrue failed");
    }

    function assertFalse(bool value) internal pure {
        require(!value, "assertFalse failed");
    }

    function assertEq(uint256 left, uint256 right) internal pure {
        require(left == right, "uint values differ");
    }

    function assertEq(int256 left, int256 right) internal pure {
        require(left == right, "int values differ");
    }

    function assertEq(address left, address right) internal pure {
        require(left == right, "addresses differ");
    }

    function assertEqBytes4(bytes4 left, bytes4 right) internal pure {
        require(left == right, "bytes4 values differ");
    }

    function assertEq(bytes32 left, bytes32 right) internal pure {
        require(left == right, "bytes32 values differ");
    }

    function assertEq(bytes memory left, bytes memory right) internal pure {
        require(keccak256(left) == keccak256(right), "byte arrays differ");
    }

    function assertEq(string memory left, string memory right) internal pure {
        require(keccak256(bytes(left)) == keccak256(bytes(right)), "strings differ");
    }
}
