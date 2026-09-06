# Published examples

Source: https://andreyobruchkov1996.substack.com/p/engineering-native-yield-a-deep-dive

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `33bc8b8813fb1890f24fabeae5d3e979ff5e2db8e3de5fed3698c7947d0fccee`

````text
fn process_update_rate(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    new_rate: &BasisPoints,
) -> ProgramResult {
    // ... Authority validation checks omitted for brevity

    let clock = Clock::get()?;
    
    // Calculate the historical average up to this exact second
    let new_average_rate = extension
        .time_weighted_average_rate(clock.unix_timestamp)
        .ok_or(TokenError::Overflow)?;
        
    // Lock in the historical average
    extension.pre_update_average_rate = new_average_rate.into();
    
    // Move the checkpoint timestamp forward to the current block
    extension.last_update_timestamp = clock.unix_timestamp.into();
    
    // Set the new active rate
    extension.current_rate = *new_rate;
    Ok(())
}
````

## Block 2

SHA-256: `f5c97cf79675a5d5b05bac2f8105a62ff9f757eb63aa6cbd4d659ea9f06e2c4b`

````text
spl-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb create-token --interest-rate 500

````

## Block 3

SHA-256: `2e41a05afb5e1ff4003fd3d2088568317cbfc56fe9db5fd7dbb2dc512d86dddb`

````text
Creating token Dmcd... (your new mint address)
Signature: 4j...

````

## Block 4

SHA-256: `d2e5e6c5f621baec5409b239f060825d67317994a2d26d730b9530f7765d6927`

````text

spl-token display <YOUR_MINT_ADDRESS>
````

## Block 5

SHA-256: `9d6ef3b48e8903af1ad3917a9241cc71e8a4dba881bc4a47e230b81c5e6b581e`

````text
Extensions
  Interest-bearing:
    Current rate: 500bps
    Average rate: 500bps
    Rate authority: <YOUR_WALLET>

````

## Block 6

SHA-256: `750b7b3f51617984e4b66ebf99a17742ad5de3788176bdd7218194748cace708`

````text
spl-token set-interest-rate <YOUR_MINT_ADDRESS> 1000

````

## Block 7

SHA-256: `48daf39dd5ea4fbff85d6fd0195ae9b234ea50b7b9f508e6f23f52257bebe689`

````text
Extensions
  Interest-bearing:
    Current rate: 1000bps
    Average rate: 500bps
    Rate authority: L6h2ugreR3oNmKtBCpcsMPSLg3BwLR31fSPB1iU76mp
````

## Block 8

SHA-256: `9e6f050b437c3092cafcdf006f5d3e05ae72774b8c4478b10bde0a34cf95ed2e`

````text

spl-token create-account <YOUR_MINT_ADDRESS>
spl-token mint <YOUR_MINT_ADDRESS> 100
````

## Block 9

SHA-256: `51351964350a906fc92edb64e4842d81d83ad1dc0a8c8343fd7a7c6feef67679`

````text
curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" -d '
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getTokenAccountBalance",
  "params": [
    "<YOUR_TOKEN_ACCOUNT_ADDRESS>"
  ]
}'

````

## Block 10

SHA-256: `157ac6a551a829b8016d99134f05644e495c3aa60fab510994048e44461fbf11`

````text

{
  "jsonrpc": "2.0",
  "result": {
    "context": {
      "apiVersion": "3.1.10",
      "slot": 448286815
    },
    "value": {
      "amount": "100000000000",   <-- The raw principal (100 tokens with 9 decimals)
      "decimals": 9,
      "uiAmount": 100.009224922,  <-- The mathematically yielded balance!
      "uiAmountString": "100.009224922"
    }
  },
  "id": 1
}
````
