// Supplemental wrapper exercises exact published library; original diamond untouched.
pragma solidity 0.8.30;
import {CounterStorage} from "../src/Block25.sol";
interface Vm {function load(address,bytes32) external view returns(bytes32);}
contract LayoutHarness {
 uint256 public ordinary=77;
 function set(uint256 value) external {CounterStorage.layout().counter=value;}
 function get() external view returns(uint256) {return CounterStorage.layout().counter;}
}
contract BehaviorTest {
 Vm constant vm=Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
 function testWritesExactNamespacedSlotNotSlotZero() public {
  LayoutHarness h=new LayoutHarness();h.set(123);
  require(h.get()==123&&h.ordinary()==77);
  require(uint256(vm.load(address(h),keccak256("example.counter.storage")))==123);
  require(uint256(vm.load(address(h),bytes32(0)))==77);
 }
 function testIndependentContractStorageAndOverwrite() public {
  LayoutHarness a=new LayoutHarness();LayoutHarness b=new LayoutHarness();a.set(9);b.set(4);a.set(11);
  require(a.get()==11&&b.get()==4&&a.ordinary()==77&&b.ordinary()==77);
 }
}
