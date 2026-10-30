"""Show which values change a Hyperliquid L1 action's connection ID."""

import json

from hyperliquid.utils.signing import action_hash


NONCE = 1_900_000_000_000
SUBACCOUNT_ADDRESS = "0x" + "33" * 20


def order_action(size: str = "0.001") -> dict:
    return {
        "type": "order",
        "orders": [
            {
                "a": 0,
                "b": True,
                "p": "100000",
                "s": size,
                "r": False,
                "t": {"limit": {"tif": "Alo"}},
            }
        ],
        "grouping": "na",
    }


def connection_id(
    action: dict,
    vault_address: str | None = None,
    expires_after: int | None = None,
) -> str:
    value = action_hash(
        action,
        vault_address=vault_address,
        nonce=NONCE,
        expires_after=expires_after,
    )
    return "0x" + value.hex()


canonical_action = order_action()
reordered_action = {
    "grouping": canonical_action["grouping"],
    "orders": canonical_action["orders"],
    "type": canonical_action["type"],
}

results = {
    "canonical": connection_id(canonical_action),
    "withSubaccountTarget": connection_id(
        canonical_action,
        vault_address=SUBACCOUNT_ADDRESS,
    ),
    "withExpiresAfter": connection_id(
        canonical_action,
        expires_after=NONCE + 30_000,
    ),
    "differentFieldOrder": connection_id(reordered_action),
    "sizeString0.0010": connection_id(order_action(size="0.0010")),
}

print(json.dumps(results, indent=2))
print("allConnectionIdsDifferent =", len(set(results.values())) == len(results))