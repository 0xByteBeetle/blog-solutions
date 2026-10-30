pragma solidity 0.8.30;
import {Storage} from "../src/Storage.sol";

// Supplemental test-only deployer: the article itself only calculates addresses.
contract StorageDeployer {
    function create() external returns (address) { return address(new Storage()); }
    function create2(bytes32 salt) external returns (address) { return address(new Storage{salt: salt}()); }
}

contract AddressTest {
    function testCreateUsesDeployerNonce() public {
        StorageDeployer deployer = new StorageDeployer();
        address first = address(uint160(uint256(keccak256(abi.encodePacked(hex"d694", address(deployer), hex"01")))));
        address second = address(uint160(uint256(keccak256(abi.encodePacked(hex"d694", address(deployer), hex"02")))));
        require(deployer.create() == first, "CREATE nonce 1");
        require(deployer.create() == second && second != first, "CREATE nonce 2");
        require(keccak256(first.code) == keccak256(type(Storage).runtimeCode), "init code installs runtime code");
    }

    function testCreate2UsesSaltAndInitCodeHashRatherThanNonce() public {
        StorageDeployer deployer = new StorageDeployer();
        bytes32 salt = bytes32(uint256(0x42));
        bytes32 initHash = keccak256(type(Storage).creationCode);
        address expected = address(uint160(uint256(keccak256(abi.encodePacked(hex"ff", address(deployer), salt, initHash)))));
        deployer.create(); // Advances the deployer's nonce without changing the CREATE2 result.
        address actual = deployer.create2(salt);
        require(actual == expected && actual.code.length > 0, "CREATE2 prediction and deployment");
        require(keccak256(actual.code) == keccak256(type(Storage).runtimeCode), "same article runtime code");
        require(deployer.create2(bytes32(uint256(0x43))) != actual, "salt changes address");
        (bool ok,) = address(deployer).call{gas: 200_000}(abi.encodeWithSelector(deployer.create2.selector, salt));
        require(!ok && actual.code.length > 0, "same salt/init code collision is rejected");
    }
}
