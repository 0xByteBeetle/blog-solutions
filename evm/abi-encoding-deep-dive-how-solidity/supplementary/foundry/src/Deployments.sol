// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract CreatedStorage {
    uint256 public immutable constructorValue;

    constructor(uint256 value) {
        constructorValue = value;
    }
}

contract CreateFactory {
    event Deployed(address indexed deployed, bytes32 indexed salt, bool deterministic);

    function deployCreate(uint256 value) external returns (address deployed) {
        deployed = address(new CreatedStorage(value));
        emit Deployed(deployed, bytes32(0), false);
    }

    function deployCreate2(uint256 value, bytes32 salt) external returns (address deployed) {
        deployed = address(new CreatedStorage{salt: salt}(value));
        emit Deployed(deployed, salt, true);
    }

    function create2Address(uint256 value, bytes32 salt) external view returns (address) {
        bytes memory initCode = abi.encodePacked(
            type(CreatedStorage).creationCode,
            abi.encode(value)
        );
        return address(uint160(uint256(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            keccak256(initCode)
        )))));
    }
}

contract CloneLogic {
    error AlreadyInitialized();

    uint256 public value;
    address public owner;

    function initialize(address nextOwner, uint256 nextValue) external {
        if (owner != address(0)) revert AlreadyInitialized();
        owner = nextOwner;
        value = nextValue;
    }

    function setValue(uint256 nextValue) external {
        require(msg.sender == owner, "not owner");
        value = nextValue;
    }
}

contract MinimalCloneFactory {
    error DeploymentFailed();

    function clone(address implementation) public returns (address instance) {
        bytes memory initCode = abi.encodePacked(
            hex"3d602d80600a3d3981f3",
            hex"363d3d373d3d3d363d73",
            implementation,
            hex"5af43d82803e903d91602b57fd5bf3"
        );
        assembly {
            instance := create(0, add(initCode, 0x20), mload(initCode))
        }
        if (instance == address(0)) revert DeploymentFailed();
    }

    function cloneAndInitialize(address implementation, address owner, uint256 value)
        external
        returns (address instance)
    {
        instance = clone(implementation);
        CloneLogic(instance).initialize(owner, value);
    }
}

abstract contract ERC1967Slots {
    bytes32 internal constant IMPLEMENTATION_SLOT =
        bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);
    bytes32 internal constant ADMIN_SLOT =
        bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1);

    function _implementation() internal view returns (address implementation_) {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            implementation_ := sload(slot)
        }
    }

    function _setImplementation(address implementation_) internal {
        require(implementation_.code.length != 0, "implementation has no code");
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            sstore(slot, implementation_)
        }
    }

    function _delegate(address implementation_) internal {
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), implementation_, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
}

contract StorageV1 {
    error AlreadyInitialized();

    uint256 public value;
    address public owner;

    function initialize(address nextOwner, uint256 initialValue) external {
        if (owner != address(0)) revert AlreadyInitialized();
        owner = nextOwner;
        value = initialValue;
    }

    function setValue(uint256 nextValue) external {
        require(msg.sender == owner, "not owner");
        value = nextValue;
    }

    function version() external pure virtual returns (uint256) {
        return 1;
    }
}

contract StorageV2 is StorageV1 {
    function increment() external {
        require(msg.sender == owner, "not owner");
        value += 1;
    }

    function version() external pure override returns (uint256) {
        return 2;
    }
}

contract TransparentProxy is ERC1967Slots {
    error AdminCannotFallback();
    error NotAdmin();

    constructor(address implementation_, address admin_, bytes memory initData) payable {
        _setImplementation(implementation_);
        bytes32 slot = ADMIN_SLOT;
        assembly {
            sstore(slot, admin_)
        }
        if (initData.length != 0) {
            (bool ok, bytes memory reason) = implementation_.delegatecall(initData);
            if (!ok) _revert(reason);
        }
    }

    function admin() external view returns (address admin_) {
        bytes32 slot = ADMIN_SLOT;
        assembly {
            admin_ := sload(slot)
        }
    }

    function implementation() external view returns (address) {
        return _implementation();
    }

    function upgradeTo(address nextImplementation) external {
        if (msg.sender != _admin()) revert NotAdmin();
        _setImplementation(nextImplementation);
    }

    fallback() external payable {
        if (msg.sender == _admin()) revert AdminCannotFallback();
        _delegate(_implementation());
    }

    receive() external payable {
        if (msg.sender == _admin()) revert AdminCannotFallback();
        _delegate(_implementation());
    }

    function _admin() internal view returns (address admin_) {
        bytes32 slot = ADMIN_SLOT;
        assembly {
            admin_ := sload(slot)
        }
    }

    function _revert(bytes memory reason) private pure {
        assembly {
            revert(add(reason, 0x20), mload(reason))
        }
    }
}

contract UUPSLogicV1 is ERC1967Slots {
    error AlreadyInitialized();

    uint256 public value;
    address public owner;

    function initialize(address nextOwner, uint256 initialValue) external {
        if (owner != address(0)) revert AlreadyInitialized();
        owner = nextOwner;
        value = initialValue;
    }

    function setValue(uint256 nextValue) external {
        require(msg.sender == owner, "not owner");
        value = nextValue;
    }

    function upgradeTo(address nextImplementation) external {
        require(msg.sender == owner, "not owner");
        _setImplementation(nextImplementation);
    }

    function version() external pure virtual returns (uint256) {
        return 1;
    }
}

contract UUPSLogicV2 is UUPSLogicV1 {
    function doubleValue() external {
        require(msg.sender == owner, "not owner");
        value *= 2;
    }

    function version() external pure override returns (uint256) {
        return 2;
    }
}

contract ERC1967Proxy is ERC1967Slots {
    constructor(address implementation_, bytes memory initData) payable {
        _setImplementation(implementation_);
        if (initData.length != 0) {
            (bool ok, bytes memory reason) = implementation_.delegatecall(initData);
            if (!ok) {
                assembly {
                    revert(add(reason, 0x20), mload(reason))
                }
            }
        }
    }

    fallback() external payable {
        _delegate(_implementation());
    }

    receive() external payable {
        _delegate(_implementation());
    }
}
