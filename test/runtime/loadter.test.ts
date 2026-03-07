import assert from "node:assert";
import { compile } from "../../src/compiler/compile";
import { loadMod } from "../../src/runtime/loader";
import test from "node:test";
import { buildModule } from "../../src/wasm/module";
import { instr, valtype } from "../../src/wasm/instructions";
import { i32 } from "../../src/wasm/encoding";
import { funcidx, locals } from "../../src/wasm/sections";

test('compile bytes to WASM modules', () => {
  assert.equal(loadMod(compile('let x = 42; x')).main(), 42);
  assert.deepEqual(
    loadMod(compile('let a = 13; let b = 15; a := 10; a + b')).main(),
    25,
  );
})

test('buildModule', () => {
  const functionDecls = [
    {
      name: 'main',
      paramTypes: [],
      resultType: valtype.i32,
      locals: [locals(1, valtype.i32)],
      body: [instr.call, funcidx(1), instr.end],
    },
    {
      name: 'backup',
      paramTypes: [],
      resultType: valtype.i32,
      locals: [],
      body: [instr.i32.const, i32(43), instr.end],
    },
  ];
  const exports = loadMod(buildModule(functionDecls));
  assert.strictEqual(exports.main(), 43);
  assert.strictEqual(exports.backup(), 43);
})
