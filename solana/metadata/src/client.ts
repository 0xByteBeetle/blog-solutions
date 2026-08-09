import { readFileSync } from "node:fs";

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  keypairIdentity,
  type Umi,
} from "@metaplex-foundation/umi";

export function createWalletUmi(rpcUrl: string, keypairPath: string): Umi {
  const secret = JSON.parse(readFileSync(keypairPath, "utf8")) as number[];
  const umi = createUmi(rpcUrl);
  const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
  return umi.use(keypairIdentity(createSignerFromKeypair(umi, keypair)));
}

export function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
