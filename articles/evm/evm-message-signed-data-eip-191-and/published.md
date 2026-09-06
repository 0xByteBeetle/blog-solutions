# Published examples

Source: https://andreyobruchkov1996.substack.com/p/evm-message-signed-data-eip-191-and

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `86f6134c6dd448557651c8d55f10256871d6b5b61853c48a57758e8718eae957`

````text
“\x19” || version || data
````

## Block 2

SHA-256: `7710fe24e91bcecc02c2bf42fbdb5e0614ef4d20d4941298517b9ee7d4b54ccc`

````text
0x19 <0x45 (E)> <thereum Signed Message:\n” + len(message)> <data to sign>
````

## Block 3

SHA-256: `88e0897786484579dc52aaae521d331468d18d569bb906f803a574b2c736c961`

````text
“\x19Ethereum Signed Message:\n5hello”
````

## Block 4

SHA-256: `06976674e371616d8dd2c86efb30424c0cf6eea9affd226b6f53038cb4afe3f6`

````text
hash = keccak256(”\x19Ethereum Signed Message:\n” + len(message) + message)
````

## Block 5

SHA-256: `c1a7fd0dfdfb6c0d6f5fdf6d7c87784fd083e4c5cb6f3f404d54e7e5a24df84a`

````text
package main

func main() {
   _, acc2Priv := account.GetAccount(2)
   message := []byte(”Login to app.xyz”)
   prefixed := fmt.Sprintf(”\x19Ethereum Signed Message:\n%d%s”, len(message), message)
   hash := crypto.Keccak256Hash([]byte(prefixed))
  
   // Sign the hash
   signature, err := crypto.Sign(hash.Bytes(), acc2Priv)
   if err != nil {
    log.Fatal(err)
   }

   fmt.Printf(”Message: %s\n”, message)
   fmt.Printf(”Prefixed Hash: 0x%x\n”, hash.Bytes())
   fmt.Printf(”Signature: 0x%x\n”, signature)

   // Recover the public key
   pubKey, err := crypto.SigToPub(hash.Bytes(), signature)
   if err != nil {
    log.Fatal(err)
   }

   recoveredAddr := crypto.PubkeyToAddress(*pubKey)
   fmt.Printf(”Recovered Address: %s\n”, recoveredAddr.Hex())
}
````

## Block 6

SHA-256: `ebf1460db49c96f101d128414cd02ec459028df0d99e9fcb0912b4afb21350d6`

````text
Message: Login to app.xyz
Prefixed Hash: 0x9ebab044560303562376f745e565c97c0995cba432397d082cf3260c5e1d6f78
Signature: 0xe89fe57d906e3fa29381c074462c823ecef612485f83cc34ecb6bb511a3da7cf6d82fc7ec21416f1542957e19e154ef00a9bcdd13510af2e911b6e3a6ea3fdd600
Recovered Address: 0xCBAf22b5fA52647af668bb1E895Bb8458028cDE6
````
