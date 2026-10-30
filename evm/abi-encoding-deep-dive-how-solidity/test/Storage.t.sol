pragma solidity 0.8.12;

import "../src/Storage.sol";

// Supplemental tests: no forge-std, libraries, RPC, or deployment keys.
contract StorageTest {
    function testDefaultValue() public {
        Storage s = new Storage();
        Storage.my_storage_struct memory value = s.retrieve();
        require(value.number == 0 && bytes(value.owner).length == 0, "default");
    }

    function decodeFlat(bytes memory data) external pure returns (uint256, string memory) {
        return abi.decode(data, (uint256, string));
    }

    function testArticleWordsAndReturnData() public {
        Storage s = new Storage();
        require(s.store.selector == 0xddd356b3 && s.retrieve.selector == 0x2e64cec1, "canonical selectors");
        // Independently written words for the article's 123456789 / bob example.
        // String offset 0x40 is relative to the tuple, after the outer 0x20 offset.
        bytes memory body = hex"0000000000000000000000000000000000000000000000000000000000000020"
            hex"00000000000000000000000000000000000000000000000000000000075bcd15"
            hex"0000000000000000000000000000000000000000000000000000000000000040"
            hex"0000000000000000000000000000000000000000000000000000000000000003"
            hex"626f620000000000000000000000000000000000000000000000000000000000";
        bytes memory input = abi.encodePacked(hex"ddd356b3", body);
        require(input.length == 164, "selector plus five words");
        require(keccak256(input) == keccak256(abi.encodeWithSelector(s.store.selector, Storage.my_storage_struct(123456789, "bob"))), "compiler agrees with literal calldata");
        (bool ok, bytes memory result) = address(s).call(input);
        require(ok && result.length == 0, "store calldata");
        (ok, result) = address(s).staticcall(hex"2e64cec1");
        require(ok && result.length == 160, "retrieve returns five words without selector");
        require(keccak256(result) == keccak256(body), "actual return matches independently written words");
        Storage.my_storage_struct memory decoded = abi.decode(result, (Storage.my_storage_struct));
        require(decoded.number == 123456789 && keccak256(bytes(decoded.owner)) == keccak256("bob"), "decoded single dynamic tuple");
        (ok,) = address(this).call(abi.encodeWithSelector(this.decodeFlat.selector, result));
        require(!ok, "raw result is one tuple, not two top-level outputs");
        (ok,) = address(s).call(abi.encodePacked(hex"ddd456b3", body));
        require(!ok && s.retrieve().number == 123456789, "article prose selector typo cannot call store");
    }

    function testOverwriteWithDynamicStringAndEmptyString() public {
        Storage s = new Storage();
        string memory longName = "A dynamic string longer than one ABI word, with trailing text.";
        s.store(Storage.my_storage_struct(type(uint256).max, longName));
        Storage.my_storage_struct memory value = s.retrieve();
        require(value.number == type(uint256).max, "uint256 boundary");
        require(keccak256(bytes(value.owner)) == keccak256(bytes(longName)), "long string");
        s.store(Storage.my_storage_struct(0, ""));
        value = s.retrieve();
        require(value.number == 0 && bytes(value.owner).length == 0, "overwrite");
    }

    function testTruncatedCalldataRejected() public {
        Storage s = new Storage();
        (bool ok,) = address(s).call(abi.encodePacked(s.store.selector));
        require(!ok, "missing tuple must revert");
    }
}
