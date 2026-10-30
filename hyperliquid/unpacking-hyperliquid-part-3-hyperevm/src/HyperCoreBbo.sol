// Supplemental compiler setup; published block body below is unchanged.
pragma solidity 0.8.30;

library HyperCoreBbo {
    address constant BBO = 0x000000000000000000000000000000000000080e;

    struct Bbo {
        uint64 bid;
        uint64 ask;
    }

    function bbo(uint32 asset) internal view returns (Bbo memory) {
        (bool ok, bytes memory out) = BBO.staticcall(abi.encode(asset));

        require(ok, "bbo precompile failed");
        return abi.decode(out, (Bbo));
    }
}
