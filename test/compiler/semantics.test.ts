import test from "node:test";
import { parser } from "../../src/compiler/grammar";
import assert from "node:assert";
import { instr } from "../../src/wasm/instructions";
import { buildSymbolTable } from "../../src/compiler/symbol";
import { defineToWasm } from "../../src/compiler/semantics";

test('operation toWasm', () => {
  assert.deepEqual(
    toWasmFlat('funk f1(a) { let x = 12; x }'),
    [
      [instr.i32.const, 12],
      [instr.local.set, 1], // set `x`
      [instr.local.get, 1], // get `x`
      instr.end,
    ].flat(),
  );
  assert.deepEqual(
    toWasmFlat('funk f2(a, b) { let x = 12; b }'),
    [
      [instr.i32.const, 12],
      [instr.local.set, 2], // set `x`
      [instr.local.get, 1], // get `b`
      instr.end,
    ].flat(),
  );
  assert.deepEqual(
    toWasmFlat('funk main() { 42 }'),
    [[instr.i32.const, 42], instr.end].flat(),
  );
  assert.deepEqual(
    toWasmFlat('funk main() { let x = 0; 42 }'),
    [
      [instr.i32.const, 0],
      [instr.local.set, 0],
      [instr.i32.const, 42],
      instr.end,
    ].flat(),
  );
  assert.deepEqual(
    toWasmFlat('funk main() { let x = 0; x }'),
    [
      [instr.i32.const, 0],
      [instr.local.set, 0],
      [instr.local.get, 0],
      instr.end,
    ].flat(),
  );
})

function toWasmFlat(input: string) {
  // Specify the rule on which to start matching
  const matchResult = parser.match(input, 'FunctionDecl');
  const symbolTable = buildSymbolTable(parser, matchResult);
  // Separate semantics instance in test just to be sure
  const semantics = parser.createSemantics();
  defineToWasm(semantics, symbolTable);
  const bytes = semantics(matchResult).toWasm();
  return bytes.flat(Infinity);
}
