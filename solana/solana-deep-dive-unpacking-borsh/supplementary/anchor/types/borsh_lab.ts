/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/borsh_lab.json`.
 */
export type BorshLab = {
  "address": "3bSwAt5S78JAqp3153dd2Jrm6nscvYYW2MgamGXDvw9P",
  "metadata": {
    "name": "borshLab",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "initializeProfile",
      "discriminator": [
        32,
        145,
        77,
        213,
        58,
        39,
        251,
        234
      ],
      "accounts": [
        {
          "name": "profile",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "age",
          "type": "u8"
        },
        {
          "name": "balance",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeProposal",
      "discriminator": [
        50,
        73,
        156,
        98,
        129,
        149,
        21,
        158
      ],
      "accounts": [
        {
          "name": "proposal",
          "writable": true,
          "signer": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "active",
          "type": {
            "option": "bool"
          }
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "voters",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "daoProposal",
      "discriminator": [
        140,
        16,
        138,
        15,
        20,
        224,
        135,
        137
      ]
    },
    {
      "name": "userProfile",
      "discriminator": [
        32,
        37,
        119,
        205,
        179,
        180,
        13,
        194
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "titleTooLong",
      "msg": "The title exceeds the allocated 64 UTF-8 bytes"
    },
    {
      "code": 6001,
      "name": "tooManyVoters",
      "msg": "The proposal supports at most four voters in this lab"
    }
  ],
  "types": [
    {
      "name": "daoProposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "active",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "voters",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "age",
            "type": "u8"
          },
          {
            "name": "balance",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
