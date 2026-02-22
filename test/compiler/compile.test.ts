import test from "node:test";
import { compile } from "../../src/compiler/compile"
import assert from "node:assert";

test('compile result compiles to a WebAssembly object', async () => {
  const { instance, module } = await WebAssembly.instantiate(
    compile('42'));

  assert.strictEqual(instance instanceof WebAssembly.Instance, true);
  assert.strictEqual(module instanceof WebAssembly.Module, true);
})

