# Published examples

Source: https://andreyobruchkov1996.substack.com/p/the-utility-extensions-completing

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `c489d720cb6a4d0468c6b22cfd37088d6ae7e144546a025845223afa5a950b63`

````text
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-permanent-delegate
````

## Block 2

SHA-256: `592596e2deb66086e35158269d243326a3addf9cf7fb55a1ea4e2cfcab496928`

````text
# create token account for someone
spl-token create-account <MINT_ADDRESS> --owner <SOME_WALLET> --fee-payer ~/.config/solana/id.json

# mint 100 tokens to someone's Token Account
spl-token mint <MINT_ADDRESS> 100 <SOME_WALLET_TOKEN_ACCOUNT> 

````

## Block 3

SHA-256: `8e9784d02787af4950f8c5b8b5522b3de2de085dd13422b5f3930eeffaff24b2`

````text
spl-token burn <SOMEONE_TOKEN_ACCOUNT> 50
````

## Block 4

SHA-256: `63b9b5d580129c33ed326f195d66dc0f1c0174b405d4f35a6e90ef53a78e8570`

````text

spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-non-transferable
````

## Block 5

SHA-256: `54afca74d82a13cb4f0922bc3013e9a9438d1aca56ebdbad34e19f453b53cb89`

````text
spl-token transfer 7b7FYYVpa5xgTS3PCHAU6ZBDjD1NbwZcKCqYcMmArj4n 50 L6h2ugreR3oNmKtBCpcsMPSLg3BwLR31fSPB1iU76mp
````

## Block 6

SHA-256: `4685c8df0c1a4aa0dce0ab1e1f01d26668a746ef54935cf75ee59d3e62581733`

````text
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-permanent-delegate --enable-non-transferable
````

## Block 7

SHA-256: `485edb588a649d3805a9b4a3d3c39b88564944c0a28d7f0eb339e50268992234`

````text
# Create a compliance-gated Mint
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --default-account-state frozen --enable-freeze
````

## Block 8

SHA-256: `c1f089cd2e2b62ff907a9e61b1595386758d51353aa5e4f8c8ac6222afb3d9bd`

````text
spl-token mint <MINT_ADDRESS> 100 <SOME_TOKEN_ACCOUNT>
````

## Block 9

SHA-256: `ffbaae836404d7c03b3028470ceca082513ecbfd9d32d9928f51093bcd6d3b8e`

````text
spl-token thaw <SOME_TOKEN_ACCOUNT>
````

## Block 10

SHA-256: `c1f089cd2e2b62ff907a9e61b1595386758d51353aa5e4f8c8ac6222afb3d9bd`

````text
spl-token mint <MINT_ADDRESS> 100 <SOME_TOKEN_ACCOUNT>
````

## Block 11

SHA-256: `4006a93c8742d144e5685f2a2be18f3a6aee3df16b275ac674522466f8bfb31f`

````text
# Alice enforces memos on her own Token Account
spl-token enable-required-transfer-memos <ALICE_TOKEN_ACCOUNT_ADDRESS>

````

## Block 12

SHA-256: `f8d7cf6789c59118559eadba0edbc4a48117b6b232e2b8b06e7ca381ff1721b9`

````text
spl-token transfer <MINT_ADDRESS> 50 <ALICE_TOKEN_ACCOUNT_ADDRESS>
````

## Block 13

SHA-256: `5f2c1bbee49fb9b04483d43b30eead968d10dfd63e02b866ee6f24ba26c7242d`

````text
# The sender must explicitly attach the memo for the transaction to succeed
spl-token transfer <MINT_ADDRESS> 50 <ALICE_TOKEN_ACCOUNT_ADDRESS> --with-memo "Invoice payment for Q3 RPC node hosting"
````
