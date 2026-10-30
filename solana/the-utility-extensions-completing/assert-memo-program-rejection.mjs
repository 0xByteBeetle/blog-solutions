// Supplemental local fixture: exercise Token-2022 NoMemo beneath the CLI precheck.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const args=process.argv.slice(2);
if(args.length!==5)throw new Error('Expected owned fixture directory, mint, source, destination, loopback RPC');
const [directory,mintAddress,sourceAddress,destinationAddress,rpc]=args;
const url=new URL(rpc);
if(url.protocol!=='http:'||!['127.0.0.1','localhost'].includes(url.hostname)||!url.port||url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('Only explicit loopback RPC is allowed');
const root=fs.realpathSync(import.meta.dirname), local=path.join(root,'.local');
const fixture=fs.realpathSync(directory);
if(path.dirname(fixture)!==local||!/^run-[A-Za-z0-9]+$/.test(path.basename(fixture)))throw new Error('Only this article own fresh run directory is allowed');
const require=createRequire(path.join(root,'package.json'));
const {Connection,Keypair,PublicKey,Transaction,SendTransactionError,sendAndConfirmTransaction}=require('@solana/web3.js');
const {TOKEN_2022_PROGRAM_ID,createTransferCheckedInstruction}=require('@solana/spl-token');
function ownedKey(name){const file=path.join(fixture,name+'.json');const stat=fs.lstatSync(file);if(!stat.isFile()||stat.isSymbolicLink())throw new Error('Fixture key must be a regular owned file');return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(file,'utf8'))));}
const payer=ownedKey('payer'),owner=ownedKey('alice'),connection=new Connection(rpc,'confirmed');
const mint=new PublicKey(mintAddress),source=new PublicKey(sourceAddress),destination=new PublicKey(destinationAddress);
async function balances(){return Promise.all([source,destination].map(async address=>{const response=await connection.getTokenAccountBalance(address,'confirmed');assert.ok(Number.isInteger(response.context.slot));assert.equal(response.value.decimals,0);return response.value.amount;}));}
const before=await balances();assert.deepEqual(before,['100','0']);
const tx=new Transaction().add(createTransferCheckedInstruction(source,mint,destination,owner.publicKey,50n,0,[],TOKEN_2022_PROGRAM_ID));
let rejection;
try{await sendAndConfirmTransaction(connection,tx,[payer,owner],{commitment:'confirmed',preflightCommitment:'confirmed'});}catch(error){rejection=error;}
assert.ok(rejection instanceof SendTransactionError,'Expected actual transaction simulation rejection');
const logs=rejection.logs??await rejection.getLogs(connection);
assert.ok(logs.some(line=>line.includes('Program '+TOKEN_2022_PROGRAM_ID.toBase58()+' failed:')),'Expected Token-2022 program failure');
assert.ok(logs.some(line=>line.includes('No memo in previous instruction')),'Expected specific NoMemo rejection');
const after=await balances();assert.deepEqual(after,before,'Rejected memo-less instruction changed token balances');
console.log(JSON.stringify({check:'Token-2022 NoMemo program rejection and unchanged balances',program:TOKEN_2022_PROGRAM_ID.toBase58(),before,after,logs,publicNetwork:false},null,2));
