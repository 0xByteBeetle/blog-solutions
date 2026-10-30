# Published examples

Source: https://andreyobruchkov1996.substack.com/p/from-convention-to-explicit-state

Captured 6 September 2026. These are the article's exact displayed blocks, not a claim that every block is a standalone program. Commands may target public networks; do not execute them blindly. Any literal Anvil keys are public test-only keys.

## Block 1

SHA-256: `f31689a1ae665243eaf97abe070b0a82293b622d89de2c98e38307b80cff1e23`

````text
spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb --decimals 9
````

## Block 2

SHA-256: `3c891c8b700f0ef7ae1c7e3342230f95a6bdd6be16412b81dcb7607049b0730c`

````text
spl-token create-token \                                        
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  --decimals 9 \
  --metadata-address <METADATA-ADDRESS>
````

## Block 3

SHA-256: `f94d63101b73bf41f7f680d6cee35e862a33cc37df265cdf0e501003b7b9de66`

````text
spl-token display <MINT-ADDRESS> \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
````

## Block 4

SHA-256: `dff305fece40d621fbd642bd188908c70223812d6473cc0588f53ad9af5168a3`

````text
spl-token create-token \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb \
  --decimals 9 \
  --enable-metadata
````

## Block 5

SHA-256: `0a254d3f68f3cc25e5e6da2f586146f32dd52b5b62d81708425ae4a1fecaa865`

````text
spl-token initialize-metadata <MINT-ADDRESS> \                  
  "Example Token" \
  "EXMPL" \                            
  "https://example.com/metadata.json" \                   
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
````

## Block 6

SHA-256: `355cd468b43ef90fd441047f1a6717b36ad72491cd8ec938f6d5844295f9d703`

````text
spl-token display <MINT-ADDRESS> \
  --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb 
````
