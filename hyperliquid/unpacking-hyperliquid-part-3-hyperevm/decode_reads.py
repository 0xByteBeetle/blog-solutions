"""Decode raw oracle/BBO words with the matching market's szDecimals; no RPC."""
import argparse
from decimal import Decimal
import json
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parent

def words(value,count):
    if not isinstance(value,str) or not re.fullmatch(r'0x[0-9a-fA-F]{'+str(count*64)+'}',value): raise ValueError('Expected exact ABI word count')
    result=[int(value[2+i*64:2+(i+1)*64],16) for i in range(count)]
    if any(x>=2**64 for x in result): raise ValueError('Nonzero uint64 padding')
    return result

def decode(oracle,bbo,asset):
    sz=asset['szDecimals']
    if type(sz) is not int or not 0<=sz<=6: raise ValueError('Expected perp szDecimals in 0..6 for this helper')
    price=words(oracle,1)[0];bid,ask=words(bbo,2)
    if bid>ask: raise ValueError('Crossed BBO in input')
    scale=Decimal(10)**(6-sz)
    return {'name':asset['name'],'szDecimals':sz,'oracleRaw':price,'bidRaw':bid,'askRaw':ask,'oracle':str(Decimal(price)/scale),'bid':str(Decimal(bid)/scale),'ask':str(Decimal(ask)/scale)}

def result(path):
    data=json.loads(Path(path).read_text())
    if data.get('error') or data.get('jsonrpc')!='2.0' or 'result' not in data: raise ValueError('Malformed/error RPC response')
    return data['result']

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--meta');p.add_argument('--oracle');p.add_argument('--bbo');p.add_argument('--index',type=int,default=3);a=p.parse_args()
    if any([a.meta,a.oracle,a.bbo]):
        if not all([a.meta,a.oracle,a.bbo]) or a.index<0: p.error('Provide --meta, --oracle, --bbo and a nonnegative --index')
        asset=json.loads(Path(a.meta).read_text())['universe'][a.index]
        output=decode(result(a.oracle),result(a.bbo),asset)
    else:
        f=json.loads((ROOT/'fixtures/price-reads.json').read_text());output=decode(f['oracleResult'],f['bboResult'],f['asset'])
    print(json.dumps(output,indent=2))
if __name__=='__main__': main()
