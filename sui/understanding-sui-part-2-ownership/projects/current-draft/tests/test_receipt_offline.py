"""Supplemental synthetic receipt tests, no wallet or network."""
import contextlib
import io
import json
from pathlib import Path
import runpy
import sys
import tempfile
import unittest
from unittest.mock import patch
SOURCE=Path(__file__).resolve().parents[1]/'client'/'receipt.py'
class Receipt(unittest.TestCase):
    def invoke(self, *args):
        data={'effects':{'status':{'status':'success'}},'digest':'fixture-digest',
              'objectChanges':[{'type':'published','packageId':'fixture-package'},
                 {'type':'created','objectId':'fixture-one','objectType':'fixture::Notebook'},
                 {'type':'created','objectId':'fixture-two','objectType':'fixture::Notebook'}]}
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'receipt.json';path.write_text(json.dumps(data));out=io.StringIO()
            with patch.object(sys,'argv',[str(SOURCE),str(path),*args]),contextlib.redirect_stdout(out):runpy.run_path(str(SOURCE))
            return out.getvalue()
    def test_status(self):self.assertEqual(self.invoke(),'Status: success\nDigest: fixture-digest\n')
    def test_package(self):self.assertEqual(self.invoke('package'),'fixture-package\n')
    def test_created_index(self):self.assertEqual(self.invoke('::Notebook','1'),'fixture-two\n')
    def test_missing_selector_explicit_error(self):
        with self.assertRaises(IndexError):self.invoke('::Missing')
if __name__=='__main__':unittest.main()
