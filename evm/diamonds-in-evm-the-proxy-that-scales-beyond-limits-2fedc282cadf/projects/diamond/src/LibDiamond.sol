// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IDiamondCut} from "./interfaces/IDiamondCut.sol";

library LibDiamond {
    bytes32 internal constant DIAMOND_STORAGE_POSITION =
        keccak256("diamond.standard.diamond.storage");

    error NotContractOwner();
    error FunctionNotFound();
    error InitFailed(bytes returndata);

    struct FacetAddressAndPosition {
        address facetAddress;
        uint96 functionSelectorPosition;
    }

    struct FacetFunctionSelectors {
        bytes4[] functionSelectors;
        uint256 facetAddressPosition;
    }

    struct DiamondStorage {
        mapping(bytes4 => FacetAddressAndPosition) selectorToFacetAndPos;
        mapping(address => FacetFunctionSelectors) facetFunctionSelectors;
        address[] facetAddresses;
        address contractOwner;
    }

    function diamondStorage() internal pure returns (DiamondStorage storage ds) {
        bytes32 pos = DIAMOND_STORAGE_POSITION;
        assembly { ds.slot := pos }
    }

    // ------------- owner -------------
    event OwnershipTransferred(address indexed prevOwner, address indexed newOwner);

    function setContractOwner(address _newOwner) internal {
        DiamondStorage storage ds = diamondStorage();
        address prev = ds.contractOwner;
        ds.contractOwner = _newOwner;
        emit OwnershipTransferred(prev, _newOwner);
    }

    function enforceIsContractOwner() internal view {
        if (msg.sender != diamondStorage().contractOwner) revert NotContractOwner();
    }

    // ------------- cut -------------
    // Use interface types here:
    event DiamondCut(IDiamondCut.FacetCut[] _diamondCut, address _init, bytes _calldata);

    function diamondCut(
        IDiamondCut.FacetCut[] memory _cut,
        address _init,
        bytes memory _calldata
    ) internal {
        for (uint i; i < _cut.length; i++) {
            IDiamondCut.FacetCutAction action = _cut[i].action;
            if (action == IDiamondCut.FacetCutAction.Add) {
                addFunctions(_cut[i].facetAddress, _cut[i].functionSelectors);
            } else if (action == IDiamondCut.FacetCutAction.Replace) {
                replaceFunctions(_cut[i].facetAddress, _cut[i].functionSelectors);
            } else if (action == IDiamondCut.FacetCutAction.Remove) {
                removeFunctions(_cut[i].facetAddress, _cut[i].functionSelectors);
            }
        }
        emit DiamondCut(_cut, _init, _calldata);
        initializeDiamondCut(_init, _calldata);
    }

    function addFunctions(address _facet, bytes4[] memory _selectors) internal {
        require(_facet != address(0), "Add facet can't be 0");
        DiamondStorage storage ds = diamondStorage();

        FacetFunctionSelectors storage ffs = ds.facetFunctionSelectors[_facet];
        if (ffs.functionSelectors.length == 0) {
            ds.facetAddresses.push(_facet);
            ffs.facetAddressPosition = ds.facetAddresses.length - 1;
        }

        for (uint i; i < _selectors.length; i++) {
            bytes4 sel = _selectors[i];
            require(ds.selectorToFacetAndPos[sel].facetAddress == address(0), "Selector exists");
            ds.selectorToFacetAndPos[sel] = FacetAddressAndPosition({
                facetAddress: _facet,
                functionSelectorPosition: uint96(ffs.functionSelectors.length)
            });
            ffs.functionSelectors.push(sel);
        }
    }

    function replaceFunctions(address _facet, bytes4[] memory _selectors) internal {
        require(_facet != address(0), "Replace facet can't be 0");
        DiamondStorage storage ds = diamondStorage();

        FacetFunctionSelectors storage ffs = ds.facetFunctionSelectors[_facet];
        if (ffs.functionSelectors.length == 0) {
            ds.facetAddresses.push(_facet);
            ffs.facetAddressPosition = ds.facetAddresses.length - 1;
        }

        for (uint i; i < _selectors.length; i++) {
            bytes4 sel = _selectors[i];
            address oldFacet = ds.selectorToFacetAndPos[sel].facetAddress;
            require(oldFacet != _facet, "Replace same facet");
            _removeFunction(oldFacet, sel);
            ds.selectorToFacetAndPos[sel] = FacetAddressAndPosition({
                facetAddress: _facet,
                functionSelectorPosition: uint96(ffs.functionSelectors.length)
            });
            ffs.functionSelectors.push(sel);
        }
    }

    function removeFunctions(address _facet, bytes4[] memory _selectors) internal {
        require(_facet == address(0), "Remove facet must be 0");
        for (uint i; i < _selectors.length; i++) {
            _removeFunction(diamondStorage().selectorToFacetAndPos[_selectors[i]].facetAddress, _selectors[i]);
        }
    }

    function _removeFunction(address _facet, bytes4 _sel) private {
        DiamondStorage storage ds = diamondStorage();
        FacetAddressAndPosition memory fap = ds.selectorToFacetAndPos[_sel];
        address facet = fap.facetAddress;
        require(facet != address(0), "Selector !exist");

        FacetFunctionSelectors storage ffs = ds.facetFunctionSelectors[facet];
        uint last = ffs.functionSelectors.length - 1;
        uint pos = fap.functionSelectorPosition;
        if (pos != last) {
            bytes4 lastSel = ffs.functionSelectors[last];
            ffs.functionSelectors[pos] = lastSel;
            ds.selectorToFacetAndPos[lastSel].functionSelectorPosition = uint96(pos);
        }
        ffs.functionSelectors.pop();
        delete ds.selectorToFacetAndPos[_sel];

        if (ffs.functionSelectors.length == 0) {
            uint lastFacetPos = ds.facetAddresses.length - 1;
            uint facetPos = ffs.facetAddressPosition;
            if (facetPos != lastFacetPos) {
                address lastFacetAddr = ds.facetAddresses[lastFacetPos];
                ds.facetAddresses[facetPos] = lastFacetAddr;
                ds.facetFunctionSelectors[lastFacetAddr].facetAddressPosition = facetPos;
            }
            ds.facetAddresses.pop();
            delete ds.facetFunctionSelectors[facet];
        }
    }

    function initializeDiamondCut(address _init, bytes memory _calldata) private {
        if (_init == address(0)) {
            require(_calldata.length == 0, "Init addr is 0");
            return;
        }
        (bool ok, bytes memory ret) = _init.delegatecall(_calldata);
        if (!ok) revert InitFailed(ret);
    }
}
