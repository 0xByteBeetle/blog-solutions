// Supplemental tests compiled with the article's required Solidity 0.8.12.
pragma solidity 0.8.12;
import {StorageV1} from "../src/StorageV1.sol";
import {StorageV2} from "../src/StorageV2.sol";
import {TransparentProxy1967} from "../src/TransparentProxy1967.sol";

interface SlotVm { function load(address target, bytes32 slot) external view returns (bytes32); }

contract ProxyAdminCaller {
    function upgrade(TransparentProxy1967 proxy, address implementation) external { proxy.upgradeTo(implementation); }
    function attempt(address target, bytes calldata data) external returns (bool, bytes memory) { return target.call(data); }
}
contract TransparentProxyTest {
    function deploy() private returns (TransparentProxy1967, ProxyAdminCaller) {
        ProxyAdminCaller admin = new ProxyAdminCaller();
        TransparentProxy1967 proxy = new TransparentProxy1967(address(new StorageV1()), address(admin), abi.encodeWithSignature("initialize(uint256,string)", 42, "Alice"));
        return (proxy, admin);
    }

    function testUpgradePreservesStateAndAddsNewFunctionality() public {
        (TransparentProxy1967 proxy, ProxyAdminCaller admin) = deploy();
        StorageV1 storage1 = StorageV1(address(proxy));
        require(storage1.number() == 42 && keccak256(bytes(storage1.ownerName())) == keccak256("Alice"), "initializer data");
        storage1.setNumber(77);
        admin.upgrade(proxy, address(new StorageV2()));
        StorageV2 storage2 = StorageV2(address(proxy));
        storage2.setNote("new field");
        require(storage2.number() == 77 && storage2.double() == 154, "state survives upgrade");
        require(keccak256(bytes(storage2.note())) == keccak256("new field"), "new storage field");
        (bool ok,) = address(proxy).call(abi.encodeWithSignature("initialize(uint256,string)", 1, "reset"));
        require(!ok && storage2.number() == 77, "initializer is one-shot");
    }

    function testRawEIP1967WordsBeforeAndAfterUpgrade() public {
        SlotVm vm = SlotVm(address(uint160(uint256(keccak256("hevm cheat code")))));
        bytes32 adminSlot = bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1);
        bytes32 implSlot = bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);
        ProxyAdminCaller admin = new ProxyAdminCaller();
        StorageV1 first = new StorageV1();
        TransparentProxy1967 proxy = new TransparentProxy1967(address(first), address(admin), abi.encodeWithSignature("initialize(uint256,string)", 42, "Alice"));
        require(vm.load(address(proxy), adminSlot) == bytes32(uint256(uint160(address(admin)))), "raw admin word");
        require(vm.load(address(proxy), implSlot) == bytes32(uint256(uint160(address(first)))), "raw initial implementation");
        StorageV1(address(proxy)).setNumber(77);
        StorageV2 second = new StorageV2();
        admin.upgrade(proxy, address(second));
        require(vm.load(address(proxy), implSlot) == bytes32(uint256(uint160(address(second)))), "raw upgraded implementation");
        require(vm.load(address(proxy), adminSlot) == bytes32(uint256(uint160(address(admin)))), "admin slot unchanged");
        require(StorageV2(address(proxy)).number() == 77, "user state preserved");
    }

    function testAdminCannotFallThroughAndUserCannotUpgrade() public {
        (TransparentProxy1967 proxy, ProxyAdminCaller admin) = deploy();
        (bool ok, bytes memory reason) = admin.attempt(address(proxy), abi.encodeWithSignature("number()"));
        require(!ok && keccak256(reason) == keccak256(abi.encodeWithSignature("Error(string)", "Transparent: admin cannot fallback")), "admin separation");
        (ok,) = address(proxy).call(abi.encodeWithSelector(proxy.upgradeTo.selector, address(new StorageV2())));
        require(!ok && StorageV1(address(proxy)).number() == 42, "user cannot use admin plane");
    }

    function testUpgradeRejectsAddressWithoutCode() public {
        (TransparentProxy1967 proxy, ProxyAdminCaller admin) = deploy();
        (bool ok, bytes memory reason) = admin.attempt(address(proxy), abi.encodeWithSelector(proxy.upgradeTo.selector, address(0xbeef)));
        require(!ok && keccak256(reason) == keccak256(abi.encodeWithSignature("Error(string)", "Proxy: new impl not a contract")), "implementation code required");
        require(StorageV1(address(proxy)).number() == 42, "rejected upgrade preserves state");
    }
}
