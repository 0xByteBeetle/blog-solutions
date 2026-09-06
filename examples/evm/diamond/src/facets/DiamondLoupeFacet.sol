// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LibDiamond} from "../LibDiamond.sol";
import {IDiamondLoupe} from "../interfaces/IDiamondLoupe.sol";

contract DiamondLoupeFacet is IDiamondLoupe {
    function facets() external view override returns (Facet[] memory facets_) {
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        address[] memory addrs = ds.facetAddresses;
        facets_ = new Facet[](addrs.length);
        for (uint i; i < addrs.length; i++) {
            bytes4[] memory selectors = ds.facetFunctionSelectors[addrs[i]].functionSelectors;
            facets_[i] = Facet({facetAddress: addrs[i], functionSelectors: selectors});
        }
    }

    function facetFunctionSelectors(address _facet) external view override returns (bytes4[] memory _selectors) {
        _selectors = LibDiamond.diamondStorage().facetFunctionSelectors[_facet].functionSelectors;
    }

    function facetAddresses() external view override returns (address[] memory facetAddresses_) {
        facetAddresses_ = LibDiamond.diamondStorage().facetAddresses;
    }

    function facetAddress(bytes4 _sel) external view override returns (address facetAddress_) {
        facetAddress_ = LibDiamond.diamondStorage().selectorToFacetAndPos[_sel].facetAddress;
    }
}
