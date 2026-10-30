// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import "forge-std/Test.sol";
import "../src/Storage.sol";

contract StorageTest is Test {
    Storage public storageContract;

    function setUp() public {
        storageContract = new Storage();
    }

    function testStoreStruct() public {
        Storage.my_storage_struct memory input = Storage.my_storage_struct({
            number: 25,
            owner: "bob"
        });

        storageContract.store(input);
    }
   
    function testStoreStructReverts() public {
        Storage.my_storage_struct memory input = Storage.my_storage_struct({
            number: 101,
            owner: "too much"
        });
        
        vm.expectRevert("Number too large"); 
        storageContract.store(input);
    }

}
