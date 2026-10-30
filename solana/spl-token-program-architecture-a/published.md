# Published examples

Source: https://andreyobruchkov1996.substack.com/p/spl-token-program-architecture-a

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `c217e452783c0cc7c1a7a91e20ab6fd7e660469056cb625484608406bc1906a0`

````text
pub struct Mint {
    pub mint_authority: COption<Pubkey>,
    pub supply: u64,
    pub decimals: u8,
    pub is_initialized: bool,
    pub freeze_authority: COption<Pubkey>,
}
````

## Block 2

SHA-256: `d4c71bf4689a3c4ba15bcd76cb4679bf4d718485f2619f2201eab2df7104187c`

````text
pub struct Account {
    pub mint: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
    pub delegate: COption<Pubkey>,
    pub state: AccountState,
    pub is_native: COption<u64>,
    pub delegated_amount: u64,
    pub close_authority: COption<Pubkey>,
}
````

## Block 3

SHA-256: `91cc921826c3f1bcbbcc7c62934ebbbcd45670b349b94a34ea37406edd7e4418`

````text
solana config set --url https://api.devnet.solana.com
````

## Block 4

SHA-256: `efaff20538fd951fd62ca2a95f21e219e7e6ce7af98b73372b11ba3e53d87a6a`

````text
solana-keygen new
````

## Block 5

SHA-256: `6762fa58d2767624b827d3dc641fbf550906aceb671ea467ee6cca46357bbba7`

````text
solana config get
````

## Block 6

SHA-256: `35e98880218d913c4a26475db1481c5764b9c93a8c20921275d98832f0c3d42e`

````text
solana airdrop 1
````

## Block 7

SHA-256: `e588c139ff068f8e457f54fe29fe343da67307b281ad7500fff722727b7f68ac`

````text
cargo install spl-token-cli
````

## Block 8

SHA-256: `5ca6fcf6ecccb64768fb860ddcabd54ad2d75df1cf9757ad437a7413f43a9b04`

````text
spl-token --version

// The output will look like:
// spl-token-cli 5.4.0
````

## Block 9

SHA-256: `111406a59d5a00fede94fa175a07c55fe873c3fa5104dc18c00f6830d8400cd8`

````text
spl-token create-token

// To specify decimal precision explicitly:
// spl-token create-token --decimals 6
````

## Block 10

SHA-256: `75ebbe3db08fcfe1238d3538d8a5d791423d9dfd9d50efb8e1975cd5ce1eea9e`

````text
spl-token create-account <MINT_ADDRESS>
````

## Block 11

SHA-256: `f4f88ced5be0463bf3d6e186f173f5bc8d221c720239516bd02bbc76546d17c8`

````text
spl-token mint <MINT_ADDRESS> 1000
````

## Block 12

SHA-256: `35d06d737cf7f13816d83924704e585b797edd521734c00ef5f69de1feb53449`

````text
spl-token balance <MINT_ADDRESS>
````

## Block 13

SHA-256: `d8df569085d10370417eb33ce8754cfc7b24311ee4164e50afb1484afbd0f1e2`

````text
spl-token transfer <MINT_ADDRESS> 100 <RECIPIENT_WALLET_ADDRESS> --fund-recipient
````
