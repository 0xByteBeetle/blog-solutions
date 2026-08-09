// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { TestBase } from "./TestBase.sol";
import {
    StorageExample,
    CalldataInspector,
    CallTarget,
    CallHarness
} from "../src/Internals.sol";

contract InternalsTest is TestBase {
    function testFunctionSelectorMatchesFirstFourBytesOfKeccak() public pure {
        bytes4 expected = bytes4(keccak256("set(uint256)"));
        assertTrue(StorageExample.set.selector == expected);
        assertTrue(expected == bytes4(0x60fe47b1));
    }

    function testAbiEncodingForDynamicStructCanBeDecoded() public {
        StorageExample target = new StorageExample();
        StorageExample.Record memory input = StorageExample.Record({number: 25, owner: "bob"});
        bytes memory calldataBytes = abi.encodeCall(StorageExample.store, (input));

        assertEqBytes4(bytes4(calldataBytes), StorageExample.store.selector);
        assertEq(calldataBytes.length, 164);

        target.store(input);
        StorageExample.Record memory result = target.retrieve();
        assertEq(result.number, 25);
        assertEq(result.owner, "bob");
    }

    function testUnknownSelectorReachesFallbackWithOriginalCalldata() public {
        CalldataInspector inspector = new CalldataInspector();
        bytes memory input = hex"deadbeef11223344";

        (bool ok, bytes memory result) = address(inspector).call(input);
        assertTrue(ok);
        assertEqBytes4(inspector.lastSelector(), 0xdeadbeef);
        assertEq(inspector.getLastCalldata(), input);

        (bytes4 selector, uint256 length, uint256 sentValue) = abi.decode(
            result,
            (bytes4, uint256, uint256)
        );
        assertEqBytes4(selector, 0xdeadbeef);
        assertEq(length, 8);
        assertEq(sentValue, 0);
    }

    function testEmptyCalldataUsesReceive() public {
        CalldataInspector inspector = new CalldataInspector();
        vm.deal(address(this), 1 ether);

        (bool ok,) = address(inspector).call{value: 0.25 ether}("");
        assertTrue(ok);
        assertEq(inspector.received(), 0.25 ether);
    }

    function testCallChangesTargetStorageAndPreservesCallerAsSender() public {
        CallTarget target = new CallTarget();
        CallHarness harness = new CallHarness();

        uint256 returned = harness.callSet(address(target), 41);
        assertEq(returned, 42);
        assertEq(target.number(), 41);
        assertEq(target.observedSender(), address(harness));
        assertEq(harness.number(), 0);
    }

    function testDelegatecallRunsTargetCodeAgainstCallerStorage() public {
        CallTarget target = new CallTarget();
        CallHarness harness = new CallHarness();

        uint256 returned = harness.delegateSet(address(target), 99);
        assertEq(returned, 100);
        assertEq(harness.number(), 99);
        assertEq(harness.observedSender(), address(this));
        assertEq(target.number(), 0);
    }

    function testStaticcallReadsWithoutChangingState() public {
        CallTarget target = new CallTarget();
        target.setNumber(77);
        CallHarness harness = new CallHarness();

        assertEq(harness.staticRead(address(target)), 77);
    }

    function testLowLevelCallBubblesOriginalRevertData() public {
        CallTarget target = new CallTarget();
        CallHarness harness = new CallHarness();

        vm.expectRevert(abi.encodeWithSignature("Error(string)", "target failed"));
        harness.callAndBubble(address(target));
    }

    receive() external payable {}
}
