/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/zero_copy.json`.
 */
export type ZeroCopy = {
  "address": "6LEQabRZV5yviGWzAFBw7qj1Dxc1sq7VKgJCcfyZiezi",
  "metadata": {
    "name": "zeroCopy",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "drawPixel",
      "discriminator": [
        73,
        119,
        1,
        148,
        63,
        185,
        103,
        222
      ],
      "accounts": [
        {
          "name": "canvas",
          "writable": true
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "canvas"
          ]
        }
      ],
      "args": [
        {
          "name": "index",
          "type": "u16"
        },
        {
          "name": "color",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeLargeCanvas",
      "discriminator": [
        50,
        107,
        193,
        170,
        162,
        15,
        14,
        63
      ],
      "accounts": [
        {
          "name": "canvas",
          "writable": true
        },
        {
          "name": "admin",
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "initializeMarket",
      "discriminator": [
        35,
        35,
        189,
        193,
        155,
        48,
        170,
        203
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true,
          "signer": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "updateVolume",
      "discriminator": [
        166,
        55,
        189,
        6,
        146,
        48,
        56,
        22
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true,
          "relations": [
            "market"
          ]
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "largeCanvas",
      "discriminator": [
        249,
        123,
        84,
        79,
        1,
        246,
        137,
        97
      ]
    },
    {
      "name": "marketState",
      "discriminator": [
        0,
        125,
        123,
        215,
        95,
        96,
        164,
        194
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "volumeOverflow",
      "msg": "The volume would overflow u64"
    },
    {
      "code": 6001,
      "name": "pixelOutOfRange",
      "msg": "The pixel index is outside the canvas"
    },
    {
      "code": 6002,
      "name": "drawCountOverflow",
      "msg": "The draw counter would overflow u64"
    },
    {
      "code": 6003,
      "name": "wrongAuthority",
      "msg": "Only the stored authority can mutate this zero-copy account"
    }
  ],
  "types": [
    {
      "name": "largeCanvas",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "totalDrawn",
            "type": "u64"
          },
          {
            "name": "pixels",
            "type": {
              "array": [
                "u8",
                10240
              ]
            }
          }
        ]
      }
    },
    {
      "name": "marketState",
      "serialization": "bytemuck",
      "repr": {
        "kind": "c"
      },
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "padding1",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          },
          {
            "name": "totalVolume",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "u8"
          },
          {
            "name": "padding2",
            "type": {
              "array": [
                "u8",
                7
              ]
            }
          },
          {
            "name": "authority",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
