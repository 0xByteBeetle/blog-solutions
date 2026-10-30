// Supplemental compiler setup; published block body below is unchanged.
pragma solidity 0.8.30;

library HyperCoreRead {
    address constant ORACLE_PX = 0x0000000000000000000000000000000000000807;

    function oraclePx(uint32 index) internal view returns (uint64) {
        (bool ok, bytes memory out) = ORACLE_PX.staticcall(abi.encode(index));

        require(ok, "oraclePx precompile failed");
        return abi.decode(out, (uint64));
    }
}
