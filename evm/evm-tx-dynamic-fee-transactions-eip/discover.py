"""Read-only article input discovery. Offline fixtures by default; no wallet/signing."""
import argparse
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parent

def quantity(value):
    if not isinstance(value,str) or not re.fullmatch(r'0x(?:0|[1-9a-fA-F][0-9a-fA-F]*)',value): raise ValueError('Invalid RPC quantity')
    return int(value,16)

def rpc(endpoint,method,params):
    u=urllib.parse.urlparse(endpoint)
    if u.scheme not in ['http','https'] or not u.hostname or u.username or u.password or u.fragment: raise ValueError('Explicit credential-free HTTP(S) RPC required')
    req=urllib.request.Request(endpoint,json.dumps({'jsonrpc':'2.0','id':1,'method':method,'params':params}).encode(),{'Content-Type':'application/json'})
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self,*args,**kwargs): raise ValueError('RPC redirect refused')
    with urllib.request.build_opener(urllib.request.ProxyHandler({}),NoRedirect()).open(req,timeout=15) as response: body=json.load(response)
    if body.get('error') or body.get('jsonrpc')!='2.0' or body.get('id')!=1 or 'result' not in body: raise ValueError('RPC error or malformed response: '+str(body))
    return body['result']

def validate_fees(history,tip):
    tip=quantity(tip)
    quantity(history['oldestBlock'])
    bases=history['baseFeePerGas'];ratios=history['gasUsedRatio']
    if not isinstance(bases,list) or not isinstance(ratios,list) or not ratios or len(ratios)>5 or len(bases)!=len(ratios)+1: raise ValueError('Expected up to five blocks and one additional base fee')
    if any(isinstance(x,bool) or not isinstance(x,(int,float)) or not 0<=x<=1 for x in ratios): raise ValueError('Invalid gasUsedRatio')
    values=[quantity(x) for x in bases]
    return {'nextBlockBaseFeeWei':str(values[-1]),'tipWei':str(tip),'articleMaxFeeWei':str(values[-1]*112//100+tip)}

def discover_fees(endpoint,chain_id,send=rpc):
    if quantity(send(endpoint,'eth_chainId',[]))!=chain_id: raise ValueError('RPC chain mismatch')
    # Matches client.FeeHistory(ctx,5,nil,nil) and SuggestGasTipCap(ctx).
    history=send(endpoint,'eth_feeHistory',['0x5','latest',[]])
    return validate_fees(history,send(endpoint,'eth_maxPriorityFeePerGas',[]))

def main():
    p=argparse.ArgumentParser(description=__doc__)

    p.add_argument('--rpc-url');p.add_argument('--chain-id',type=int)

    a=p.parse_args()
    if a.rpc_url and (a.chain_id is None or a.chain_id<=0): p.error('--chain-id is required with --rpc-url')
    fixture=json.loads((ROOT/'fixtures/fee-history.json').read_text())
    result=discover_fees(a.rpc_url,a.chain_id) if a.rpc_url else validate_fees(fixture['history'],fixture['tip'])
    print(json.dumps({'mode':'live read-only' if a.rpc_url else 'offline historical/synthetic fixture','result':result},indent=2))

if __name__=='__main__': main()
