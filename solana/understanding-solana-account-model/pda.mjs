// Supplemental executable form of the article's [b"my_vault", user] seeds.
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {PublicKey} from '@solana/web3.js';

export const user = new PublicKey(Buffer.alloc(32, 2));
export const program = new PublicKey(Buffer.alloc(32, 1));
export function derive(userKey = user, programId = program) {
  const seeds = [Buffer.from('my_vault'), userKey.toBuffer()];
  const [pda, bump] = PublicKey.findProgramAddressSync(seeds, programId);
  const reconstructed = PublicKey.createProgramAddressSync([...seeds, Buffer.from([bump])], programId);
  const hash = createHash('sha256').update(Buffer.concat([...seeds, Buffer.from([bump]), programId.toBuffer(), Buffer.from('ProgramDerivedAddress')])).digest();
  if (!pda.equals(reconstructed) || !pda.equals(new PublicKey(hash)) || PublicKey.isOnCurve(pda.toBytes())) {
    throw new Error('PDA derivation/reconstruction invariant failed');
  }
  return {pda, bump, seeds};
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const {pda, bump, seeds} = derive();
  console.log(JSON.stringify({user: user.toBase58(), program: program.toBase58(), seedsHex: seeds.map(s => s.toString('hex')), bump, pda: pda.toBase58(), offCurve: !PublicKey.isOnCurve(pda.toBytes()), reconstructed: true}, null, 2));
}
