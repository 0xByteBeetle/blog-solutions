// Supplemental behavior tests and mocks; no author source changed.
pragma solidity 0.8.30;
import {MyContract as ReceiveExample} from "../src/Block03.sol";
import {Example as FallbackExample} from "../src/Block05.sol";
import {MyContract as InternalExample} from "../src/Block06.sol";
import {Caller} from "../src/Block07.sol";
interface Vm {
 struct Log {bytes32[] topics;bytes data;address emitter;}
 function deal(address,uint256) external;
 function recordLogs() external;
 function getRecordedLogs() external returns(Log[] memory);
}
contract RecordingToken {
 address public caller; address public recipient; uint256 public amount;
 bool public result=true;
 function setResult(bool value) external {result=value;}
 function transfer(address to,uint256 value) external returns(bool) {caller=msg.sender;recipient=to;amount=value;return result;}
}
contract BehaviorTest {
 Vm constant vm=Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
 function testReceiveAcceptsEtherAndEmitsExactFields() public {
  ReceiveExample target=new ReceiveExample();vm.deal(address(this),10 ether);vm.recordLogs();
  (bool ok,)=address(target).call{value:2 ether}("");require(ok && address(target).balance==2 ether);
  Vm.Log[] memory logs=vm.getRecordedLogs();require(logs.length==1 && logs[0].emitter==address(target));
  require(logs[0].topics[0]==keccak256("Received(address,uint256)"));
  (address sender,uint256 amount)=abi.decode(logs[0].data,(address,uint256));require(sender==address(this)&&amount==2 ether);
 }
 function testReceiveWithoutFallbackRejectsUnknownSelector() public {
  ReceiveExample target=new ReceiveExample();(bool ok,)=address(target).call(hex"deadbeef");require(!ok);
 }
 function testFallbackHandlesEmptyAndUnknownCallsWithEther() public {
  FallbackExample target=new FallbackExample();vm.deal(address(this),10 ether);
  (bool first,)=address(target).call{value:1 ether}("");(bool second,)=address(target).call{value:2 ether}(hex"deadbeef");
  require(first&&second&&address(target).balance==3 ether);
 }
 function testInternalFunctionHasNoExternalSelector() public {
  InternalExample target=new InternalExample();target.publicCaller();
  (bool ok,)=address(target).call(abi.encodeWithSignature("internalFunction()"));require(!ok);
  // Printed internalFunction is intentionally empty; no invented state effect.
 }
 function testExternalCallReceivesEncodedArgumentsAndContractSender() public {
  Caller target=new Caller();RecordingToken token=new RecordingToken();target.paySomeone(address(token),address(0xbeef),123);
  require(token.recipient()==address(0xbeef)&&token.amount()==123&&token.caller()==address(target));
 }
 function testOriginalCallerDoesNotCheckFalseReturn() public {
  Caller target=new Caller();RecordingToken token=new RecordingToken();token.setResult(false);
  target.paySomeone(address(token),address(1),5);require(token.amount()==5);
  // Documents original behavior, not a safe-token-transfer implementation.
 }
}
