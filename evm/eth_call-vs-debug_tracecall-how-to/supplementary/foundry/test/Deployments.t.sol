// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { TestBase } from "./TestBase.sol";
import {
    CreatedStorage,
    CreateFactory,
    CloneLogic,
    MinimalCloneFactory,
    StorageV1,
    StorageV2,
    TransparentProxy,
    UUPSLogicV1,
    UUPSLogicV2,
    ERC1967Proxy
} from "../src/Deployments.sol";

contract DeploymentsTest is TestBase {
    address internal alice = address(0xA11CE);

    function testCreateAddressDependsOnFactoryAndNonce() public {
        CreateFactory factory = new CreateFactory();
        uint64 nonce = vm.getNonce(address(factory));
        assertTrue(nonce > 0 && nonce < 128);

        address expected = address(uint160(uint256(keccak256(abi.encodePacked(
            hex"d6",
            hex"94",
            address(factory),
            bytes1(uint8(nonce))
        )))));
        address deployed = factory.deployCreate(7);

        assertEq(deployed, expected);
        assertEq(CreatedStorage(deployed).constructorValue(), 7);
    }

    function testCreate2AddressIncludesSaltAndInitCodeHash() public {
        CreateFactory factory = new CreateFactory();
        bytes32 salt = keccak256("article-example");
        address expected = factory.create2Address(42, salt);
        address deployed = factory.deployCreate2(42, salt);

        assertEq(deployed, expected);
        assertEq(CreatedStorage(deployed).constructorValue(), 42);
    }

    function testMinimalClonesShareCodeButKeepIndependentStorage() public {
        CloneLogic implementation = new CloneLogic();
        MinimalCloneFactory factory = new MinimalCloneFactory();
        address first = factory.cloneAndInitialize(address(implementation), address(this), 10);
        address second = factory.cloneAndInitialize(address(implementation), address(this), 20);

        assertEq(first.code.length, 45);
        assertEq(second.code.length, 45);
        assertEq(CloneLogic(first).value(), 10);
        assertEq(CloneLogic(second).value(), 20);

        CloneLogic(first).setValue(99);
        assertEq(CloneLogic(first).value(), 99);
        assertEq(CloneLogic(second).value(), 20);
        assertEq(implementation.value(), 0);
    }

    function testTransparentProxySeparatesAdminAndUserPaths() public {
        StorageV1 logicV1 = new StorageV1();
        StorageV2 logicV2 = new StorageV2();
        TransparentProxy proxy = new TransparentProxy(
            address(logicV1),
            address(this),
            abi.encodeCall(StorageV1.initialize, (alice, 5))
        );

        vm.expectRevert(TransparentProxy.AdminCannotFallback.selector);
        StorageV1(address(proxy)).value();

        vm.prank(alice);
        assertEq(StorageV1(address(proxy)).value(), 5);

        proxy.upgradeTo(address(logicV2));
        vm.prank(alice);
        StorageV2(address(proxy)).increment();
        vm.prank(alice);
        assertEq(StorageV2(address(proxy)).value(), 6);
        vm.prank(alice);
        assertEq(StorageV2(address(proxy)).version(), 2);
    }

    function testUUPSUpgradeRunsAuthorizationInImplementation() public {
        UUPSLogicV1 logicV1 = new UUPSLogicV1();
        UUPSLogicV2 logicV2 = new UUPSLogicV2();
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(logicV1),
            abi.encodeCall(UUPSLogicV1.initialize, (address(this), 11))
        );

        UUPSLogicV1(address(proxy)).upgradeTo(address(logicV2));
        UUPSLogicV2(address(proxy)).doubleValue();

        assertEq(UUPSLogicV2(address(proxy)).value(), 22);
        assertEq(UUPSLogicV2(address(proxy)).version(), 2);
    }

    function testUUPSRejectsUpgradeFromNonOwner() public {
        UUPSLogicV1 logicV1 = new UUPSLogicV1();
        UUPSLogicV2 logicV2 = new UUPSLogicV2();
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(logicV1),
            abi.encodeCall(UUPSLogicV1.initialize, (address(this), 1))
        );

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSignature("Error(string)", "not owner"));
        UUPSLogicV1(address(proxy)).upgradeTo(address(logicV2));
    }
}
