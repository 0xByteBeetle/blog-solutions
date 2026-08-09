// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { TestBase } from "./TestBase.sol";
import { TraceStore, TraceRouter } from "../src/Tracing.sol";

contract TracingTest is TestBase {
    function testStoreStructCreatesReadableTrace() public {
        TraceStore store = new TraceStore();
        TraceRouter router = new TraceRouter();
        router.routeStore(store, 25, "bob");

        TraceStore.Record memory record = store.retrieve();
        assertEq(record.number, 25);
        assertEq(record.owner, "bob");
    }

    function testStoreStructRevertsWithCustomError() public {
        TraceStore store = new TraceStore();
        TraceRouter router = new TraceRouter();

        vm.expectRevert(TraceStore.ZeroNumber.selector);
        router.routeStore(store, 0, "bob");
    }
}
