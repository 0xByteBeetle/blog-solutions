# Published examples

Source: https://andreyobruchkov1996.substack.com/p/understanding-solana-account-model

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `3acae42638406560ecf60e92a90f478c719c4d04e11724dd86efc7fe2c2fef9e`

````text
struct Account {
    // num of lamports in the account
    lamports:   uint64,
    // data held in this account
    data:       bytes,
    // PubKey that owns this account. If executable, the program that loads this account.
    owner:      Pubkey,
    // this account’s data contains a loaded program (and is now read-only)
    executable: bool,
    // the epoch at which this account will next owe rent
    rent_epoch: Epoch,
}
````

## Block 2

SHA-256: `c9cc4a2f03737ebe3a90a52dacc5208d497b7c15ecd3f0284766eaa1d3b3eb29`

````text
Pubkey::find_program_address(seeds: &[&[u8]], program_id: &Pubkey)
````

## Block 3

SHA-256: `ab8c7a7497c445a31b9d41d51348fa0d62ee7eb0e5b84336614dfd8d9531e3e4`

````text
let (vault_pda, bump) =
    Pubkey::find_program_address(&[b”my_vault”, user.key().as_ref()], &program_id);
````

## Block 4

SHA-256: `47b424b5e5a6c018bd1f49073b7a8fa379f45a49f60803c02898c040e26106c7`

````text
invoke_signed(
    &instruction,
    &account_infos,
    &[&[b”my_vault”, user.key().as_ref(), &[bump]]],
)?;
````

## Block 5

SHA-256: `fa444c37c47ec8c3ce44f8a09352dfbdc1766df9ca142dc9dfbc9269ff1e635f`

````text
Address:  pool_pda (derived from [”pool”, token_a, token_b])
Owner:    MyDex111111111111111111111111111111111111111
Data:     { token_a, token_b, reserves, bump }
````

## Block 6

SHA-256: `c38b9d7634462a99bc32af3522f3e8f9dbb6c253e6c233cb4e0b81e1838f6b1a`

````text
account.owner = <your program id>
````

## Block 7

SHA-256: `5d89f68fcd637d09a4d0c2eb1f4b7c5ecc3a20d3f63fe13d70af6b5eb5a1c2a8`

````text
let rent = Rent::get()?;
let lamports = rent.minimum_balance(space);
````
