// Supplemental tests for the article's unchanged MiniExample contract.
pragma solidity 0.8.30;
import {MiniExample} from "../src/MiniExample.sol";

contract MiniExampleTest {
    function testSelectorAndEncodedArgument() public {
        bytes memory input = abi.encodeWithSignature("set(uint256)", uint256(69420));
        require(bytes4(input) == bytes4(0x60fe47b1), "selector");
        require(input.length == 36, "4-byte selector plus 32-byte argument");
        require(keccak256(input) == keccak256(hex"60fe47b10000000000000000000000000000000000000000000000000000000000010f2c"), "calldata bytes");
    }
    function testEncodedCallUpdatesStorage() public {
        MiniExample example = new MiniExample();
        require(example.get() == 0, "initial storage");
        (bool ok,) = address(example).call(abi.encodeWithSignature("set(uint256)", uint256(69420)));
        require(ok && example.get() == 69420, "decoded set call");
    }
    function testUnknownSelectorReverts() public {
        MiniExample example = new MiniExample();
        (bool ok,) = address(example).call(hex"ffffffff");
        require(!ok && example.get() == 0, "unknown selector");
    }
    function testMissingArgumentReverts() public {
        MiniExample example = new MiniExample();
        (bool ok,) = address(example).call(hex"60fe47b1");
        require(!ok && example.get() == 0, "missing argument");
    }
}
