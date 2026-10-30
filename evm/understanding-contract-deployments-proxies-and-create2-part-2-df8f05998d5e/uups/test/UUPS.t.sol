// Tests the pedagogical original, including its documented reinitialization limitation.
pragma solidity 0.8.30;
import {MyToken} from "../src/UUPSLogicContract.sol";
import {UUPSProxy} from "../src/UUPSProxy.sol";

contract NextToken is MyToken {
    function version() external pure returns (uint256) { return 2; }
}
contract Incompatible {
    function proxiableUUID() external pure returns (bytes32) { return bytes32(0); }
}
contract OtherCaller {
    function attempt(address target, bytes calldata data) external returns (bool, bytes memory) { return target.call(data); }
}
contract UUPSTest {
    function deploy() private returns (MyToken) {
        MyToken logic = new MyToken();
        return MyToken(address(new UUPSProxy(abi.encodeWithSignature("constructor1(uint256)", 100), address(logic))));
    }

    function testUpgradeChangesCodeAndPreservesTokenState() public {
        MyToken token = deploy();
        token.transfer(address(0xbeef), 25);
        NextToken next = new NextToken();
        token.updateCode(address(next));
        require(NextToken(address(token)).version() == 2, "new code routed");
        require(token.totalSupply() == 100 && token.tokens(address(this)) == 75 && token.tokens(address(0xbeef)) == 25, "state retained");
    }

    function testNonOwnerAndIncompatibleUpgradeAreRejected() public {
        MyToken token = deploy();
        (bool ok,) = new OtherCaller().attempt(address(token), abi.encodeWithSelector(token.updateCode.selector, address(new NextToken())));
        require(!ok, "non-owner upgrade");
        bytes memory reason;
        (ok, reason) = address(token).call(abi.encodeWithSelector(token.updateCode.selector, address(new Incompatible())));
        require(!ok && keccak256(reason) == keccak256(abi.encodeWithSignature("Error(string)", "Not compatible")), "UUID check");
        require(token.tokens(address(this)) == 100, "state retained after rejected upgrades");
    }

    function testOriginalInitializerCanBeCalledAgain() public {
        MyToken token = deploy();
        OtherCaller other = new OtherCaller();
        (bool ok,) = other.attempt(address(token), abi.encodeWithSelector(token.constructor1.selector, 7));
        require(ok && token.totalSupply() == 7 && token.tokens(address(other)) == 7, "original reinitialization behavior");
        require(token.tokens(address(this)) == 100, "old allocation remains; not safe fresh issuance");
    }
}
