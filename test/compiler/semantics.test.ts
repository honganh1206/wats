import test from "node:test";
import { parser } from "../../src/compiler/grammar";
import assert from "node:assert";
import { instr } from "../../src/wasm/instructions";
import { buildSymbolTable } from "../../src/compiler/symbol";
import { defineToWasm } from "../../src/compiler/semantics";

test('operation toWasm', () => {
  // assert.deepEqual(toWasmFlat('1'), [instr.i32.const, 1, instr.end]);
  // assert.deepEqual(
  //   toWasmFlat('1 + 2'),
  //   [
  //     [instr.i32.const, 1],
  //     [instr.i32.const, 2],
  //     instr.i32.add,
  //     instr.end,
  //   ].flat(),
  // );
  // assert.deepEqual(
  //   toWasmFlat('7 - 3 + 11'),
  //   [
  //     [instr.i32.const, 7],
  //     [instr.i32.const, 3],
  //     instr.i32.sub,
  //     [instr.i32.const, 11],
  //     instr.i32.add,
  //     instr.end,
  //   ].flat(),
  // );
  // assert.deepEqual(
  //   toWasmFlat('6 / (2 * 1)'),
  //   [
  //     [instr.i32.const, 6],
  //     [instr.i32.const, 2],
  //     [instr.i32.const, 1],
  //     instr.i32.mul,
  //     instr.i32.div_s,
  //     instr.end,
  //   ].flat(),
  // );
  // // Test set
  // assert.deepEqual(
  //   toWasmFlat('let x = 10; 42'),
  //   [
  //     [instr.i32.const, 10, instr.local.set, 0], // let x = 10;
  //     [instr.i32.const, 42],
  //     instr.end,
  //   ].flat(),
  // );
  // // Test get
  // assert.deepEqual(
  //   toWasmFlat('let x = 10; x'),
  //   [
  //     [instr.i32.const, 10, instr.local.set, 0], // let x = 10;
  //     [instr.local.get, 0], // x
  //     instr.end,
  //   ].flat(),
  // );
  // // Test drop and tee
  // assert.deepEqual(
  //   toWasmFlat('let x = 10; x := 9; x'),
  //   [
  //     [instr.i32.const, 10, instr.local.set, 0], // let x = 10;
  //     [instr.i32.const, 9, instr.local.tee, 0, instr.drop], // x := 9;
  //     [instr.local.get, 0], // x
  //     instr.end,
  //   ].flat(),
  // );
  // assert.deepEqual(
  //   toWasmFlat('funk f1(a) { let x = 12; x }'),
  //   [
  //     [instr.i32.const, 12],
  //     [instr.local.set, 1], // set `x`
  //     [instr.local.get, 1], // get `x`
  //     instr.end,
  //   ].flat(),
  // );
  // assert.deepEqual(
  //   toWasmFlat('funk f2(a, b) { let x = 12; b }'),
  //   [
  //     [instr.i32.const, 12],
  //     [instr.local.set, 2], // set `x`
  //     [instr.local.get, 1], // get `b`
  //     instr.end,
  //   ].flat(),
  // );
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
  const symbols = buildSymbolTable(parser, matchResult);
  // Separate semantics instance in test just to be sure
  const semantics = parser.createSemantics();
  const localVars = symbols.get('main');
  assert.ok(localVars);
  defineToWasm(semantics, symbols);
  const bytes = semantics(matchResult).toWasm();
  return bytes.flat(Infinity);
}
