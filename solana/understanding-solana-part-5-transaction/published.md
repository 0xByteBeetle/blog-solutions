# Published examples

Source: https://andreyobruchkov1996.substack.com/p/understanding-solana-part-5-transaction

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `fe992de2e8ecbf2fa6c3e960568c56270f47eac9d201d36b8735badf5a1c1b00`

````text
pub struct Transaction {
    #[serde(with = “short_vec”)]
    pub signatures: Vec<Signature>,
    pub message: Message,
}
````

## Block 2

SHA-256: `ff9c2d877094ef18b6c12cca17c08a803ef0550adc3f3ac9688ff1537d1260a6`

````text
 pub struct Signature(GenericArray<u8, U64>);
````

## Block 3

SHA-256: `81630e2d7c252c0db29043b4da3c1f7031d0661b718233e4347626788fd971ea`

````text
Prioritization fee = CU limit × CU price
````

## Block 4

SHA-256: `7d489419cdd83e620b0e542fd8195b38e7e7b4ab735a79e6abc5e760aa25d340`

````text
Priority = (Prioritization fee + Base fee) / (1 + CU limit + Signature CUs + Write lock CUs)
````

## Block 5

SHA-256: `4e98e91147c8ba9669ee006dab98c649090f8026629104bca820c1639d15afdc`

````text
SetComputeUnitLimit 
````

## Block 6

SHA-256: `22bf4d2499107096cc888e579e2146cea2a12287af8d250d676a7e0bc3e46462`

````text
SetComputeUnitPrice 
````

## Block 7

SHA-256: `ae006acedddae21c1c9d29af80cecf8e487857879cf022a9937f81343ea4539c`

````text
ComputeBudget
````

## Block 8

SHA-256: `06f68490d2b93cb4247edbaa202f368034ecb0953204bfdc4eb36db20f7172e6`

````text
Total fee = BaseFee + PriorityFee =  0.000004 + 0.000005 = 0.000009
````

## Block 9

SHA-256: `72072e6ad24d1abf210e11ea01308938e00cbbaeab1243ccd95bcd51e0d11cb9`

````text
signature = Ed25519_sign(private_key, message_bytes)
````
