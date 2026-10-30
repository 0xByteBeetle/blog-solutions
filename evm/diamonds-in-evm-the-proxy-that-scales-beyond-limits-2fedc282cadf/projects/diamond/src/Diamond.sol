// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LibDiamond} from "./LibDiamond.sol";
import {IDiamondCut} from "./interfaces/IDiamondCut.sol";

/// @notice The Diamond itself: holds storage + fallback router
contract Diamond {
    constructor(address _contractOwner, IDiamondCut.FacetCut[] memory _cut, address _init, bytes memory _calldata) {
        LibDiamond.setContractOwner(_contractOwner);
        LibDiamond.diamondCut(_cut, _init, _calldata);
    }

    // loupe & ownership are immutable if you put them here,
    // but to keep it idiomatic we route everything via facets.

    fallback() external payable {
        address facet = LibDiamond.diamondStorage().selectorToFacetAndPos[msg.sig].facetAddress;
        if (facet == address(0)) revert LibDiamond.FunctionNotFound();
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }

    receive() external payable {}
}
