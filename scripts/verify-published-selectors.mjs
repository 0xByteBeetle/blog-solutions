// Diagnostic checks of published values; no contract or snapshot is modified.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const paths=[
 'articles/evm/abi-encoding-deep-dive-how-solidity/published.md',
 'articles/evm/diamonds-in-evm-the-proxy-that-scales-beyond-limits-2fedc282cadf/published.md',
];
const readBlock=(file,index)=>{
 const matches=[...fs.readFileSync(root+'/'+file,'utf8').matchAll(/## Block (\d+)\n\nSHA-256: `[a-f0-9]{64}`\n\n````text\n([\s\S]*?)\n````/g)];
 return matches.find(m=>Number(m[1])===index)[2];
};
const cast=(...args)=>execFileSync('cast',args,{encoding:'utf8'}).trim();
const actualSelector=cast('sig','store((uint256,string))');
const displayedSelector=readBlock(paths[0],3).match(/0x[a-f0-9]{8}/)[0];
assert.equal(actualSelector,'0xddd356b3');
assert.equal(displayedSelector,'0xddd456b3','Published block changed; review this diagnostic');
assert.ok(readBlock(paths[0],4).startsWith(actualSelector));
const increment=cast('sig','increment()'),decrement=cast('sig','decrement()');
assert.equal(increment,'0xd09de08a');assert.equal(decrement,'0x2baeceb7');
const queries=[...readBlock(paths[1],24).matchAll(/facetAddress\(bytes4\)\(address\)"\s+(0x[a-f0-9]{8})/g)].map(m=>m[1]);
assert.deepEqual(queries,[increment,increment],'Published commands changed; review this diagnostic');
const sourceHashes=Object.fromEntries(paths.map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(root+'/'+p)).digest('hex')]));
const report={date:new Date().toISOString(),status:'discrepancies-confirmed',command:'node scripts/verify-published-selectors.mjs',sourceHashes,findings:[
 {article:paths[0],block:3,displayedSelector,actualSelector,fullHash:cast('keccak','store((uint256,string))')},
 {article:paths[1],block:24,queriedSelectors:queries,newFacetSelector:decrement,note:'Second call repeats increment but its comment describes the new decrement facet.'},
]};
fs.writeFileSync(root+'/verification/published-selectors.json',JSON.stringify(report,null,2)+'\n');
console.log('Confirmed two publication discrepancies; originals unchanged.');
