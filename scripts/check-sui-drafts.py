#!/usr/bin/env python3
"""Exact import integrity; does not establish Move or network execution."""
import hashlib
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / 'catalog/sui-draft-files.json').read_text())
assert manifest['status'] == 'unpublished-drafts'
for relative, expected in manifest['files'].items():
    path = ROOT / relative
    assert relative.startswith('sui/') and '..' not in Path(relative).parts
    assert path.is_file() and not path.is_symlink(), relative
    assert hashlib.sha256(path.read_bytes()).hexdigest() == expected, relative
actual = {str(p.relative_to(ROOT)) for p in (ROOT / 'sui').rglob('*') if p.is_file() and not any(x in p.parts for x in ('__pycache__', '.venv', 'build', '.git'))}
assert actual == set(manifest['files']), 'Unreviewed or missing Sui import files'
print(f"Sui draft import: {len(actual)} exact reviewed files; unpublished, runtime claims separate")
