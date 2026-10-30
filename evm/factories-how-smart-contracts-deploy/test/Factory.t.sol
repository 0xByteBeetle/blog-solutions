// Supplemental local tests for the article's unchanged factory and Counter.
pragma solidity 0.8.30;
import {Counter, CounterFactory} from "../src/basicfactory.sol";

interface Vm {
    struct Log { bytes32[] topics; bytes data; address emitter; }
    function recordLogs() external;
    function getRecordedLogs() external returns (Log[] memory);
}
contract OtherCaller {
    function increment(Counter counter) external returns (bool, bytes memory) {
        return address(counter).call(abi.encodeWithSelector(counter.inc.selector));
    }
}
contract FactoryTest {
    Vm constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function testCreatesFiveDistinctInitializedCountersAndReturnsLast() public {
        CounterFactory factory = new CounterFactory();
        vm.recordLogs();
        address last = factory.createCounter(address(this), 42);
        Vm.Log[] memory logs = vm.getRecordedLogs();
        require(logs.length == 5, "five creation events");
        address previous;
        for (uint256 i; i < logs.length; i++) {
            require(logs[i].emitter == address(factory), "factory emitter");
            require(logs[i].topics[0] == keccak256("CounterCreated(address,address,uint256)"), "event signature");
            address created = address(uint160(uint256(logs[i].topics[1])));
            require(created != previous && created.code.length != 0, "distinct deployment");
            require(address(uint160(uint256(logs[i].topics[2]))) == address(this), "event owner");
            require(abi.decode(logs[i].data, (uint256)) == 42, "event initial value");
            require(Counter(created).owner() == address(this) && Counter(created).value() == 42, "counter state");
            previous = created;
        }
        require(last == previous, "returns fifth deployment");
    }

    function testOwnerCanIncrementAndOtherCallerCannot() public {
        Counter counter = Counter(new CounterFactory().createCounter(address(this), 7));
        counter.inc();
        require(counter.value() == 8, "owner increment");
        (bool ok, bytes memory reason) = new OtherCaller().increment(counter);
        require(!ok && keccak256(reason) == keccak256(abi.encodeWithSignature("Error(string)", "not owner")), "owner rejection");
        require(counter.value() == 8, "rejected increment leaves state unchanged");
    }
}
