// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

library CounterStorage {
    bytes32 internal constant SLOT = keccak256("0xbytebeetle.blog.counter.storage");

    struct Layout {
        uint256 counter;
    }

    function layout() internal pure returns (Layout storage state) {
        bytes32 slot = SLOT;
        assembly {
            state.slot := slot
        }
    }
}

interface IDiamondCut {
    enum Action {
        Add,
        Replace,
        Remove
    }

    struct FacetCut {
        address facet;
        Action action;
        bytes4[] selectors;
    }

    function diamondCut(FacetCut[] calldata cuts) external;
}

interface IDiamondLoupe {
    function facetAddress(bytes4 selector) external view returns (address);
}

contract Diamond is IDiamondCut, IDiamondLoupe {
    error NotOwner();
    error SelectorAlreadyExists(bytes4 selector);
    error SelectorDoesNotExist(bytes4 selector);
    error InvalidFacet();

    address public immutable owner;
    mapping(bytes4 selector => address facet) private facets;

    constructor(address owner_) {
        owner = owner_;
    }

    function diamondCut(FacetCut[] calldata cuts) external {
        if (msg.sender != owner) revert NotOwner();

        for (uint256 cutIndex; cutIndex < cuts.length; cutIndex++) {
            FacetCut calldata cut = cuts[cutIndex];
            for (uint256 selectorIndex; selectorIndex < cut.selectors.length; selectorIndex++) {
                bytes4 selector = cut.selectors[selectorIndex];
                address current = facets[selector];

                if (cut.action == Action.Add) {
                    if (cut.facet.code.length == 0) revert InvalidFacet();
                    if (current != address(0)) revert SelectorAlreadyExists(selector);
                    facets[selector] = cut.facet;
                } else if (cut.action == Action.Replace) {
                    if (cut.facet.code.length == 0) revert InvalidFacet();
                    if (current == address(0)) revert SelectorDoesNotExist(selector);
                    facets[selector] = cut.facet;
                } else {
                    if (current == address(0)) revert SelectorDoesNotExist(selector);
                    delete facets[selector];
                }
            }
        }
    }

    function facetAddress(bytes4 selector) external view returns (address) {
        return facets[selector];
    }

    fallback() external payable {
        address facet = facets[msg.sig];
        if (facet == address(0)) revert SelectorDoesNotExist(msg.sig);

        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}

contract CounterFacetV1 {
    function increment() external {
        CounterStorage.layout().counter += 1;
    }

    function counter() external view returns (uint256) {
        return CounterStorage.layout().counter;
    }
}

contract CounterFacetV2 {
    function increment() external {
        CounterStorage.layout().counter += 10;
    }

    function counter() external view returns (uint256) {
        return CounterStorage.layout().counter;
    }
}
