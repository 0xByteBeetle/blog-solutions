# Published examples

Source: https://andreyobruchkov1996.substack.com/p/understanding-solana-part4-instructions

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `12ede46f9c363de074f916a70dc90a637ce6d40b35b955a76ac13ba9e624797b`

````text
{
  “program_id”: “11111111111111111111111111111111”,
  “accounts”: [
    {
      “pubkey”: “6uR7N6oDgE3vJXvM6Eh4xVHw2g7o7YhA7FJxC4pXcZtT”,
      “is_signer”: true,
      “is_writable”: true
    },
    {
      “pubkey”: “3Nq8yVbGz7KpYw9sT6rF2LmHc4Qz5XvA1uJd8BvCzRy”,
      “is_signer”: false,
      “is_writable”: true
    }
  ],
  “data”: [2, 0, 0, 0, 128, 150, 152, 0, 0, 0, 0, 0]
}
````

## Block 2

SHA-256: `5499b5016d4e8a2931be86c56a401fb0b81cc106241b6a8d2054c889b07b2168`

````text
pub enum SystemInstruction {
    CreateAccount { ... },
    Assign { ... },
    Transfer { lamports: u64 },
    ...
}
````

## Block 3

SHA-256: `2b5879a62915a06a9582e9010110641a30ab94ee837fa5922b8eafcb10c545b9`

````text
[2, 0, 0, 0, 128, 150, 152, 0, 0, 0, 0, 0]

which is:

[02 00 00 00 | 80 96 98 00 00 00 00 00] // 4 + 8 = 12
````

## Block 4

SHA-256: `72441108f6871e3e27e9c5ecc544a0e9677a4cf64f7848c47c1b62713ba319d0`

````text
[2, 0, 0, 0]  → discriminant = 2
[128, 150, 152, 0, 0, 0, 0, 0] → bytes to hex
[80 96 98 00 00 00 00 00] → hex representation
[0x00000000989680] → 0x00989680 = 10_000_000 lamports (0.01 SOL)
````

## Block 5

SHA-256: `1220832caa86f8239416c301b1abd7cb1573c926cc6c955fc3a6cca8e1a1382c`

````text
pub struct Message {
    pub header: MessageHeader,
    pub account_keys: Vec<Address>,
    pub recent_blockhash: Hash,
    pub instructions: Vec<CompiledInstruction>,
}

pub struct MessageHeader {
    pub num_required_signatures: u8,
    pub num_readonly_signed_accounts: u8,
    pub num_readonly_unsigned_accounts: u8,
}

// As learned previously
pub struct CompiledInstruction {
    pub program_id_index: u8,
    pub accounts: Vec<u8>,
    pub data: Vec<u8>,
}
````

## Block 6

SHA-256: `d59e13f6476506b7424d5d5ef1ea0ce479bfc540d03c4500f78e36aafa551308`

````text
pub enum VersionedMessage {
    Legacy(LegacyMessage),
    V0(v0::Message),
}

pub struct Message {
  pub header: MessageHeader,
  pub account_keys: Vec<Pubkey>,
  pub recent_blockhash: Hash,
  pub instructions: Vec<CompiledInstruction>,
  /// List of address table lookups used to load additional accounts
  /// for this transaction.
  #[serde(with = “short_vec”)]
  pub address_table_lookups: Vec<MessageAddressTableLookup>,
}

pub struct MessageAddressTableLookup {
  pub account_key: Pubkey,
  #[serde(with = “short_vec”)]
  pub writable_indexes: Vec<u8>,
  #[serde(with = “short_vec”)]
  pub readonly_indexes: Vec<u8>,
}
````

## Block 7

SHA-256: `0d4ca0baf3a70bb40d9ae9fedb527abd1e9fd38df5a9253563bb9e0c35f1ad64`

````text
resolved_keys =
    [ message.account_keys
    , looked_up_writable_keys (from all ALTs, in order)
    , looked_up_readonly_keys (from all ALTs, in order)
    ]
````

## Block 8

SHA-256: `6de7668819a4e0d588499b791b6fa81d234a70ec193b14b6abc4ac8d5de9830a`

````text
pub writable_indexes: Vec<u8>,
pub readonly_indexes: Vec<u8>,
````

## Block 9

SHA-256: `3cf23dbcafb343d6d48d8f09e14a31994b732064f33cb9441a6c2bb9aa7d87f2`

````text
writable_indexes = [0, 2, 4, 6]
````

## Block 10

SHA-256: `ead2509fc98b5400ca17126184714748ccdc6172cdfbf5f14b828bbcd0961488`

````text
pub struct MessageAddressTableLookup {
  pub account_key: Pubkey,
  #[serde(with = “short_vec”)]
  pub writable_indexes: Vec<u8>,
  #[serde(with = “short_vec”)]
  pub readonly_indexes: Vec<u8>,
}
````
