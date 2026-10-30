// Supplemental focused tests; the article contract remains unchanged.
pragma solidity ^0.8.12;
import {Storage} from "../src/Storage.sol";
contract StorageBehaviorTest {
    function testStoreAndOverwrite() public {
        Storage target = new Storage();
        target.store(Storage.my_storage_struct(25, "bob"));
        check(target, 25, "bob");
        target.store(Storage.my_storage_struct(100, "a string longer than one EVM storage word"));
        check(target, 100, "a string longer than one EVM storage word");
        target.store(Storage.my_storage_struct(0, ""));
        check(target, 0, "");
    }
    function testRejectedStorePreservesState() public {
        Storage target = new Storage();
        target.store(Storage.my_storage_struct(25, "bob"));
        (bool ok, bytes memory reason) = address(target).call(abi.encodeWithSelector(Storage.store.selector, Storage.my_storage_struct(101, "not bob")));
        require(!ok, "out-of-range accepted");
        require(keccak256(reason) == keccak256(abi.encodeWithSignature("Error(string)", "Number too large")), "wrong error");
        check(target, 25, "bob");
    }
    function check(Storage target, uint256 number, string memory owner) internal view {
        Storage.my_storage_struct memory actual = target.retrieve();
        require(actual.number == number, "number");
        require(keccak256(bytes(actual.owner)) == keccak256(bytes(owner)), "owner");
    }
}
