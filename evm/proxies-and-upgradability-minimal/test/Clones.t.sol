// Supplemental local tests; no RPC, wallet, or additional library required.
pragma solidity 0.8.30;
import {Counter, CounterCloneFactory} from "../src/minimalProxy.sol";

interface CloneLogVm {
    struct Log { bytes32[] topics; bytes data; address emitter; }
    function recordLogs() external;
    function getRecordedLogs() external returns (Log[] memory);
}

contract OtherCaller {
    function attempt(address target, bytes calldata data) external returns (bool, bytes memory) {
        return target.call(data);
    }
}
contract ClonesTest {
    function testClonesInitializeOnceAndKeepIndependentStorage() public {
        Counter logic = new Counter();
        CounterCloneFactory factory = new CounterCloneFactory();
        Counter first = Counter(factory.createClone(address(logic), address(this), 42));
        Counter second = Counter(factory.createClone(address(logic), address(this), 7));
        first.inc();
        require(first.owner() == address(this) && first.value() == 43, "first clone");
        require(second.value() == 7 && logic.value() == 0, "independent clone/logic storage");
        (bool ok,) = address(first).call(abi.encodeWithSelector(first.initialize.selector, address(this), 1));
        require(!ok && first.value() == 43, "clone cannot reinitialize");
        (ok,) = address(logic).call(abi.encodeWithSelector(logic.initialize.selector, address(this), 1));
        require(!ok, "logic constructor locks initialization");
    }

    function testCreate2AddressMatchesCreationCodeAndSaltCannotBeReused() public {
        Counter logic = new Counter();
        CounterCloneFactory factory = new CounterCloneFactory();
        bytes32 salt = keccak256("article clone");
        bytes memory creation = abi.encodePacked(hex"3d602d80600a3d3981f3", hex"363d3d373d3d3d363d73", address(logic), hex"5af43d82803e903d91602b57fd5bf3");
        address predicted = address(uint160(uint256(keccak256(abi.encodePacked(bytes1(0xff), address(factory), salt, keccak256(creation))))));
        address actual = factory.createCloneDeterministic(address(logic), address(this), 9, salt);
        require(actual == predicted && Counter(actual).value() == 9, "CREATE2 prediction/state");
        (bool ok,) = address(factory).call(abi.encodeWithSelector(factory.createCloneDeterministic.selector, address(logic), address(this), 1, salt));
        require(!ok && Counter(actual).value() == 9, "salt collision preserves existing clone");
    }

    function testDiscoverCloneAddressesFromCloneCreatedLogs() public {
        CloneLogVm vm = CloneLogVm(address(uint160(uint256(keccak256("hevm cheat code")))));
        Counter logic = new Counter();
        CounterCloneFactory factory = new CounterCloneFactory();
        vm.recordLogs();
        factory.createClone(address(logic), address(this), 100); // Deliberately ignore the return value.
        CloneLogVm.Log[] memory logs = vm.getRecordedLogs();
        address first = cloneFromLog(logs, address(factory), bytes32(0));
        bytes32 salt = keccak256("logged clone");
        vm.recordLogs();
        factory.createCloneDeterministic(address(logic), address(this), 100, salt);
        address second = cloneFromLog(vm.getRecordedLogs(), address(factory), salt);
        require(first != second && first.code.length == 45 && second.code.length == 45, "two clone runtimes");
        Counter(first).inc();
        require(Counter(first).value() == 101 && Counter(second).value() == 100, "log-discovered independent state");
    }
    function cloneFromLog(CloneLogVm.Log[] memory logs, address factory, bytes32 salt) private view returns (address) {
        require(logs.length == 1 && logs[0].emitter == factory, "factory receipt log");
        require(logs[0].topics.length == 3 && logs[0].topics[0] == keccak256("CloneCreated(address,address,uint256,bytes32)"), "event signature/indexed fields");
        require(address(uint160(uint256(logs[0].topics[2]))) == address(this), "indexed owner");
        (uint256 start, bytes32 observedSalt) = abi.decode(logs[0].data, (uint256, bytes32));
        require(start == 100 && observedSalt == salt, "event data");
        return address(uint160(uint256(logs[0].topics[1])));
    }

    function testNonOwnerCannotIncrementClone() public {
        Counter logic = new Counter();
        Counter counter = Counter(new CounterCloneFactory().createClone(address(logic), address(this), 5));
        (bool ok, bytes memory reason) = new OtherCaller().attempt(address(counter), abi.encodeWithSelector(counter.inc.selector));
        require(!ok && keccak256(reason) == keccak256(abi.encodeWithSignature("Error(string)", "not owner")), "owner check");
        require(counter.value() == 5, "rejected write");
    }
}
