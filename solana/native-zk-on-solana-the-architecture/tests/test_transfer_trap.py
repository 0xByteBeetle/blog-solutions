"""Mock the review-only sequence, without wallets, validators or chain requests."""
from pathlib import Path
import os,subprocess,tempfile,unittest
ROOT=Path(__file__).resolve().parents[1]
class TransferTrapTests(unittest.TestCase):
 def test_pending_then_apply_and_unrelated_failure_rejection(self):
  for failure,expected in [('InsufficientFunds: available balance',0),('InsufficientFunds for transaction fee',1),('RPC connection refused',1),('InvalidInstructionData',1),('SUCCESS',1)]:
   with self.subTest(failure=failure),tempfile.TemporaryDirectory() as temp:
    log=Path(temp)/'calls'
    harness=r'''
set -eu
PAYER=mock-payer
APPLIED=0
new_mint_keypair(){ printf 'mock-%s' "$1"; }
solana-keygen(){ printf 'public-%s' "$2"; }
fail(){ printf '%s\n' "$*" >&2; exit 1; }
assert_eq(){ test "$1" = "$2" || fail "$3"; }
token22(){
 printf '%s\n' "$*" >> "$CALL_LOG"
 case "$1" in
 balance) case "$*" in *destination*) echo 50;; *) echo 0;; esac;;
 display) echo 'mock encrypted pending/available state';;
 apply-pending-balance) APPLIED=1;;
 transfer) if test "$APPLIED" = 0; then
  test "$PENDING_ERROR" = SUCCESS && return 0
  printf '%s\n' "$PENDING_ERROR" >&2; return 1
 fi;;
 esac
}
source "$SCENARIO"
'''
    p=subprocess.run(['bash','-c',harness],env=dict(os.environ,CALL_LOG=str(log),PENDING_ERROR=failure,SCENARIO=str(ROOT/'scenario.sh')),text=True,capture_output=True)
    self.assertEqual(p.returncode,expected,p.stderr)
    calls=log.read_text().splitlines();attempts=[i for i,v in enumerate(calls) if v.startswith('transfer ')];applies=[i for i,v in enumerate(calls) if v.startswith('apply-pending-balance ')]
    if expected==0:
     self.assertEqual(len(attempts),2);self.assertLess(attempts[0],applies[0]);self.assertLess(applies[0],attempts[1]);self.assertTrue(any(v.startswith('withdraw-confidential-tokens ') and ' 50 ' in v for v in calls))
    else:self.assertEqual(applies,[])
if __name__=='__main__':unittest.main()
