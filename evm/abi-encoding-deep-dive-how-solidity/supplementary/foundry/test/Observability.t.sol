// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { TestBase, Vm } from "./TestBase.sol";
import {
    EventToken,
    NativeTransferVault,
    TokenMetadata,
    StaticMulticall
} from "../src/Observability.sol";

contract ObservabilityTest is TestBase {
    function testEventTopicsAndDataMatchTheLogModel() public {
        EventToken token = new EventToken();
        address recipient = address(0xB0B);

        vm.recordLogs();
        token.mint(recipient, 125 ether);
        Vm.Log[] memory logs = vm.getRecordedLogs();

        assertEq(logs.length, 1);
        assertEq(logs[0].emitter, address(token));
        assertEq(logs[0].topics.length, 3);
        assertEq(logs[0].topics[0], keccak256("Transfer(address,address,uint256)"));
        assertEq(logs[0].topics[1], bytes32(uint256(uint160(address(0)))));
        assertEq(logs[0].topics[2], bytes32(uint256(uint160(recipient))));
        assertEq(abi.decode(logs[0].data, (uint256)), 125 ether);
    }

    function testNativeValueCanMoveWithoutAnEvent() public {
        NativeTransferVault vault = new NativeTransferVault();
        address recipient = address(0xCAFE);
        vm.deal(address(vault), 3 ether);

        vm.recordLogs();
        vault.forward(payable(recipient), 1 ether);
        Vm.Log[] memory logs = vm.getRecordedLogs();

        assertEq(logs.length, 0);
        assertEq(address(vault).balance, 2 ether);
        assertEq(recipient.balance, 1 ether);
    }

    function testMulticallReturnsSeveralReadResultsInOneCall() public {
        TokenMetadata token = new TokenMetadata("Chainlink", "LINK", 18);
        StaticMulticall multicall = new StaticMulticall();
        StaticMulticall.Call[] memory calls = new StaticMulticall.Call[](3);
        calls[0] = StaticMulticall.Call(address(token), abi.encodeCall(token.name, ()));
        calls[1] = StaticMulticall.Call(address(token), abi.encodeCall(token.symbol, ()));
        calls[2] = StaticMulticall.Call(address(token), abi.encodeCall(token.decimals, ()));

        bytes[] memory results = multicall.aggregate(calls);
        assertEq(abi.decode(results[0], (string)), "Chainlink");
        assertEq(abi.decode(results[1], (string)), "LINK");
        assertEq(abi.decode(results[2], (uint8)), 18);
    }
}
