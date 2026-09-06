// Test harness only. Contracts under examples/ are the author's recovered source.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawn, spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'blog-evm-run-'));
const port=Number(process.env.BLOG_TEST_PORT||18549);
const rpc=`http://127.0.0.1:${port}`;
const results=[];
function run(cmd,args,cwd=root){const r=spawnSync(cmd,args,{cwd,encoding:'utf8',timeout:120000});if(r.status!==0)throw new Error(`${cmd} ${args.join(' ')}\n${r.stderr||r.stdout||r.error}`);return r.stdout.trim();}
const log=fs.openSync(path.join(temp,'anvil.log'),'w');
const node=spawn('anvil',['--host','127.0.0.1','--port',String(port),'--silent'],{stdio:['ignore',log,log]});
let nodeError;node.on('error',e=>nodeError=e);
try{
 let ready=false;
 for(let i=0;i<60;i++){
  if(nodeError||node.exitCode!==null)throw nodeError||new Error('Local node exited; check port availability.');
  await new Promise(r=>setTimeout(r,100));
  try{const r=await fetch(rpc,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_accounts',params:[]})});if((await r.json()).result){ready=true;break;}}catch{}
 }
 if(!ready)throw new Error('Local node did not become ready');
 const accounts=JSON.parse(run('cast',['rpc','eth_accounts','--rpc-url',rpc]));
 const [owner,admin,recipient]=accounts;
 const call=(address,sig,...args)=>run('cast',['call',address,sig,...args,'--from',owner,'--rpc-url',rpc]);
 const send=(address,sig,args=[],from=owner)=>JSON.parse(run('cast',['send',address,sig,...args,'--unlocked','--from',from,'--rpc-url',rpc,'--json']));
 function deploy(project,contract,args=[]){return JSON.parse(run('forge',['create',contract,'--rpc-url',rpc,'--unlocked','--from',owner,'--broadcast','--json',...(args.length?['--constructor-args',...args]:[])],`${root}/examples/evm/${project}`)).deployedTo;}
 function pass(project,checks){const prefix=`examples/evm/${project}/`;const files=JSON.parse(fs.readFileSync(`${root}/catalog/source-files.json`)).filter(s=>s.path.startsWith(prefix));const sourceHashes=Object.fromEntries(files.map(s=>[s.path,crypto.createHash('sha256').update(fs.readFileSync(root+'/'+s.path)).digest('hex')]));results.push({project:`examples/evm/${project}`,status:'runtime-verified',checks,sourceHashes});console.log(`PASS ${project}: ${checks.join('; ')}`);}
 const factory=deploy('factory','src/basicfactory.sol:CounterFactory');
 const created=send(factory,'createCounter(address,uint256)',[owner,'42']).logs.map(l=>'0x'+l.topics[1].slice(-40));
 assert.equal(created.length,5);for(const c of created)assert.equal(call(c,'value()(uint256)'),'42');
 send(created[0],'inc()');assert.equal(call(created[0],'value()(uint256)'),'43');
 pass('factory',['five Counter deployments','initial value 42','owner increment to 43']);
 const logic=deploy('minimal-proxy','src/minimalProxy.sol:Counter');
 const clones=deploy('minimal-proxy','src/minimalProxy.sol:CounterCloneFactory');
 const clone='0x'+send(clones,'createClone(address,address,uint256)',[logic,owner,'42']).logs[0].topics[1].slice(-40);
 assert.equal(call(clone,'value()(uint256)'),'42');send(clone,'inc()');assert.equal(call(clone,'value()(uint256)'),'43');
 const salt='0x'+'00'.repeat(31)+'01';
 const deterministic='0x'+send(clones,'createCloneDeterministic(address,address,uint256,bytes32)',[logic,owner,'7',salt]).logs[0].topics[1].slice(-40);
 assert.equal(call(deterministic,'value()(uint256)'),'7');assert.equal(call(clone,'value()(uint256)'),'43');
 pass('minimal-proxy',['CREATE clone','CREATE2 clone','independent storage']);
 const token=deploy('uups','src/UUPSLogicContract.sol:MyToken');
 const init=run('cast',['calldata','constructor1(uint256)','1000']);
 const proxy=deploy('uups','src/UUPSProxy.sol:UUPSProxy',[init,token]);
 assert.equal(call(proxy,'totalSupply()(uint256)'),'1000');send(proxy,'transfer(address,uint256)',[recipient,'25']);assert.equal(call(proxy,'tokens(address)(uint256)',recipient),'25');
 const next=deploy('uups','src/UUPSLogicContract.sol:MyToken');send(proxy,'updateCode(address)',[next]);
 assert.equal(call(proxy,'tokens(address)(uint256)',recipient),'25');
 const slot='0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7';
 assert.equal(run('cast',['storage',proxy,slot,'--rpc-url',rpc]).slice(-40).toLowerCase(),next.slice(2).toLowerCase());
 pass('uups',['original PROXIABLE slot','token initialization and transfer','upgrade preserves balances']);
 const v1=deploy('transparent-proxy','src/StorageV1.sol:StorageV1');
 const transparent=deploy('transparent-proxy','src/TransparentProxy1967.sol:TransparentProxy1967',[v1,admin,run('cast',['calldata','initialize(uint256,string)','42','Andrey'])]);
 assert.equal(call(transparent,'number()(uint256)'),'42');send(transparent,'setNumber(uint256)',['77']);
 const rejected=spawnSync('cast',['call',transparent,'number()(uint256)','--from',admin,'--rpc-url',rpc],{encoding:'utf8'});
 assert.notEqual(rejected.status,0);assert.match(rejected.stderr,/admin cannot fallback/);
 const v2=deploy('transparent-proxy','src/StorageV2.sol:StorageV2');send(transparent,'upgradeTo(address)',[v2],admin);
 assert.equal(call(transparent,'number()(uint256)'),'77');assert.equal(call(transparent,'double()(uint256)'),'154');assert.equal(call(transparent,'number()(uint256)'),'77');
 pass('transparent-proxy',['user state updates','admin fallback rejection','upgrade preserves state']);
 const storage=deploy('storage','src/Storage.sol:Storage');send(storage,'store((uint256,string))',['(42,Andrey)']);
 assert.match(call(storage,'retrieve()((uint256,string))'),/42/);assert.match(call(storage,'retrieve()((uint256,string))'),/Andrey/);
 pass('storage',['original dynamic struct encoding and retrieval']);
 const cutter=deploy('diamond','src/facets/DiamondCutFacet.sol:DiamondCutFacet');
 const facet=deploy('diamond','src/facets/ExampleFacet.sol:ExampleFacet');
 const sig=s=>run('cast',['sig',s]);
 const cutSig=sig('diamondCut((address,uint8,bytes4[])[],address,bytes)');
 const zero='0x'+'00'.repeat(20);
 const cut=`[(${cutter},0,[${cutSig}]),(${facet},0,[${sig('increment()')},${sig('getCounter()')}])]`;
 const diamond=deploy('diamond','src/Diamond.sol:Diamond',[owner,cut,zero,'0x']);
 assert.equal(call(diamond,'getCounter()(uint256)'),'0');send(diamond,'increment()');assert.equal(call(diamond,'getCounter()(uint256)'),'1');
 const newFacet=deploy('diamond','src/facets/newFacet.sol:ExampleFacetV2');
 send(diamond,'diamondCut((address,uint8,bytes4[])[],address,bytes)',[`[(${newFacet},0,[${sig('decrement()')}])]`,zero,'0x']);
 send(diamond,'decrement()');assert.equal(call(diamond,'getCounter()(uint256)'),'0');
 pass('diamond',['published selector routing','counter increment','new decrement facet uses shared state']);
}finally{
 node.kill('SIGTERM');fs.closeSync(log);
 fs.mkdirSync(`${root}/verification`,{recursive:true});
 fs.writeFileSync(`${root}/verification/restored-evm.json`,JSON.stringify({date:new Date().toISOString(),environment:'Disposable loopback-only Anvil; unlocked generated local accounts; no public-network transactions',command:'node scripts/verify-restored-evm.mjs',versions:{forge:run('forge',['--version']),anvil:run('anvil',['--version'])},results},null,2)+'\n');
 fs.rmSync(temp,{recursive:true,force:true});
}
