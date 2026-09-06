// Test fixtures/assertions only. The program and client under test are Andrey's source.
require('ts-node/register/transpile-only');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const anchor = require('@coral-xyz/anchor');
const spl = require('@solana/spl-token');
const {getBalancesClient,waitForAltReadiness} = require('../scripts/client-for-regression.ts');
const altReady=process.env.BLOG_ALT_READY==='1';

describe('Original wallet balances: reproducible local setup', function () {
  this.timeout(120000);
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const connection = provider.connection;
  const payer = provider.wallet.payer;
  const program = anchor.workspace.walletTokenBalances;
  let legacyMint, token22Mint, absentMint, alt;
  const preparedAlt=process.env.BLOG_PREPARED_ALT==='1';

  before(async function () {
    assert.match(connection.rpcEndpoint, /^http:\/\/127\.0\.0\.1:/);
    // Let a fresh validator root its startup state before creating token fixtures.
    const deadline=Date.now()+30000;
    while(await connection.getSlot('finalized')<1){
      if(Date.now()>deadline)throw new Error('Validator did not produce a rooted slot');
      await new Promise(resolve=>setTimeout(resolve,200));
    }
    legacyMint = await spl.createMint(connection,payer,payer.publicKey,null,6);
    token22Mint = await spl.createMint(connection,payer,payer.publicKey,null,6,undefined,undefined,spl.TOKEN_2022_PROGRAM_ID);
    absentMint = await spl.createMint(connection,payer,payer.publicKey,null,6);
    for (const [mint,programId,amount] of [[legacyMint,spl.TOKEN_PROGRAM_ID,123000000n],[token22Mint,spl.TOKEN_2022_PROGRAM_ID,456000000n]]) {
      const ata = await spl.getOrCreateAssociatedTokenAccount(connection,payer,mint,payer.publicKey,false,undefined,undefined,programId);
      await spl.mintTo(connection,payer,mint,ata.address,payer,amount,[],undefined,programId);
    }
    // A fresh validator must have a rooted recent slot before ALT creation.
    while(await connection.getSlot('finalized')<1){
      if(Date.now()>deadline)throw new Error('Validator did not produce a rooted slot');
      await new Promise(resolve=>setTimeout(resolve,200));
    }
    // The original creator failed with "8 is not a recent slot" on the fresh validator.
    // The temporary creator changes only confirmed -> finalized for recentSlot.
    process.stdout.write(execFileSync(process.execPath,['-r','ts-node/register/transpile-only','scripts/create-alts-for-regression.ts'],{encoding:'utf8',env:process.env}));
    alt = new anchor.web3.PublicKey(JSON.parse(fs.readFileSync('alt.json')).lookupTableAddress);
    assert.equal((await connection.getAddressLookupTable(alt)).value.state.addresses.length,0);
    if(preparedAlt){
      const addresses=[spl.getAssociatedTokenAddressSync(legacyMint,payer.publicKey),spl.getAssociatedTokenAddressSync(token22Mint,payer.publicKey,false,spl.TOKEN_2022_PROGRAM_ID)];
      const instruction=anchor.web3.AddressLookupTableProgram.extendLookupTable({payer:payer.publicKey,authority:payer.publicKey,lookupTable:alt,addresses});
      await anchor.web3.sendAndConfirmTransaction(connection,new anchor.web3.Transaction().add(instruction),[payer],{commitment:'finalized',preflightCommitment:'confirmed'});
      assert.equal((await connection.getAddressLookupTable(alt,{commitment:'finalized'})).value.state.addresses.length,2);
    }
  });

  it((preparedAlt?'uses a prepared ALT':'extends an empty ALT')+' and returns exact classic and Token-2022 balances',async function () {
    const result = await getBalancesClient(program,[{wallet:payer.publicKey,mints:[legacyMint,token22Mint]}],alt);
    assert.deepEqual(result.balances.map(b=>b.amount),[123000000n,456000000n]);
    assert.deepEqual(result.balances.map(b=>b.mint.toBase58()),[legacyMint,token22Mint].map(p=>p.toBase58()));
    assert.ok(result.balances.every(b=>b.wallet.equals(payer.publicKey)));
    const tx = await connection.getTransaction(result.sig,{commitment:'confirmed',maxSupportedTransactionVersion:0});
    assert.equal(tx.meta.err,null);
    assert.equal(tx.version,0);
    assert.ok(tx.transaction.message.addressTableLookups.some(x=>x.accountKey.equals(alt)));
    console.log('Verified raw balances: classic=123000000, Token-2022=456000000; v0 transaction uses the created ALT.');
  });

  it('returns zero for a missing ATA while reusing the existing ALT',async function () {
    const before = (await connection.getAddressLookupTable(alt)).value.state.addresses.map(p=>p.toBase58());
    const result = await getBalancesClient(program,[{wallet:payer.publicKey,mints:[legacyMint,token22Mint,absentMint]}],alt);
    assert.deepEqual(result.balances.map(b=>b.amount),[123000000n,456000000n,0n]);
    assert.deepEqual((await connection.getAddressLookupTable(alt)).value.state.addresses.map(p=>p.toBase58()),before);
    console.log('Verified missing ATA=0; existing ALT entries were reused.');
  });

  if(altReady)it('extends the used ALT again when a previously absent ATA is created',async function () {
    const before=(await connection.getAddressLookupTable(alt,{commitment:'confirmed'})).value.state.addresses.length;
    const ata=await spl.getOrCreateAssociatedTokenAccount(connection,payer,absentMint,payer.publicKey);
    await spl.mintTo(connection,payer,absentMint,ata.address,payer,789000000n);
    const result=await getBalancesClient(program,[{wallet:payer.publicKey,mints:[legacyMint,token22Mint,absentMint]}],alt);
    assert.deepEqual(result.balances.map(b=>b.amount),[123000000n,456000000n,789000000n]);
    assert.equal((await connection.getAddressLookupTable(alt,{commitment:'confirmed'})).value.state.addresses.length,before+1);
    console.log('Verified a second ALT extension with a newly created token account.');
  });
});

if(altReady)describe('ALT readiness guard',function(){
  const address=anchor.web3.Keypair.generate().publicKey;
  const table={state:{addresses:[address],lastExtendedSlot:10}};
  it('waits for visibility, required entries, and a slot after extension',async function(){
    const responses=[
      {context:{slot:11},value:null},
      {context:{slot:11},value:{state:{addresses:[],lastExtendedSlot:10}}},
      {context:{slot:10},value:table},
      {context:{slot:11},value:table},
    ];
    let calls=0;
    const connection={getAddressLookupTable:async(pk,config)=>{
      assert.ok(pk.equals(address));assert.equal(config.commitment,'confirmed');
      return responses[calls++];
    }};
    assert.equal(await waitForAltReadiness(connection,address,[address]),table);
    assert.equal(calls,4);
  });
  it('times out instead of consuming an unready table',async function(){
    await assert.rejects(waitForAltReadiness({getAddressLookupTable:async()=>({context:{slot:10},value:table})},address,[address],10),/did not become ready/);
  });
  it('does not hide RPC errors',async function(){
    await assert.rejects(waitForAltReadiness({getAddressLookupTable:async()=>{throw new Error('RPC unavailable');}},address,[address]),/RPC unavailable/);
  });
});
