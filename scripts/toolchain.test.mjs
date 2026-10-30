import test from 'node:test';
import assert from 'node:assert/strict';
import {requireToolchain} from './check-toolchain.mjs';

test('recognized reproduction tools pass without invoking an example', () => {
  const calls = [];
  const versions = {forge: 'forge Version: 1.4.4-stable', anvil: 'anvil Version: 1.4.4-stable', cast: 'cast Version: 1.4.4-stable', go: 'go version go1.24.0 linux/amd64', cargo: 'cargo 1.88.0'};
  requireToolchain(Object.keys(versions), (name, args) => { calls.push([name, args]); return {status: 0, stdout: versions[name]}; });
  assert.equal(calls.length, 5);
  assert.deepEqual(calls.find(([name]) => name === 'go')[1], ['version']);
});

test('a different program named go is not a Go compiler', () => {
  assert.throws(() => requireToolchain(['go'], () => ({status: 0, stdout: 'Go game client'})), /reports were left untouched/);
});

test('missing tools are reported before any reproduction work', () => {
  assert.throws(() => requireToolchain(['forge'], () => ({status: null, error: new Error('spawnSync forge ENOENT')})), /forge ENOENT/);
});
