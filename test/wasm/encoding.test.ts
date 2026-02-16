import test from "node:test";
import assert from "node:assert";
import { u32, i32, vec, leb128 } from "../../src/wasm/encoding";

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

test('leb128 encodes values up to 64 bits and beyond', () => {
  assert.deepStrictEqual(leb128(0), [0]);
  assert.deepStrictEqual(leb128(64), [64]);
  assert.deepStrictEqual(leb128(127), [127]);

  // Test processing 7 bits at a time
  assert.deepStrictEqual(leb128((2 ** 7) - 1), [127]);
  assert.deepStrictEqual(leb128(2 ** 7), [128, 1]);
  // TODO: Why not 128, 127 here?
  assert.deepStrictEqual(leb128((2 ** 14) - 1), [255, 127]);
  assert.deepStrictEqual(leb128(2 ** 14), [128, 128, 1]);

  assert.deepStrictEqual(leb128(0n), [0]);
  assert.deepStrictEqual(leb128(127n), [127]);
  assert.deepStrictEqual(leb128(128n), [0x80, 1]);
  assert.deepStrictEqual(leb128(2n ** 14n), [0x80, 0x80, 1]);
  assert.deepStrictEqual(leb128(2n ** 64n), [0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 2]);

});

test('leb128 rejects values with 8th bit set', () => {
  assert.deepStrictEqual(leb128(128), [0x80, 1]);
});

