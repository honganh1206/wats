import test from "node:test";
import { compileWats } from "../../src/wasm/module"
import assert from "node:assert";

test('compileWats result compiles to a WebAssembly object', async () => {
  const {instance, module} = await WebAssembly.instantiate(
  compileWats(''));

  assert.strictEqual(instance instanceof WebAssembly.Instance, true);
  assert.strictEqual(module instanceof WebAssembly.Module, true);
})
