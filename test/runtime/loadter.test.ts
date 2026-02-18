import assert from "node:assert";
import { compile } from "../../src/compiler/compile";
import { loadMod } from "../../src/runtime/loader";
import test from "node:test";

test('compile bytes to WASM modules', () => {
  assert.equal(loadMod(compile('42')).main(), 42);
  assert.equal(loadMod(compile('0')).main(), 0);
  assert.equal(loadMod(compile('31')).main(), 31);
})
