# Published examples

Source: https://andreyobruchkov1996.substack.com/p/solana-token-2022-transfer-hooks

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `498c32e987bf7a01ba69d626c54bd419054219e732ad8729815c17f0426e2d4c`

````text
solana config set --url devnet
````

## Block 2

SHA-256: `4137147be2bc53482413b91ba20d4f1a78cea8592d025480f7261e92630d9c46`

````text
solana-keygen new --no-bip39-passphrase -o ./alice.json
solana-keygen new --no-bip39-passphrase -o ./bob.json
solana airdrop 1 -k ./alice.json
solana airdrop 1 -k ./bob.json
````

## Block 3

SHA-256: `6c44d2b34f86b4dffc226df33f3aeed4725257d59129f5ebc52ff2153e2149f7`

````text
spl-token create-token --help | grep -i fee
````

## Block 4

SHA-256: `b63ca1742c3c230bf379d0d3ef6c654ae94bf4e7ee4950b58b89767be8460f9f`

````text
solana config set --keypair ./alice.json
````

## Block 5

SHA-256: `012c6d5efb2d8213bdc9902a2de8665012d4131405f2f76f86f481f4f8cf6ca4`

````text
MINT=$(spl-token create-token \
  --program-2022 \
  --decimals 0 \
  --transfer-fee-basis-points 100 \
  --transfer-fee-maximum-fee 5 \
  | awk '/Creating token/ {print $3}')

echo "MINT=$MINT"

# Output:
# MINT=9ncw8asA7P79w7vJ3XbUFWW4EKy7cSYRVdhp9xjXb9cf
````

## Block 6

SHA-256: `fbe162a4f40b446da99361d985e730009b7d8da92d1de5968886dc084e1037e2`

````text
ALICE_ATA=$(spl-token create-account $MINT --program-2022 | awk '/Creating account/ {print $3}')
echo "ALICE_ATA=$ALICE_ATA"

# Output:
# ALICE_ATA=J9V83VXc4H1LcCHu6DjxKLn6tkem5Se4ZYiybLnqoG35
````

## Block 7

SHA-256: `cff1e3c9e26a157f86594c514ef33618d170eb5ab7e988b675609a629a9cbe20`

````text
# switch to bob
solana config set --keypair ./bob.json

BOB_ATA=$(spl-token create-account $MINT --program-2022 | awk '/Creating account/ {print $3}')
echo "BOB_ATA=$BOB_ATA"

# Output:
# BOB_ATA=G5DjAMaTSrTajDK3Y9EW1dwSsXz6SUWQdvpu9Ft3CNif

# Then switch back to Alice for minting/transferring:
solana config set --keypair ./alice.json 
````

## Block 8

SHA-256: `010803df2cd8cec4da3ce806d884f567b75fb5c86b8c18b3c3df40903a52e908`

````text
# Alice mints to herself
spl-token mint $MINT 1000 $ALICE_ATA --program-2022

# Alice transfers to Bob
spl-token transfer $MINT 100 $BOB_PUBKEY \
  --from $ALICE_ATA \
  --fund-recipient \
  --program-2022
````

## Block 9

SHA-256: `347d061f5a12a6b9ea624a7dc86cacf3fb05b93424b54d6f802209deb2311ad2`

````text
spl-token balance $MINT \
  --owner $BOB_PUBKEY \
  --program-2022

# Output:
# 99
````
