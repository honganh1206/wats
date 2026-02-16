import test from "node:test";
import { compile } from "../../src/wasm/module"
import assert from "node:assert";

test('compile result compiles to a WebAssembly object', async () => {
  const { instance, module } = await WebAssembly.instantiate(
    compile(''));

  assert.strictEqual(instance instanceof WebAssembly.Instance, true);
  assert.strictEqual(module instanceof WebAssembly.Module, true);
})

test('compile result compiles to a WebAssembly module', async () => {
  const { instance } = await WebAssembly.instantiate(
    compile(''));

  assert.strictEqual(instance.exports.main(), undefined);
  assert.throws(() => compile('42'));
})
