// Fail before reproduction runners can overwrite prior evidence with missing-tool errors.
import {spawnSync} from 'node:child_process';

const tools = {
  forge: {args: ['--version'], expected: /^forge Version:/m},
  anvil: {args: ['--version'], expected: /^anvil Version:/m},
  cast: {args: ['--version'], expected: /^cast Version:/m},
  go: {args: ['version'], expected: /^go version go\d/m},
  cargo: {args: ['--version'], expected: /^cargo \d/m},
};

export function requireToolchain(names, execute = spawnSync) {
  const failures = [];
  for (const name of names) {
    const spec = tools[name];
    if (!spec) throw new Error(`Unknown reproduction tool: ${name}`);
    const result = execute(name, spec.args, {encoding: 'utf8', timeout: 10000});
    const output = (result.stdout || '') + (result.stderr || '');
    if (result.status !== 0 || !spec.expected.test(output)) {
      failures.push(`${name}: ${result.error?.message || output.trim() || 'not found or unrecognized version output'}`);
    }
  }
  if (failures.length) {
    throw new Error(`Required reproduction toolchain is unavailable. No examples were run and existing reports were left untouched.\n${failures.join('\n')}`);
  }
}
