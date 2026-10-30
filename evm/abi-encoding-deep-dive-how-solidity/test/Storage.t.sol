pragma solidity 0.8.12;

import "../src/Storage.sol";

// Supplemental tests: no forge-std, libraries, RPC, or deployment keys.
contract StorageTest {
    function testDefaultValue() public {
        Storage s = new Storage();
        Storage.my_storage_struct memory value = s.retrieve();
        require(value.number == 0 && bytes(value.owner).length == 0, "default");
    }

    function testTupleCalldataAndReturnEncoding() public {
        Storage s = new Storage();
        Storage.my_storage_struct memory value = Storage.my_storage_struct(42, "Alice");
        bytes memory input = abi.encodeWithSelector(bytes4(keccak256("store((uint256,string))")), value);
        (bool ok, bytes memory result) = address(s).call(input);
        require(ok && result.length == 0, "store calldata");
        (ok, result) = address(s).staticcall(abi.encodeWithSelector(s.retrieve.selector));
        require(ok, "retrieve");
        require(keccak256(result) == keccak256(abi.encode(value)), "return tuple encoding");
        Storage.my_storage_struct memory decoded = abi.decode(result, (Storage.my_storage_struct));
        require(decoded.number == 42 && keccak256(bytes(decoded.owner)) == keccak256("Alice"), "decoded");
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
