// Supplemental compiler setup; published block body below is unchanged.
pragma solidity 0.8.30;

struct AccountMarginSummary {
    int64 accountValue;
    uint64 marginUsed;
    uint64 ntlPos;
    int64 rawUsd;
}
