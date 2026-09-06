// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

/// @title Minimal Transparent Proxy (EIP-1967) – for education/demo
/// @notice Admin gets upgrade functions; non-admin callers are delegated to implementation.
///         Admin is blocked from fallback to avoid selector clashes.
contract TransparentProxy1967 {
    // EIP-1967 slots (implementation, admin)
    bytes32 private constant _IMPLEMENTATION_SLOT =
        0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    bytes32 private constant _ADMIN_SLOT =
        0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;
    event Upgraded(address indexed implementation);
    event AdminChanged(address previousAdmin, address newAdmin);
    // logic        - The address of the logic contract
    // initialAdmin - The admin of this proxy that can upgrade logic
    // data         - "constructor" for the logic contract
    constructor(address logic, address initialAdmin, bytes memory data) payable {
        require(_isContract(logic), "Proxy: logic not a contract");
        require(initialAdmin != address(0), "Proxy: admin zero");
        _setAddress(_ADMIN_SLOT, initialAdmin);
        _setAddress(_IMPLEMENTATION_SLOT, logic);
        // optional initializer call (acts like a constructor for the implementation)
        if (data.length > 0) {
            (bool ok, bytes memory err) = logic.delegatecall(data);
            require(ok, string(err));
        }
    }
    // -------- Admin control plane --------
    modifier ifAdmin() {
        if (msg.sender == _admin()) {
            _;
        } else {
            _fallback();
        }
    }
    function admin() external ifAdmin returns (address) { return _admin(); }
    function implementation() external ifAdmin returns (address) { return _implementation(); }
    function changeAdmin(address newAdmin) external ifAdmin {
        require(newAdmin != address(0), "Proxy: admin zero");
        emit AdminChanged(_admin(), newAdmin);
        _setAddress(_ADMIN_SLOT, newAdmin);
    }
    function upgradeTo(address newImplementation) external ifAdmin {
        _upgradeTo(newImplementation);
    }
    function upgradeToAndCall(address newImplementation, bytes calldata data) external payable ifAdmin {
        _upgradeTo(newImplementation);
        (bool ok, bytes memory err) = newImplementation.delegatecall(data);
        require(ok, string(err));
    }
    // -------- User surface (fallback/delegate) --------
    fallback() external payable { _fallback(); }
    receive() external payable { _fallback(); }
    function _fallback() internal {
        require(msg.sender != _admin(), "Transparent: admin cannot fallback");
        _delegate(_implementation());
    }
    function _delegate(address impl) internal {
        assembly {
            // 0x00–0x3f: scratch space the compiler may use temporarily.
            // Using memory at 0x00 is safe in this proxy fallback
            // because the assembly block never returns to Solidity.
            calldatacopy(0, 0, calldatasize())
            let ok := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch ok
            case 0 { revert(0, returndatasize()) }
            default { return(0, returndatasize()) }
        }
    }
    // -------- Slot helpers & guards --------
    function _admin() internal view returns (address a) { a = _getAddress(_ADMIN_SLOT); }
    function _implementation() internal view returns (address a) { a = _getAddress(_IMPLEMENTATION_SLOT); }
    function _upgradeTo(address newImpl) internal {
        require(_isContract(newImpl), "Proxy: new impl not a contract");
        _setAddress(_IMPLEMENTATION_SLOT, newImpl);
        emit Upgraded(newImpl);
    }
    function _getAddress(bytes32 slot) internal view returns (address a) {
        assembly { a := sload(slot) }
    }
    function _setAddress(bytes32 slot, address a) internal {
        assembly { sstore(slot, a) }
    }
    function _isContract(address a) internal view returns (bool) {
        uint256 size; assembly { size := extcodesize(a) }
        return size > 0;
    }
}
