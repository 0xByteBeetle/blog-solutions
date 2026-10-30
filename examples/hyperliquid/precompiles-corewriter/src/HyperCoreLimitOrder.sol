// Supplemental compiler setup; published block body below is unchanged.
pragma solidity 0.8.30;

import {ICoreWriter} from "./UsdClassTransfer.sol";

contract HyperCoreLimitOrder {
    address constant CORE_WRITER = 0x3333333333333333333333333333333333333333;

    uint8 constant TIF_ALO = 1;
    uint8 constant TIF_GTC = 2;
    uint8 constant TIF_IOC = 3;

    function placeLimitOrder(uint32 asset,bool isBuy,uint64 limitPx,uint64 sz,bool reduceOnly,uint8 tif,uint128 cloid) external {
        bytes memory payload = abi.encode(asset,isBuy,limitPx,sz,reduceOnly,tif,cloid);

        bytes memory data = bytes.concat(hex"01000001", payload);

        ICoreWriter(CORE_WRITER).sendRawAction(data);
    }
}
