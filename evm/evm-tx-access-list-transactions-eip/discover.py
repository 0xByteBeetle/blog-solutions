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

def validate_access(result):
    if not isinstance(result,dict) or result.get('error'): raise ValueError('Access-list simulation failed')
    gas=quantity(result['gasUsed'])
    if not isinstance(result['accessList'],list): raise ValueError('Invalid accessList')
    for item in result['accessList']:
        if not re.fullmatch(r'0x[0-9a-fA-F]{40}',item['address']) or not isinstance(item['storageKeys'],list): raise ValueError('Invalid address/list')
        if any(not re.fullmatch(r'0x[0-9a-fA-F]{64}',key) for key in item['storageKeys']): raise ValueError('Invalid storage key')
    return {'accessList':result['accessList'],'gasUsed':gas}

def discover_access(endpoint,chain_id,sender,to,data,send=rpc):
    if any(not re.fullmatch(r'0x[0-9a-fA-F]{40}',x or '') for x in [sender,to]) or not re.fullmatch(r'0x(?:[0-9a-fA-F]{2})*',data or ''): raise ValueError('Explicit from/to/calldata required')
    if quantity(send(endpoint,'eth_chainId',[]))!=chain_id: raise ValueError('RPC chain mismatch')
    # Article curl uses pending, gas=0x50000, gasPrice=0x6fee2d00.
    return validate_access(send(endpoint,'eth_createAccessList',[{'from':sender,'to':to,'data':data,'gas':'0x50000','gasPrice':'0x6fee2d00'},'pending']))

def main():
    p=argparse.ArgumentParser(description=__doc__)

    p.add_argument('--rpc-url');p.add_argument('--chain-id',type=int)
    p.add_argument('--from',dest='sender');p.add_argument('--to');p.add_argument('--data')
    a=p.parse_args()
    if a.rpc_url and (a.chain_id is None or a.chain_id<=0): p.error('--chain-id is required with --rpc-url')
    result=discover_access(a.rpc_url,a.chain_id,a.sender,a.to,a.data) if a.rpc_url else validate_access(json.loads((ROOT/'fixtures/access-list.json').read_text()))
    print(json.dumps({'mode':'live read-only' if a.rpc_url else 'offline historical/synthetic fixture','result':result},indent=2))

if __name__=='__main__': main()
