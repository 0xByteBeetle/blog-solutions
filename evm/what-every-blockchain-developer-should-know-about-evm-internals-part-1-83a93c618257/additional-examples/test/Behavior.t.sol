// Supplemental state assertions; exact published contract body unchanged.
pragma solidity 0.8.30;
import {CalldataExample} from "../src/Block06.sol";
contract BehaviorTest {
 function testStoresCalldataAndReplacesPriorName() public {
  CalldataExample target=new CalldataExample();target.setName("Andrey");require(keccak256(bytes(target.storedName()))==keccak256("Andrey"));
  target.setName("ByteBeetle");require(keccak256(bytes(target.storedName()))==keccak256("ByteBeetle"));
 }
 function testEmptyAndLongStringCrossesStorageWordBoundary() public {
  CalldataExample target=new CalldataExample();string memory text="01234567890123456789012345678901234567890123456789";
  target.setName(text);require(keccak256(bytes(target.storedName()))==keccak256(bytes(text)));
  target.setName("");require(bytes(target.storedName()).length==0);
 }
}
