"""Sign and recover two Hyperliquid messages without submitting anything.

The private keys below are public deterministic fixtures. Never fund them.
"""

import copy
import json

from eth_account import Account
from hyperliquid.utils.signing import (
    action_hash,
    construct_phantom_agent,
    recover_agent_or_user_from_l1_action,
    recover_user_from_user_signed_action,
    sign_agent,
    sign_l1_action,
)


MASTER_KEY = "0x" + "11" * 32
AGENT_KEY = "0x" + "22" * 32
NONCE = 1_900_000_000_000

APPROVE_AGENT_TYPES = [
    {"name": "hyperliquidChain", "type": "string"},
    {"name": "agentAddress", "type": "address"},
    {"name": "agentName", "type": "string"},
    {"name": "nonce", "type": "uint64"},
]

master = Account.from_key(MASTER_KEY)
agent = Account.from_key(AGENT_KEY)

# The master authorizes the agent with a user-signed EIP-712 action.
approve_action = {
    "type": "approveAgent",
    "agentAddress": agent.address,
    "agentName": "part5-demo",
    "nonce": NONCE,
}
approve_signature = sign_agent(master, approve_action, is_mainnet=False)
recovered_master = recover_user_from_user_signed_action(
    copy.deepcopy(approve_action),
    approve_signature,
    APPROVE_AGENT_TYPES,
    "HyperliquidTransaction:ApproveAgent",
    is_mainnet=False,
)

# The agent signs an L1 order through the phantom Agent envelope.
order_action = {
    "type": "order",
    "orders": [
        {
            "a": 0,
            "b": True,
            "p": "100000",
            "s": "0.001",
            "r": False,
            "t": {"limit": {"tif": "Alo"}},
        }
    ],
    "grouping": "na",
}
connection_id = action_hash(
    order_action,
    vault_address=None,
    nonce=NONCE,
    expires_after=None,
)
phantom_agent = construct_phantom_agent(connection_id, is_mainnet=False)
order_signature = sign_l1_action(
    agent,
    order_action,
    active_pool=None,
    nonce=NONCE,
    expires_after=None,
    is_mainnet=False,
)
mainnet_signature = sign_l1_action(
    agent,
    order_action,
    active_pool=None,
    nonce=NONCE,
    expires_after=None,
    is_mainnet=True,
)
recovered_agent = recover_agent_or_user_from_l1_action(
    order_action,
    order_signature,
    active_pool=None,
    nonce=NONCE,
    expires_after=None,
    is_mainnet=False,
)

print(
    json.dumps(
        {
            "warning": "PUBLIC TEST KEYS — NEVER FUND",
            "approveAgent": {
                "master": master.address,
                "agent": agent.address,
                "recoveredSigner": recovered_master,
                "matchesMaster": recovered_master.lower() == master.address.lower(),
            },
            "l1Order": {
                "connectionId": "0x" + connection_id.hex(),
                "phantomSource": phantom_agent["source"],
                "recoveredSigner": recovered_agent,
                "matchesAgent": recovered_agent.lower() == agent.address.lower(),
                "networkSignaturesDiffer": order_signature != mainnet_signature,
            },
            "submitted": False,
        },
        indent=2,
    )
)