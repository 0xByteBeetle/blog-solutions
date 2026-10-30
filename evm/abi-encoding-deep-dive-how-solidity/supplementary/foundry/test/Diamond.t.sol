// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { TestBase } from "./TestBase.sol";
import {
    Diamond,
    IDiamondCut,
    CounterFacetV1,
    CounterFacetV2
} from "../src/Diamond.sol";

interface ICounterFacet {
    function increment() external;
    function counter() external view returns (uint256);
}

contract DiamondTest is TestBase {
    function testAddReplaceAndRemoveSelectors() public {
        Diamond diamond = new Diamond(address(this));
        CounterFacetV1 v1 = new CounterFacetV1();
        CounterFacetV2 v2 = new CounterFacetV2();

        bytes4[] memory selectors = new bytes4[](2);
        selectors[0] = ICounterFacet.increment.selector;
        selectors[1] = ICounterFacet.counter.selector;
        IDiamondCut.FacetCut[] memory cuts = new IDiamondCut.FacetCut[](1);
        cuts[0] = IDiamondCut.FacetCut({
            facet: address(v1),
            action: IDiamondCut.Action.Add,
            selectors: selectors
        });
        diamond.diamondCut(cuts);

        ICounterFacet(address(diamond)).increment();
        assertEq(ICounterFacet(address(diamond)).counter(), 1);
        assertEq(diamond.facetAddress(ICounterFacet.increment.selector), address(v1));

        bytes4[] memory incrementOnly = new bytes4[](1);
        incrementOnly[0] = ICounterFacet.increment.selector;
        cuts[0] = IDiamondCut.FacetCut({
            facet: address(v2),
            action: IDiamondCut.Action.Replace,
            selectors: incrementOnly
        });
        diamond.diamondCut(cuts);

        ICounterFacet(address(diamond)).increment();
        assertEq(ICounterFacet(address(diamond)).counter(), 11);
        assertEq(diamond.facetAddress(ICounterFacet.increment.selector), address(v2));

        cuts[0] = IDiamondCut.FacetCut({
            facet: address(0),
            action: IDiamondCut.Action.Remove,
            selectors: incrementOnly
        });
        diamond.diamondCut(cuts);

        vm.expectRevert(
            abi.encodeWithSelector(
                Diamond.SelectorDoesNotExist.selector,
                ICounterFacet.increment.selector
            )
        );
        ICounterFacet(address(diamond)).increment();
    }

    function testOnlyOwnerCanCut() public {
        Diamond diamond = new Diamond(address(this));
        CounterFacetV1 facet = new CounterFacetV1();
        bytes4[] memory selectors = new bytes4[](1);
        selectors[0] = ICounterFacet.increment.selector;
        IDiamondCut.FacetCut[] memory cuts = new IDiamondCut.FacetCut[](1);
        cuts[0] = IDiamondCut.FacetCut({
            facet: address(facet),
            action: IDiamondCut.Action.Add,
            selectors: selectors
        });

        vm.expectRevert(Diamond.NotOwner.selector);
        vm.prank(address(0xB0B));
        diamond.diamondCut(cuts);
    }
}
