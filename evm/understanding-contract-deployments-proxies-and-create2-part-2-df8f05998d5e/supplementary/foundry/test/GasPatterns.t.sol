// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { TestBase } from "./TestBase.sol";
import {
    UnpackedStorage,
    PackedStorage,
    StorageReadPatterns,
    BatchCounter
} from "../src/GasPatterns.sol";

contract GasPatternsTest is TestBase {
    function testPackingUsesTwoSlotsInsteadOfThree() public {
        UnpackedStorage unpacked = new UnpackedStorage();
        PackedStorage packed = new PackedStorage();
        unpacked.set(11, 22, 33);
        packed.set(11, 22, 33);

        assertEq(uint256(vm.load(address(unpacked), bytes32(uint256(0)))), 11);
        assertEq(uint256(vm.load(address(unpacked), bytes32(uint256(1)))), 22);
        assertEq(uint256(vm.load(address(unpacked), bytes32(uint256(2)))), 33);

        uint256 packedSlot = uint256(vm.load(address(packed), bytes32(uint256(0))));
        assertEq(uint128(packedSlot), 11);
        assertEq(uint128(packedSlot >> 128), 33);
        assertEq(uint256(vm.load(address(packed), bytes32(uint256(1)))), 22);
    }

    function testCachingAStorageReadUsesLessGas() public {
        StorageReadPatterns patterns = new StorageReadPatterns();

        uint256 beforeRepeated = gasleft();
        uint256 repeated = patterns.fourStorageReads();
        uint256 repeatedGas = beforeRepeated - gasleft();

        uint256 beforeCached = gasleft();
        uint256 cached = patterns.oneStorageRead();
        uint256 cachedGas = beforeCached - gasleft();

        assertEq(repeated, 28);
        assertEq(cached, 28);
        assertTrue(cachedGas < repeatedGas);
    }

    function testBatchLoopUpdatesStorageOnce() public {
        BatchCounter counter = new BatchCounter();
        uint256[] memory values = new uint256[](4);
        values[0] = 3;
        values[1] = 5;
        values[2] = 8;
        values[3] = 13;

        counter.addAll(values);
        assertEq(counter.total(), 29);
    }
}
