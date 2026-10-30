// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {GuardedToken} from "../src/GuardedToken.sol";
import {MyToken} from "original-uups/UUPSLogicContract.sol";
import {UUPSProxy} from "original-uups/UUPSProxy.sol";
import {Storage} from "original-storage/Storage.sol";

// Separate caller without cheatcodes, wallets, RPC, or forge-std.
contract OtherCaller {
    function attempt(address target, bytes calldata data) external returns (bool, bytes memory) {
        return target.call(data);
    }
}

contract BoundaryTests {
    function testOriginalAllowsReinitialization() public {
        MyToken logic = new MyToken();
        UUPSProxy proxy = new UUPSProxy(abi.encodeWithSignature("constructor1(uint256)", 100), address(logic));
        MyToken token = MyToken(address(proxy));
        OtherCaller other = new OtherCaller();
        (bool ok,) = other.attempt(address(proxy), abi.encodeWithSignature("constructor1(uint256)", 7));
        require(ok, "original behavior changed");
        require(token.totalSupply() == 7 && token.tokens(address(other)) == 7, "reset not reproduced");
        // Original allocation remains, demonstrating why reset is not a valid fresh issuance.
        require(token.tokens(address(this)) == 100, "original balance changed");
    }

    function testCorrectedRejectsReinitializationAndRetainsOwner() public {
        GuardedToken logic = new GuardedToken();
        UUPSProxy proxy = new UUPSProxy(abi.encodeWithSignature("constructor1(uint256)", 100), address(logic));
        GuardedToken token = GuardedToken(address(proxy));
        OtherCaller other = new OtherCaller();
        (bool ok, bytes memory reason) = other.attempt(address(proxy), abi.encodeWithSignature("constructor1(uint256)", 7));
        require(!ok, "reinitialization must fail");
        require(keccak256(reason) == keccak256(abi.encodeWithSignature("Error(string)", "Already initialized")), "wrong failure");
        require(token.initialized() && token.totalSupply() == 100, "initialization state changed");
        require(token.tokens(address(this)) == 100 && token.tokens(address(other)) == 0, "balances changed");
        (ok,) = address(token).call(abi.encodeWithSignature("constructor1(uint256)", 9));
        require(!ok, "even owner must not reinitialize");
        GuardedToken next = new GuardedToken();
        (ok,) = other.attempt(address(token), abi.encodeWithSignature("updateCode(address)", address(next)));
        require(!ok, "ownership must not change");
        token.updateCode(address(next));
        token.transfer(address(other), 10);
        require(token.totalSupply() == 100 && token.tokens(address(this)) == 90 && token.tokens(address(other)) == 10, "upgrade/transfer state mismatch");
    }

    function testStoredValuesRoundTripAndOverwrite() public {
        Storage target = new Storage();
        target.store(Storage.my_storage_struct(25, "bob"));
        check(target, 25, "bob");
        target.store(Storage.my_storage_struct(100, "a deliberately long owner string crossing a storage word"));
        check(target, 100, "a deliberately long owner string crossing a storage word");
        target.store(Storage.my_storage_struct(0, ""));
        check(target, 0, "");
    }

    function testRejectedStorePreservesBothFields() public {
        Storage target = new Storage();
        target.store(Storage.my_storage_struct(25, "bob"));
        (bool ok, bytes memory reason) = address(target).call(abi.encodeWithSelector(Storage.store.selector, Storage.my_storage_struct(101, "not bob")));
        require(!ok, "out-of-range value accepted");
        require(keccak256(reason) == keccak256(abi.encodeWithSignature("Error(string)", "Number too large")), "wrong failure");
        check(target, 25, "bob");
    }

    function check(Storage target, uint256 number, string memory owner) internal view {
        Storage.my_storage_struct memory actual = target.retrieve();
        require(actual.number == number, "stored number mismatch");
        require(keccak256(bytes(actual.owner)) == keccak256(bytes(owner)), "stored owner mismatch");
    }
}
