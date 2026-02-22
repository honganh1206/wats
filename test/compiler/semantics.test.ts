import test from "node:test";
import { parser } from "../../src/compiler/grammar";
import assert from "node:assert";
import { instr } from "../../src/wasm/instructions";
import { buildSymbolTable } from "../../src/compiler/symbol";
import { defineToWasm } from "../../src/compiler/semantics";

test('operation toWasm', () => {
  assert.deepEqual(toWasmFlat('1'), [instr.i32.const, 1, instr.end]);
  assert.deepEqual(
    toWasmFlat('42'),
    [instr.i32.const, 42, instr.end]
  );
  assert.deepEqual(
    toWasmFlat('1 + 2'),
    [
      [instr.i32.const, 1],
      [instr.i32.const, 2],
      instr.i32.add,
      instr.end,
    ].flat(),
  );
  assert.deepEqual(
    toWasmFlat('7 - 3 + 11'),
    [
      [instr.i32.const, 7],
      [instr.i32.const, 3],
      instr.i32.sub,
      [instr.i32.const, 11],
      instr.i32.add,
      instr.end,
    ].flat(),
  );
  assert.deepEqual(
    toWasmFlat('6 / (2 * 1)'),
    [
      [instr.i32.const, 6],
      [instr.i32.const, 2],
      [instr.i32.const, 1],
      instr.i32.mul,
      instr.i32.div_s,
      instr.end,
    ].flat(),
  );
})

function toWasmFlat(input: string) {
  const matchResult = parser.match(input);
  const symbols = buildSymbolTable(parser, matchResult);
  // Separate semantics instance in test just to be sure
  const semantics = parser.createSemantics();
  const localVars = symbols.get('main');
  assert.ok(localVars);
  defineToWasm(semantics, localVars);
  const bytes = semantics(matchResult).toWasm();
  return bytes.flat(Infinity);
}
