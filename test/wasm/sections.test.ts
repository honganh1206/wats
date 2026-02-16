import test from "node:test";
import assert from "node:assert";
import { typesec, typeidx, funcsec, functype, codesec, codes, func, instr } from "../../src/wasm/sections";
import { flatten } from "../../src/wasm/utils";

test('functype with no params and no results', () => {
  assert.deepStrictEqual(functype([], []), [0x60, [[0], []], [[0], []]]);
});

test('functype with one i32 param and one i32 result', () => {
  assert.deepStrictEqual(functype([0x7f], [0x7f]), [0x60, [[1], [0x7f]], [[1], [0x7f]]]);
});

test('typeidx encodes as u32', () => {
  assert.deepStrictEqual(typeidx(0), [0]);
  assert.deepStrictEqual(typeidx(1), [1]);
});

test('typesec wraps functypes in a section', () => {
  const result = typesec([functype([], [])]);
  // section id 1, size, vec(functypes)
  assert.strictEqual(result[0], 1);
});

test('funcsec wraps type indices in a section', () => {
  const result = funcsec([typeidx(0)]);
  // section id 3
  assert.strictEqual(result[0], 3);
});

test('func with no locals wraps body with empty vec', () => {
  const result = func([], [instr.end]);
  // vec([]) = [[0], []], then body
  assert.deepStrictEqual(result, [[[0], []], [instr.end]]);
});

test('codes prepends size to func', () => {
  const f = func([], [instr.end]);
  const result = codes(f);
  // first element is u32(sizeInBytes)
  const sizeInBytes = flatten(f).length;
  assert.deepStrictEqual(result[0], [sizeInBytes]);
});

test('codesec wraps codes in a section', () => {
  const result = codesec([codes(func([], [instr.end]))]);
  // section id 10
  assert.strictEqual(result[0], 10);
});
