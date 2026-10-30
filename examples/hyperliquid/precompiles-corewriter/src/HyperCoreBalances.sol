// Supplemental compiler setup; published block body below is unchanged.
pragma solidity 0.8.30;

library HyperCoreBalances {
    address constant SPOT_BALANCE = 0x0000000000000000000000000000000000000801;

    struct SpotBalance {
        uint64 total;
        uint64 hold;
        uint64 entryNtl;
    }

    function spotBalance(address user, uint64 token ) internal view returns (SpotBalance memory) {
        (bool ok, bytes memory out) = SPOT_BALANCE.staticcall(abi.encode(user, token));

        require(ok, "spotBalance precompile failed");
        return abi.decode(out, (SpotBalance));
    }
}
