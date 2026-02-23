import assert from "node:assert";
import { compile } from "../../src/compiler/compile";
import { loadMod } from "../../src/runtime/loader";
import test from "node:test";

test('compile bytes to WASM modules', () => {
  assert.equal(loadMod(compile('let x = 42; x')).main(), 42);
  assert.deepEqual(
    loadMod(compile('let a = 13; let b = 15; a := 10; a + b')).main(),
    25,
  );
})
