import assert from "node:assert";
import { compile } from "../../src/compiler/compile";
import { loadMod } from "../../src/runtime/loader";
import test from "node:test";

test('compile bytes to WASM modules', () => {
  assert.equal(loadMod(compile('abc')).main(10), 52);
})
