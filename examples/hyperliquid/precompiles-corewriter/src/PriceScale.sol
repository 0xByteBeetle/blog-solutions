// Supplemental compiler setup; published block body below is unchanged.
pragma solidity 0.8.30;

// Supplemental wrapper exposes the exact internal article helper to tests.
library PriceScale {
function normalizePerpPrice(uint64 raw,uint8 szDecimals) internal pure returns (uint256) {
    uint8 divisorDecimals = 6 - szDecimals;
    return uint256(raw) * 1e18 / (10 ** divisorDecimals);
}
}
