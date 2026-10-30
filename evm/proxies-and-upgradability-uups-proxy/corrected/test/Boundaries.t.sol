// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import {GuardedToken} from "../src/GuardedToken.sol";
import {MyToken} from "original-uups/UUPSLogicContract.sol";
import {UUPSProxy} from "original-uups/UUPSProxy.sol";

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

}
