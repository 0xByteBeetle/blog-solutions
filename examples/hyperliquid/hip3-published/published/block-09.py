expected = f"DEPLOY {coin}"
typed = input(f"Type '{expected}' to submit this TESTNET action: ")
if typed != expected:
    raise RuntimeError("submission cancelled")

nonce = get_timestamp_ms()
signature = sign_l1_action(
    wallet,
    action,
    None,
    nonce,
    None,
    False,  # is_mainnet=False selects the testnet signing domain
)

response = API(TESTNET_API_URL).post(
    "/exchange",
    {
        "action": action,
        "nonce": nonce,
        "signature": signature,
        "vaultAddress": None,
        "expiresAfter": None,
    },
)

print(json.dumps(response, indent=2))
