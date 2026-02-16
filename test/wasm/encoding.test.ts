import test from "node:test";
import assert from "node:assert";
import { u32, i32, vec } from "../../src/wasm/encoding";

test('u32 encodes values less than 128 as single byte', () => {
  assert.deepStrictEqual(u32(0), [0]);
  assert.deepStrictEqual(u32(1), [1]);
  assert.deepStrictEqual(u32(127), [127]);
});

test('u32 rejects negative values', () => {
  assert.throws(() => u32(-1));
});

test('u32 throws for values >= 128', () => {
  assert.throws(() => u32(128));
});

test('i32 encodes small non-negative values as single byte', () => {
  assert.deepStrictEqual(i32(0), [0]);
  assert.deepStrictEqual(i32(63), [63]);
});

test('vec prepends length to elements', () => {
  assert.deepStrictEqual(vec([0x7f, 0x7f]), [[2], [0x7f, 0x7f]]);
});

test('vec with empty elements', () => {
  assert.deepStrictEqual(vec([]), [[0], []]);
});

test('vec with single element', () => {
  assert.deepStrictEqual(vec([0x01]), [[1], [0x01]]);
});
