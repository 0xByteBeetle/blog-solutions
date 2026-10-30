// Article-local tests for selector routing, cuts, shared state and ownership.
pragma solidity 0.8.30;
import {Diamond} from "../src/Diamond.sol";
import {LibDiamond} from "../src/LibDiamond.sol";
import {IDiamondCut} from "../src/interfaces/IDiamondCut.sol";
import {DiamondCutFacet} from "../src/facets/DiamondCutFacet.sol";
import {DiamondLoupeFacet} from "../src/facets/DiamondLoupeFacet.sol";
import {OwnershipFacet} from "../src/facets/OwnershipFacet.sol";
import {ExampleFacet} from "../src/facets/ExampleFacet.sol";
import {ExampleFacetV2} from "../src/facets/newFacet.sol";

contract OtherCaller {
    function attempt(address target, bytes calldata data) external returns (bool, bytes memory) { return target.call(data); }
}
contract DiamondTest {
    Diamond diamond;
    function setUp() public {
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](4);
        bytes4[] memory selectors = new bytes4[](1);
        selectors[0] = DiamondCutFacet.diamondCut.selector;
        cut[0] = IDiamondCut.FacetCut(address(new DiamondCutFacet()), IDiamondCut.FacetCutAction.Add, selectors);
        selectors = new bytes4[](1); selectors[0] = DiamondLoupeFacet.facetAddress.selector;
        cut[1] = IDiamondCut.FacetCut(address(new DiamondLoupeFacet()), IDiamondCut.FacetCutAction.Add, selectors);
        selectors = new bytes4[](2); selectors[0] = OwnershipFacet.owner.selector; selectors[1] = OwnershipFacet.transferOwnership.selector;
        cut[2] = IDiamondCut.FacetCut(address(new OwnershipFacet()), IDiamondCut.FacetCutAction.Add, selectors);
        selectors = new bytes4[](2); selectors[0] = ExampleFacet.increment.selector; selectors[1] = ExampleFacet.getCounter.selector;
        cut[3] = IDiamondCut.FacetCut(address(new ExampleFacet()), IDiamondCut.FacetCutAction.Add, selectors);
        diamond = new Diamond(address(this), cut, address(0), "");
    }

    function oneCut(address facet, IDiamondCut.FacetCutAction action, bytes4 selector) private pure returns (IDiamondCut.FacetCut[] memory cut) {
        bytes4[] memory selectors = new bytes4[](1); selectors[0] = selector;
        cut = new IDiamondCut.FacetCut[](1); cut[0] = IDiamondCut.FacetCut(facet, action, selectors);
    }

    function testNewFacetUsesExistingCounterStorage() public {
        ExampleFacet counter = ExampleFacet(address(diamond));
        counter.increment(); counter.increment();
        ExampleFacetV2 next = new ExampleFacetV2();
        IDiamondCut(address(diamond)).diamondCut(oneCut(address(next), IDiamondCut.FacetCutAction.Add, next.decrement.selector), address(0), "");
        ExampleFacetV2(address(diamond)).decrement();
        require(counter.getCounter() == 1 && next.counter() == 0, "shared diamond storage, separate facet storage");
        require(DiamondLoupeFacet(address(diamond)).facetAddress(next.decrement.selector) == address(next), "loupe routing");
    }

    function testReplaceAndRemoveUpdateSelectorRouting() public {
        ExampleFacetV2 next = new ExampleFacetV2();
        IDiamondCut cutter = IDiamondCut(address(diamond));
        cutter.diamondCut(oneCut(address(next), IDiamondCut.FacetCutAction.Replace, next.increment.selector), address(0), "");
        ExampleFacet(address(diamond)).increment();
        require(ExampleFacet(address(diamond)).getCounter() == 1, "replacement executes");
        require(DiamondLoupeFacet(address(diamond)).facetAddress(next.increment.selector) == address(next), "replacement route");
        cutter.diamondCut(oneCut(address(0), IDiamondCut.FacetCutAction.Remove, ExampleFacet.getCounter.selector), address(0), "");
        (bool ok, bytes memory reason) = address(diamond).call(abi.encodeWithSelector(ExampleFacet.getCounter.selector));
        require(!ok && keccak256(reason) == keccak256(abi.encodeWithSelector(LibDiamond.FunctionNotFound.selector)), "removed selector rejected");
    }

    function testOnlyCurrentOwnerCanCutAfterOwnershipTransfer() public {
        OtherCaller other = new OtherCaller();
        bytes memory callData = abi.encodeWithSelector(IDiamondCut.diamondCut.selector, oneCut(address(new ExampleFacetV2()), IDiamondCut.FacetCutAction.Add, ExampleFacetV2.decrement.selector), address(0), bytes(""));
        (bool ok, bytes memory reason) = other.attempt(address(diamond), callData);
        require(!ok && keccak256(reason) == keccak256(abi.encodeWithSelector(LibDiamond.NotContractOwner.selector)), "owner rejection");
        OwnershipFacet(address(diamond)).transferOwnership(address(other));
        require(OwnershipFacet(address(diamond)).owner() == address(other), "ownership transfer");
        (ok,) = address(diamond).call(callData); require(!ok, "old owner cannot cut");
        (ok,) = other.attempt(address(diamond), callData); require(ok, "new owner can cut");
    }
}
