# Published examples

Source: https://andreyobruchkov1996.substack.com/p/unpacking-hyperliquid-part-5-agent

Captured 2026-10-30T15:11:13.535Z from the live rendered article. Native code/command/output blocks are preserved exactly, including whitespace; full article prose and images are not copied here. Outputs are historical observations, not live fixtures. Commands may target public networks; do not execute blindly.

## Block 1

SHA-256: `a8ba2ab32fe44a662b514d1b368bb0066f4e64bde81f7a766fac459f930ce9c5`

````text
master account = signing key = recovered signer = target account
````

## Block 2

SHA-256: `f122d49c1de565a57833c4910cbcbcd8c11beb0f2f87deb79ae2ac70109b42c7`

````text
master account
    | 
    approves API wallet
            | 
            API wallet signs an L1 action
                    |
                    HyperCore recovers the API-wallet address
                            | 
                            authorization maps it back to the master
````

## Block 3

SHA-256: `f0aee39784858c8ba265ca668a4746fd77ed0d5baa13ff601115324407fcb4d1`

````text
master account
    |
    approves API wallet
            | 
            API wallet signs
                    | 
                    vaultAddress selects the sub-account
````

## Block 4

SHA-256: `354c016b60d28af5909fd005c388d1d3d83b4681331527514e26fcba146b1b3a`

````text
agent = Account.create()
print(agent.address)
````

## Block 5

SHA-256: `36585d8993b6a1b644a3d268bd6fd4ec8f92e0098b0ce1d36f55ac94e2be4b07`

````text
generate a new key
    -> derive the agent address
    -> master signs approveAgent
    -> submit the authorization
    -> read the authorization back
    -> agent signs L1 actions
    -> rotate to another new key
````

## Block 6

SHA-256: `811adc209712838ebaf11845a82c316cacc0cf6d728d24ca4ea6e91ed6da1101`

````text
action dictionary
    | Msgpack
action bytes
    + nonce
    + vault-address marker and optional address
    + optional expiration marker and timestamp
    | Keccak-256
connectionId
    |
{ source, connectionId }
    | EIP-712
{ r, s, v }
````

## Block 7

SHA-256: `291066e369483c4ef5ecefba489c02183bd5cd6d987ffa74e221e2fe00fc09b7`

````text
python3 -m venv .venv
source .venv/bin/activate
python -m pip install "hyperliquid-python-sdk==0.24.0"
````

## Block 8

SHA-256: `32ff6ba25233749f79509cd56bbdd0f7bf45e253d8c200d8885939f5d8499fbe`

````text
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
````

## Block 9

SHA-256: `7c15e23e5842568e3ffce4c817fc68be4488c85d9cb6aea77d82a58dedf6d82d`

````text
python 01_sign_and_recover.py
````

## Block 10

SHA-256: `7ddd021042bff830af40787d6b846d841c29b55ab7e1a836e0245a2fd2565497`

````text
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
````

## Block 11

SHA-256: `9a053ab7412ca4c81c1f3368ff01d5af9717629d98e2ed897437f0d644e753a1`

````text
python 02_signed_preimage_mutations.py
````

## Block 12

SHA-256: `cf64b4655f0e5ca7b27fa2cfe89851bef688108e1ba660116e2c11a01a7daa0f`

````text
allConnectionIdsDifferent = True
````

## Block 13

SHA-256: `0e5cc284bb5d9d2ef20b7bbf60040b473e3f30ab0daed97b195bba7f5955c212`

````text
L1 error: User or API Wallet 0x... does not exist.
````

## Block 14

SHA-256: `840bc8223b7b8f399249adc1766eb933c11638cdab7ad95806dea5eb9b8acdde`

````text
our serialized bytes
    versus
official SDK serialized bytes
    versus
the action and metadata actually submitted
````

## Block 15

SHA-256: `47c3054b8668a9d8ea7090874d47a41b8f9f32c49f46304d2aabe14c8e2afdbe`

````text
(T - 2 days, T + 1 day)
````

## Block 16

SHA-256: `c99e0962cb105d4400a6207d842cd3df6f421f387c3c3d6b6d5c5511dae9bb28`

````text
agent key A -> master order
agent key A -> sub-account order
agent key A -> vault cancel

all three consume nonces from agent key A
````

## Block 17

SHA-256: `319122b135ea3aa8de9d65f4841910835460fe3466945f9bb56ac4a5a872424c`

````text
"""Compare timestamp-only nonces with a locked monotonic allocator."""

import json
import threading
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from typing import Callable


FIXED_TIME_MS = 1_900_000_000_000
WORKERS = 6


@dataclass
class MonotonicNonceAllocator:
    clock_ms: Callable[[], int]
    _last: int = 0
    _lock: threading.Lock = field(default_factory=threading.Lock)

    def next(self) -> int:
        with self._lock:
            now = self.clock_ms()
            self._last = max(now, self._last + 1)
            return self._last


def fixed_clock() -> int:
    return FIXED_TIME_MS


def run_workers(allocate: Callable[[], int]) -> list[int]:
    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        return list(executor.map(lambda _: allocate(), range(WORKERS)))


unsafe = run_workers(fixed_clock)
allocator = MonotonicNonceAllocator(fixed_clock)
safe = run_workers(allocator.next)

print(
    json.dumps(
        {
            "unsafeTimestampOnly": unsafe,
            "unsafeUniqueCount": len(set(unsafe)),
            "monotonicAllocatorSorted": sorted(safe),
            "safeUniqueCount": len(set(safe)),
        },
        indent=2,
    )
)
````

## Block 18

SHA-256: `2b8075773f5d2501c755b01610f52ff5c1c817c085f3ba2843f7fea288098e1c`

````text
python 03_nonce_allocator.py
````

## Block 19

SHA-256: `5ac2fba485984cb0c53cb9e36b2617f0cf25b8dc653df27a0fdbb170bf3862a6`

````text
market-data workers
    |
strategy or AI agent
    | unsigned intent
deterministic risk policy
    | validated Hyperliquid action
signer + nonce allocator
    | signed payload
submission worker
    |
HyperCore
    |
state reconciliation
````

## Block 20

SHA-256: `025f5331cd1880c3461158009d72a99292efdbaaa8416b301accd35d325c54e2`

````text
{
  "intent": "place_limit_order",
  "coin": "ETH",
  "side": "buy",
  "size": "0.01",
  "limitPrice": "1800",
  "timeInForce": "Alo"
}
````
