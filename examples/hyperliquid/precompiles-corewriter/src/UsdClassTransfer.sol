// Supplemental compiler setup; published block body below is unchanged.
pragma solidity 0.8.30;

interface ICoreWriter {
    function sendRawAction(bytes calldata data) external;
}

contract UsdClassTransfer {
    address constant CORE_WRITER = 0x3333333333333333333333333333333333333333;

    function transferUsdClass(uint64 ntl, bool toPerp) external {
        bytes memory payload = abi.encode(ntl, toPerp);
        bytes memory data = bytes.concat(hex"01000007", payload);

        ICoreWriter(CORE_WRITER).sendRawAction(data);
    }
}
