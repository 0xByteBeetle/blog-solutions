import {checks} from './checks.mjs';
// Execute the explicit reviewed, article-local offline/build test plan.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const flags=process.argv.slice(2);const chain=flags.find(x=>x.startsWith('--chain='))?.slice(8);
if(flags.some(x=>x!=='--dry-run'&&!/^--chain=(evm|solana|hyperliquid|sui)$/.test(x)))throw new Error('Usage: node scripts/verify-minimal.mjs [--chain=evm|solana|hyperliquid|sui] [--dry-run]');
const plan=checks.filter(c=>!chain||c.cwd.startsWith(chain+'/'));
const results=[];
for(const check of plan){
 const cwd=path.resolve(root,check.cwd);if(!cwd.startsWith(root+path.sep)||!fs.existsSync(cwd))throw new Error('Invalid check directory: '+check.cwd);
 let [command,...args]=check.command;
 if(flags.includes('--dry-run')){console.log(check.cwd+': '+check.command.join(' '));continue;}
 if(command==='python3'){
  const venv=path.join(cwd,'.venv/bin/python');command=fs.existsSync(venv)?venv:(process.env.BLOG_TEST_PYTHON||'python3');
 }
 if(command==='node')command=process.execPath;
 const result=spawnSync(command,args,{cwd,encoding:'utf8',timeout:600000,maxBuffer:20*1024*1024});
 const output=(result.stdout||'')+(result.stderr||'');
 const effectiveKind=check.kind==='local-vm'&&/No tests found|0 tests passed/.test(output)?'build-only':check.kind;
 results.push({...check,kind:effectiveKind,exitCode:result.status,error:result.error?String(result.error):undefined,output});
 console.log(`${check.cwd}: ${result.status===0?'PASS':'FAIL'}`);
}
if(!flags.includes('--dry-run')){
 fs.mkdirSync(root+'/.local/check-results',{recursive:true});
 fs.writeFileSync(root+'/.local/check-results/minimal-checks'+(chain?'-'+chain:'')+'.json',JSON.stringify({date:new Date().toISOString(),scope:'Current-layout offline/build checks, not full article coverage or public-network execution.',results},null,2)+'\n');
 if(results.some(r=>r.exitCode!==0))process.exitCode=1;
}
