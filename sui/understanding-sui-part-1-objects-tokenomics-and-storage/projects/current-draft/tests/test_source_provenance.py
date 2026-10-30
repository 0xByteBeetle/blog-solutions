"""Source/fidelity checks only; no Move or network execution."""
from pathlib import Path
import hashlib
import json
import unittest

PROJECT=Path(__file__).resolve().parents[1]
ARTICLE=PROJECT.parents[1]
class Provenance(unittest.TestCase):
    def test_native_draft_blocks(self):
        manifest=json.loads((ARTICLE/'draft-source/manifest.json').read_text())
        self.assertEqual(manifest['contentStatus'],'unpublished-draft')
        for block in manifest['blocks']:
            self.assertEqual(hashlib.sha256((ARTICLE/block['path']).read_bytes()).hexdigest(),block['sha256'])
    def test_current_source_and_exact_block_spans(self):
        provenance=json.loads((PROJECT/'provenance.json').read_text())
        for entry in provenance['files']:
            data=(PROJECT/entry['path']).read_bytes()
            block=(ARTICLE/f"draft-source/block-{entry['block']:02}.txt").read_bytes()
            self.assertEqual(hashlib.sha256(data).hexdigest(),entry['sha256'])
            self.assertIn(block,data)
            if entry['kind']=='exact-current-draft-source':self.assertEqual(block,data)
            else:self.assertEqual(data,block+b'\n')
    def test_recorded_lock_is_preserved(self):
        entry=json.loads((PROJECT/'provenance.json').read_text())['supplementalLock']
        data=(PROJECT/entry['path']).read_bytes()
        self.assertEqual(data,(ARTICLE/entry['source']).read_bytes())
        self.assertEqual(hashlib.sha256(data).hexdigest(),entry['sha256'])
if __name__=='__main__':unittest.main()
