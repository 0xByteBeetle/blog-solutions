// Synthetic designation bytes test the printed invoker, not a signed EIP-7702 transaction.
pragma solidity 0.8.30;
import {Invoked} from "../src/Invoked.sol";
import {MultiDelegationInvoker} from "../src/MultiDelegationInvoker.sol";

interface Vm {
    struct Log { bytes32[] topics; bytes data; address emitter; }
    function etch(address target, bytes calldata code) external;
    function recordLogs() external;
    function getRecordedLogs() external returns (Log[] memory);
}
contract RevertingModule {
    function ping() external pure { revert("module rejected"); }
}
contract DelegationTest {
    Vm constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function testDesignationRoutesToModuleAndRecordsInvokerAsSender() public {
        MultiDelegationInvoker invoker = new MultiDelegationInvoker();
        Invoked module = new Invoked();
        address authority = address(0x1234);
        vm.etch(authority, abi.encodePacked(hex"ef0100", address(module)));
        address[] memory froms = new address[](1); froms[0] = authority;
        vm.recordLogs(); invoker.triggerPings(froms);
        Vm.Log[] memory logs = vm.getRecordedLogs();
        require(logs.length == 3, "start, ping, success");
        require(logs[0].emitter == address(invoker) && logs[0].topics[0] == keccak256("PingStart(address)"), "start event");
        require(abi.decode(logs[0].data, (address)) == address(this), "trigger caller");
        require(logs[1].emitter == address(module) && logs[1].topics[0] == keccak256("Pinged(address)"), "actual module event");
        require(abi.decode(logs[1].data, (address)) == address(invoker), "module sees invoker, not authority");
        require(logs[2].topics[0] == keccak256("PingSuccess(address)") && abi.decode(logs[2].data, (address)) == authority, "designation reported");
    }

    function testWrongPrefixIsRejected() public {
        MultiDelegationInvoker invoker = new MultiDelegationInvoker();
        address authority = address(0x1234);
        vm.etch(authority, abi.encodePacked(hex"600000", address(new Invoked())));
        address[] memory froms = new address[](1); froms[0] = authority;
        (bool ok, bytes memory reason) = address(invoker).call(abi.encodeWithSelector(invoker.triggerPings.selector, froms));
        require(!ok && keccak256(reason) == keccak256(abi.encodeWithSignature("Error(string)", "Not delegated or invalid delegation format")), "format rejection");
    }

    function testModuleFailureIsPropagatedAsPingFailure() public {
        MultiDelegationInvoker invoker = new MultiDelegationInvoker();
        address authority = address(0x1234);
        vm.etch(authority, abi.encodePacked(hex"ef0100", address(new RevertingModule())));
        address[] memory froms = new address[](1); froms[0] = authority;
        (bool ok, bytes memory reason) = address(invoker).call(abi.encodeWithSelector(invoker.triggerPings.selector, froms));
        require(!ok && keccak256(reason) == keccak256(abi.encodeWithSignature("Error(string)", "Ping failed")), "module failure");
    }
}
