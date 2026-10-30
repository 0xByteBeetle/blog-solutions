// Supplemental tests retain the original 0.4.25 ABI-decoder behavior.
pragma solidity 0.4.25;
import "../src/Example.sol";

contract LegacyCalldataTest {
    function testEncodedSetterAndGetter() public {
        Example example = new Example();
        require(example.get() == 0, "initial value");
        bytes memory input = abi.encodeWithSignature("set(uint256)", uint256(69420));
        require(input.length == 36, "selector and argument");
        require(address(example).call(input), "encoded call");
        require(example.get() == 69420, "decoded storage write");
    }

    function testLegacyShortArgumentIsZeroPadded() public {
        Example example = new Example();
        example.set(99);
        require(address(example).call(hex"60fe47b1"), "legacy decoder accepts selector only");
        require(example.get() == 0, "missing calldata word reads zero");
    }

    function testUnknownSelectorRevertsAndPreservesStorage() public {
        Example example = new Example();
        example.set(7);
        require(!address(example).call(hex"ffffffff"), "no fallback");
        require(example.get() == 7, "rejected call preserves storage");
    }
}
