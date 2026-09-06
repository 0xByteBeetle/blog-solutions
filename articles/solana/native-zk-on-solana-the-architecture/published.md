# Published examples

Source: https://andreyobruchkov1996.substack.com/p/native-zk-on-solana-the-architecture

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `b606dc009c8eebf9ed7852c03dd982af70fb81952d879bebc9e3867dca04d74e`

````text

spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --enable-confidential-transfers auto
````

## Block 2

SHA-256: `66a6a309b8038689ac3af33efb45a6551e44124c4113652f5e9e2e1f3265fa4d`

````text

# Create the base token account
spl-token create-account <YOUR_MINT_ADDRESS>

# Allocate the cryptographic extension and generate the ElGamal keypair
spl-token configure-confidential-transfer-account <YOUR_MINT_ADDRESS>
````

## Block 3

SHA-256: `4a16b32bf53f5b5e1120a411ff3e0e44a2e1c7b6e55b18970cb3f074222c9edb`

````text
spl-token mint <YOUR_MINT_ADDRESS> 100

````

## Block 4

SHA-256: `0a2c44dd9a15376f894ae3f4cc7cda7f6396261a47fa595ebd29b691bb31b158`

````text
spl-token display <TOKEN_ACCOUNT_ACCRESS>
````

## Block 5

SHA-256: `56c46d4f022ff7e3dd64a3e40aeae4817b48d70f4639eccde9ffc046ab4394d0`

````text

spl-token deposit-confidential-tokens <YOUR_MINT_ADDRESS> 100
````

## Block 6

SHA-256: `0a2c44dd9a15376f894ae3f4cc7cda7f6396261a47fa595ebd29b691bb31b158`

````text
spl-token display <TOKEN_ACCOUNT_ACCRESS>
````

## Block 7

SHA-256: `5ba99eb4b93b4e6cdbbc64226a4a1573ebfb26d6c5dd9f684f53b1e58e2542d5`

````text
spl-token apply-pending-balance <MINT_ACCOUNT>

````

## Block 8

SHA-256: `398cdd46a7d188b90bc0c95733673351e74018f8bf432c8c740126e431744fc2`

````text
# Bob creates his token account
spl-token create-account <YOUR_MINT_ADDRESS> --owner bob.json

# Bob generates his ElGamal keypair and appends it to his account
spl-token configure-confidential-transfer-account <YOUR_MINT_ADDRESS> --owner bob.json
````

## Block 9

SHA-256: `87741b8235c0b8b6a07ccd40a5f8093815e77c158a1628266c9356da60b7b319`

````text
spl-token transfer <MINT_ACCOUNT> 50 <BOB_TOKEN_ACCOUNT> --confidential
````

## Block 10

SHA-256: `92dd4b6ff62decf8169320e6c9aac8c19914d24c539bb0f5f3aab7d0a52b005c`

````text
spl-token apply-pending-balance <MINT_ADDRESS>
````

## Block 11

SHA-256: `87741b8235c0b8b6a07ccd40a5f8093815e77c158a1628266c9356da60b7b319`

````text
spl-token transfer <MINT_ACCOUNT> 50 <BOB_TOKEN_ACCOUNT> --confidential
````

## Block 12

SHA-256: `ff58c4574aa76eb8cfe72fe28b54afea5f0393d39f1f35d9e3717c3c7d3d0974`

````text
spl-token withdraw-confidential-tokens <MINT_ADDRESS> 100

````
