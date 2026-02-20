import test from "node:test";
import { semantics } from "../../src/compiler/semantics"
import { parser } from "../../src/compiler/grammar";
import assert from "node:assert";
import { instr } from "../../src/wasm/instructions";

const sem = (input: string) => semantics(parser.match(input));

test('operation jsValue', () => {
  assert.equal(sem('42').jsValue(), 42);
  assert.equal(sem('0').jsValue(), 0);
  assert.equal(sem('99').jsValue(), 99);
})

test('operation toWasm', () => {
  assert.deepEqual(toWasmFlat('1'), [instr.i32.const, 1, instr.end]);
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
  const bytes = sem(input).toWasm();
  return bytes.flat(Infinity);
}
