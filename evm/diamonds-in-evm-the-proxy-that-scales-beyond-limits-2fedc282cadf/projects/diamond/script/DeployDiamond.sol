// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

import {Diamond} from "../src/Diamond.sol";
import {IDiamondCut} from "../src/interfaces/IDiamondCut.sol";
import {DiamondCutFacet} from "../src/facets/DiamondCutFacet.sol";
import {DiamondLoupeFacet} from "../src/facets/DiamondLoupeFacet.sol";
import {OwnershipFacet} from "../src/facets/OwnershipFacet.sol";
import {ExampleFacet} from "../src/facets/ExampleFacet.sol";

contract DeployDiamond is Script {
    function run() external {
        // load deployer key from env (use ANVIL default or your own)
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);

        // 1) deploy facets
        DiamondCutFacet cutFacet = new DiamondCutFacet();
        DiamondLoupeFacet loupeFacet = new DiamondLoupeFacet();
        OwnershipFacet ownFacet = new OwnershipFacet();
        ExampleFacet exampleFacet = new ExampleFacet();

        // 2) build the facet cuts
        IDiamondCut.FacetCut  [] memory cut = new IDiamondCut.FacetCut[](4);

        // DiamondCutFacet
        {
            bytes4  [] memory selectors = new bytes4[](1);
            selectors[0] = DiamondCutFacet.diamondCut.selector;
            cut[0] = IDiamondCut.FacetCut({
                facetAddress: address(cutFacet),
                action: IDiamondCut.FacetCutAction.Add,
                functionSelectors: selectors
            });
        }

        // DiamondLoupeFacet
        {
            bytes4[] memory selectors = new bytes4[](4);
            selectors[0] = DiamondLoupeFacet.facets.selector;
            selectors[1] = DiamondLoupeFacet.facetFunctionSelectors.selector;
            selectors[2] = DiamondLoupeFacet.facetAddresses.selector;
            selectors[3] = DiamondLoupeFacet.facetAddress.selector;
            cut[1] = IDiamondCut.FacetCut({
                facetAddress: address(loupeFacet),
                action: IDiamondCut.FacetCutAction.Add,
                functionSelectors: selectors
            });
        }

        // OwnershipFacet
        {
            bytes4 [] memory selectors = new bytes4[](2);
            selectors[0] = OwnershipFacet.owner.selector;
            selectors[1] = OwnershipFacet.transferOwnership.selector;
            cut[2] = IDiamondCut.FacetCut({
                facetAddress: address(ownFacet),
                action: IDiamondCut.FacetCutAction.Add,
                functionSelectors: selectors
            });
        }

        // ExampleFacet
        {
            bytes4  [] memory selectors = new bytes4[](2);
            selectors[0] = ExampleFacet.increment.selector;
            selectors[1] = ExampleFacet.getCounter.selector;
            cut[3] = IDiamondCut.FacetCut({
                facetAddress: address(exampleFacet),
                action: IDiamondCut.FacetCutAction.Add,
                functionSelectors: selectors
            });
        }

        // 3) deploy diamond with the cut
        Diamond diamond = new Diamond(
            deployer,
            cut,
            address(0), // no init facet
            ""          // no init calldata
        );

        vm.stopBroadcast();

        console.log("Diamond deployed at:", address(diamond));
    }
}
