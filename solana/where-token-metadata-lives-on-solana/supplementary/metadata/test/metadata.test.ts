import assert from "node:assert/strict";
import test from "node:test";

import {
  createMetadataAccountV3,
  findMetadataPda,
  MPL_TOKEN_METADATA_PROGRAM_ID,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createSignerFromKeypair,
  generateSigner,
  keypairIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

function testUmi() {
  const umi = createUmi("http://127.0.0.1:8899").use(mplTokenMetadata());
  const identity = createSignerFromKeypair(umi, umi.eddsa.generateKeypair());
  return umi.use(keypairIdentity(identity));
}

test("derives the canonical metadata PDA from the mint", () => {
  const umi = testUmi();
  const mint = generateSigner(umi);
  const [metadataPda, bump] = findMetadataPda(umi, { mint: mint.publicKey });
  const [derivedAgain, secondBump] = findMetadataPda(umi, { mint: mint.publicKey });

  assert.equal(metadataPda, derivedAgain);
  assert.equal(bump, secondBump);
});

test("builds a CreateMetadataAccountV3 instruction with explicit metadata", () => {
  const umi = testUmi();
  const mint = generateSigner(umi);
  const builder = createMetadataAccountV3(umi, {
    mint: mint.publicKey,
    mintAuthority: umi.identity,
    payer: umi.identity,
    updateAuthority: umi.identity.publicKey,
    data: {
      name: "Example Token",
      symbol: "EXMPL",
      uri: "https://example.com/metadata.json",
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    },
    isMutable: true,
    collectionDetails: null,
  });

  const instructions = builder.getInstructions();
  assert.equal(instructions.length, 1);
  assert.equal(instructions[0].programId, MPL_TOKEN_METADATA_PROGRAM_ID);
  assert.ok(instructions[0].data.length > 0);
});
