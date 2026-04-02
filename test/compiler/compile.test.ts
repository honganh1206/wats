import test from "node:test";
import { compile } from "../../src/compiler/compile"
import assert from "node:assert";

test('compile result compiles to a WebAssembly object', async () => {
  const { instance, module } = await WebAssembly.instantiate(
    compile('funk main() { let x = 42; x }'));

  assert.strictEqual(instance instanceof WebAssembly.Instance, true);
  assert.strictEqual(module instanceof WebAssembly.Module, true);
})

