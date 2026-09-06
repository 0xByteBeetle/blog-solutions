# Published examples

Source: https://andreyobruchkov1996.substack.com/p/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `f8a8c5e347d86fc27cb1086a8f4fdd3769214e74a7ba0fa246235d51851a4794`

````text
fallback() external payable {
  // get facet from function selector
  address facet = selectorToFacet[msg.sig];
  require(facet != address(0));
  // Execute external function from facet using delegatecall and return any value.
  assembly {
    // copy function selector and any arguments
    calldatacopy(0, 0, calldatasize())
    // execute function call using the facet
    let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
    // get any return value
    returndatacopy(0, 0, returndatasize())
    // return any return value or error back to the caller
    switch result
      case 0 {revert(0, returndatasize())}
      default {return (0, returndatasize())}
  }
}
````

## Block 2

SHA-256: `e6496b6473dc689058d369df8d6cc0508c73fa580c00852baa5d9c72047ebba6`

````text
interface IDiamond {
    enum FacetCutAction {Add, Replace, Remove}

    struct FacetCut {
        address facetAddress;
        FacetCutAction action;
        bytes4[] functionSelectors;
    }

    event DiamondCut(FacetCut[] _diamondCut, address _init, bytes _calldata);
}
````

## Block 3

SHA-256: `40bd850105302c358469bc469fcbab1a6f035c682eeecf9d45c29751490c1e4a`

````text
interface IDiamondCut is IDiamond {
    /// @notice Add/replace/remove any number of functions and optionally execute
    ///         a function with delegatecall
    /// @param _diamondCut Contains the facet addresses and function selectors
    /// @param _init The address of the contract or facet to execute _calldata
    /// @param _calldata A function call, including function selector and arguments
    ///                  _calldata is executed with delegatecall on _init
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external;
}
````

## Block 4

SHA-256: `3035c99334b4952807c87db495264a5ff97a243102a38ac9c1c7ac2e8994b509`

````text
// A loupe is a small magnifying glass used to look at diamonds.
// These functions look at diamonds
interface IDiamondLoupe {
    struct Facet {
        address facetAddress;
        bytes4[] functionSelectors;
    }

    /// @notice Gets all facet addresses and their four byte function selectors.
    /// @return facets_ Facet
    function facets() external view returns (Facet[] memory facets_);

    /// @notice Gets all the function selectors supported by a specific facet.
    /// @param _facet The facet address.
    /// @return facetFunctionSelectors_
    function facetFunctionSelectors(address _facet) external view returns (bytes4[] memory facetFunctionSelectors_);

    /// @notice Get all the facet addresses used by a diamond.
    /// @return facetAddresses_
    function facetAddresses() external view returns (address[] memory facetAddresses_);

    /// @notice Gets the facet that supports the given selector.
    /// @dev If facet is not found return address(0).
    /// @param _functionSelector The function selector.
    /// @return facetAddress_ The facet address.
    function facetAddress(bytes4 _functionSelector) external view returns (address facetAddress_);
}
````

## Block 5

SHA-256: `f659d71b26e5c0b96ec172d6544ae7a1a917b7eb197dd28ac6e04a769ebe3c14`

````text
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
````

## Block 6

SHA-256: `d2e491f480f3fb763947f0feb4c284678fc996d500c130fb158f14b701b87cc0`

````text
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IDiamondCut {
    enum FacetCutAction { Add, Replace, Remove }
    struct FacetCut {
        address facetAddress;
        FacetCutAction action;
        bytes4[] functionSelectors;
    }

    /// @notice Add/replace/remove functions & optionally execute init
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external;

    event DiamondCut(FacetCut[] _diamondCut, address _init, bytes _calldata);
}
````

## Block 7

SHA-256: `fcc2aa478bf26c6a9bffab73350b020e7463272a8369706eb0e32cf27460c4c3`

````text
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IDiamondLoupe {
    struct Facet { address facetAddress; bytes4[] functionSelectors; }

    function facets() external view returns (Facet[] memory facets_);
    function facetFunctionSelectors(address _facet) external view returns (bytes4[] memory _selectors);
    function facetAddresses() external view returns (address[] memory facetAddresses_);
    function facetAddress(bytes4 _functionSelector) external view returns (address facetAddress_);
}
````

## Block 8

SHA-256: `cd1a77ea271824c5ebcc7927bac22d5636e49ccbe9b7a5d4199536514658b408`

````text
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
````

## Block 9

SHA-256: `ce049d927b5e4124f86588063af091430b538f44c1a8d2e2a09f23c4952c7898`

````text
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LibDiamond} from "../LibDiamond.sol";
import {IDiamondCut} from "../interfaces/IDiamondCut.sol";

contract DiamondCutFacet is IDiamondCut {
    function diamondCut(
        FacetCut[] calldata _cut,
        address _init,
        bytes calldata _calldata
    ) external override {
        LibDiamond.enforceIsContractOwner();
        LibDiamond.diamondCut(_cut, _init, _calldata);
    }
}
````

## Block 10

SHA-256: `f1259f7afa7858ef25113f792c669dd6550cb6fc6ece2348dd5d05791725c3cf`

````text
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
````

## Block 11

SHA-256: `0bf1ad3911fcf89f15c45a477ddd0b81055ea19d06ff2604a6490808bb1e7dde`

````text
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {LibDiamond} from "../LibDiamond.sol";

contract OwnershipFacet {
    function owner() external view returns (address) {
        return LibDiamond.diamondStorage().contractOwner;
    }

    function transferOwnership(address _newOwner) external {
        LibDiamond.enforceIsContractOwner();
        LibDiamond.setContractOwner(_newOwner);
    }
}
````

## Block 12

SHA-256: `ddc4071d293eb0dc329c64a35c8c376777a44d04bc95432a266b0ab65b513b16`

````text
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ExampleFacet {
    uint256 internal counter;

    function increment() external { unchecked { counter++; } }
    function getCounter() external view returns (uint256) { return counter; }
}
````

## Block 13

SHA-256: `962c0a377b5665871a2714bdd9212c10dfcaeadd0b5ccad4cb5017406034ef97`

````text
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
````

## Block 14

SHA-256: `50bc66d8aae5ae9020e15d53a103ddf91de202b3af5aeb3fd124b6861cdd2405`

````text
anvil
````

## Block 15

SHA-256: `bb8ebd8187dc3b388b1a3198c8bad4bf2cf4e226b880866f8403de52cf0c3d52`

````text
forge script script/deployDiamond.s.sol:DeployDiamond \
  --rpc-url http://localhost:8545 \
  --broadcast
````

## Block 16

SHA-256: `f349d96fe6d61f0faa067280a1bac61695df5585d4b36a124c86d39fd5790d07`

````text
# Read the counter (should be 0 initially)
cast call 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 \
  "getCounter()(uint256)" \
  --rpc-url http://localhost:8545

# Increment the counter (must be a tx)
cast send 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 \
  "increment()" \
  --rpc-url http://localhost:8545 \
  --private-key <YOUR_ANVIL_PK>

# Check again. (The output should be 1)
cast call 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 \
  "getCounter()(uint256)" \
  --rpc-url http://localhost:8545

# Lets call other facet
# Who is the owner? (should be the address you provided in the script)
cast call 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 \
  "owner()(address)" \
  --rpc-url http://localhost:8545
````

## Block 17

SHA-256: `37c24b440c101968201029c4d61c4a993774c567f2eab4b8d30629d659d14656`

````text
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ExampleFacetV2 {
    uint256 public counter;

    function increment() external {
        counter++;
    }

    function getCounter() external view returns (uint256) {
        return counter;
    }

    // New functionality!
    function decrement() external {
        require(counter > 0, "already zero");
        counter--;
    }
}
````

## Block 18

SHA-256: `f368a00d0954f58bd88190481da7dd9d9950d8bb44fa444eee90102119d5c9bf`

````text
forge create src/facets/newFacet.sol:ExampleFacetV2 \
  --rpc-url http://localhost:8545 \
  --private-key <YOUR_ANVIL_PK> --broadcast

# The output should be something like:
# [⠊] Compiling...
# No files changed, compilation skipped
# Deployer: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
# Deployed to: 0x0165878A594ca255338adfa4d48449f69242Eb8F
# Transaction hash: 0xd78b181b3e57cab0f4d693b7e9963fff3f3a5a68d9d532274a0a6196cbf7bf13


````

## Block 19

SHA-256: `c639fdfd480a6bbf9ff95cb244746b0baebdcb79b3198fe5e6423530dff55e5f`

````text
# Get the 4 bytes of the new selector
cast sig "decrement()"
# → 0x2baeceb7

# upgrage
cast send 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 \
  "diamondCut((address,uint8,bytes4[])[],address,bytes)" \
  '[(0x0165878A594ca255338adfa4d48449f69242Eb8F,0,[0x2baeceb7])]' \
  0x0000000000000000000000000000000000000000 \
  0x \
  --rpc-url http://localhost:8545 \
  --private-key <YOUR_ANVIL_PK>

# This Tx should Succeed
````

## Block 20

SHA-256: `06999ccec2f03317330738e4e2422f60f7a80543ddc58f481fcd9ca140754e35`

````text
# Increment first
cast send 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 "increment()" \
  --rpc-url http://localhost:8545 --private-key <YOUR_ANVIL_PK>

# Check counter (should be 2 now, adds 1 the storage)
cast call 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 "getCounter()(uint256)" \
  --rpc-url http://localhost:8545
# → should be 1

# Call the new function
cast send 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 "decrement()" \
  --rpc-url http://localhost:8545 --private-key <YOUR_ANVIL_PK>

# Check counter again
cast call 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 "getCounter()(uint256)" \
  --rpc-url http://localhost:8545
# → should be back to 1
````

## Block 21

SHA-256: `f62d953e4c3df468177eacfefa2e08b3c84213a9cd5f0c6f98a6bb282f0d0a2c`

````text
0xd09de08a  ->  ExampleFacet   // increment()
0x06661abd  ->  ExampleFacet   // getCounter()
````

## Block 22

SHA-256: `fe52ece5e35743052990c57bfb988cc30022ce58a27101da6bda2e3c11ae4b1e`

````text
diamondCut(
  [(ExampleFacetV2, Add(0), [0x2baeceb7])],
  address(0),
  0x
)
````

## Block 23

SHA-256: `842b4329ca2e1cda71d77525c9c3a2f7ac91e63d7fe4450c929da6ce1e477634`

````text
0xd09de08a  ->  ExampleFacet     // increment()
0x06661abd  ->  ExampleFacet     // getCounter()
0x2baeceb7  ->  ExampleFacetV2   // decrement()
````

## Block 24

SHA-256: `284f8a784a76d27863253e684be5f7137c8e46f716f955978965928f427eea44`

````text
# Should output the first address of the example facet
cast call 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 "facetAddress(bytes4)(address)" 0xd09de08a --rpc-url http://localhost:8545

# Should output the new address of the exampleV2 facet
cast call 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9 "facetAddress(bytes4)(address)" 0xd09de08a --rpc-url http://localhost:8545
````

## Block 25

SHA-256: `8d5c367a80432972d822fe3e61a0b4c422a585527b4005f38c5595538e46ceed`

````text
library CounterStorage {
    // random slot: keccak256("example.counter.storage")
    bytes32 internal constant SLOT = keccak256("example.counter.storage");

    struct Layout {
        uint256 counter;
    }

    function layout() internal pure returns (Layout storage l) {
        bytes32 slot = SLOT;
        assembly { l.slot := slot }
    }
}
````
