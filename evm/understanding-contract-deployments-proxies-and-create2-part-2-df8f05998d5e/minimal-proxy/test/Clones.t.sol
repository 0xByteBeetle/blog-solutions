// Supplemental local tests; no RPC, wallet, or additional library required.
pragma solidity 0.8.30;
import {Counter, CounterCloneFactory} from "../src/minimalProxy.sol";

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

    function testNonOwnerCannotIncrementClone() public {
        Counter logic = new Counter();
        Counter counter = Counter(new CounterCloneFactory().createClone(address(logic), address(this), 5));
        (bool ok, bytes memory reason) = new OtherCaller().attempt(address(counter), abi.encodeWithSelector(counter.inc.selector));
        require(!ok && keccak256(reason) == keccak256(abi.encodeWithSignature("Error(string)", "not owner")), "owner check");
        require(counter.value() == 5, "rejected write");
    }
}
