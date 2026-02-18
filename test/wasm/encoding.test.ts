import test from "node:test";
import assert from "node:assert";
import { u32, i32, vec, leb128, sleb128, i64 } from "../../src/wasm/encoding";

test('u32 encodes values less than 128 as single byte', () => {
  assert.deepStrictEqual(u32(0), [0]);
  assert.deepStrictEqual(u32(1), [1]);
  assert.deepStrictEqual(u32(127), [127]);
});

test('u32 encodes multi-byte values', () => {
  assert.deepStrictEqual(u32(128), [0x80, 1]);
  assert.deepStrictEqual(u32(256), [0x80, 2]);
  assert.deepStrictEqual(u32(624485), [0xe5, 0x8e, 0x26]);
});

test('u32 encodes boundary values', () => {
  // MAX_U32 = 4,294,967,295
  assert.deepStrictEqual(u32(2 ** 32 - 1), leb128(2 ** 32 - 1));
});

test('u32 rejects negative values', () => {
  assert.throws(() => u32(-1));
});

test('u32 rejects values above u32 max', () => {
  assert.throws(() => u32(2 ** 32));
});

test('i32 encodes small non-negative values as single byte', () => {
  assert.deepStrictEqual(i32(0), [0]);
  assert.deepStrictEqual(i32(63), [63]);
});

test('i32 encodes small negative values', () => {
  assert.deepStrictEqual(i32(-1), [0x7f]);
  assert.deepStrictEqual(i32(-64), [0x40]);
});

test('i32 encodes multi-byte negative values', () => {
  assert.deepStrictEqual(i32(-65), [0xbf, 0x7f]);
  assert.deepStrictEqual(i32(-128), [0x80, 0x7f]);
});

test('i32 encode difference for numbers with most significant bit set', () => {
  // Meaning unsinged value will be encoded like signed value?
  // where the I32_NEG_OFFSET kicks in
  assert.deepStrictEqual(i32(-(2 ** 32 / 2)), i32(2 ** 31));
  assert.deepStrictEqual(i32(-1), i32(2 ** 32 - 1));
})

test('i32 rejects out of range values', () => {
  assert.throws(() => i32(-(2 ** 31) - 1));
  assert.throws(() => i32(2 ** 32));
});

test('i64 encode difference for numbers with most significant bit set', () => {
  assert.deepStrictEqual(i64(-(2n ** 64n / 2n)), i64(2n ** 63n));
  assert.deepStrictEqual(i64(- 1n), i64(2n ** 64n - 1n));
})

test('i64 rejects out of range values', () => {
  assert.throws(() => i64(2n ** 64n));
  assert.throws(() => i64(-(2n ** 64n / 2n) - 1n));
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

  // Testing with big ints
  assert.deepStrictEqual(leb128(0n), [0]);
  assert.deepStrictEqual(leb128(127n), [127]);
  assert.deepStrictEqual(leb128(128n), [0x80, 1]);
  assert.deepStrictEqual(leb128(2n ** 14n), [0x80, 0x80, 1]);
  assert.deepStrictEqual(leb128(2n ** 64n), [0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 0x80, 2]);

});

test('leb128 rejects values with 8th bit set', () => {
  assert.deepStrictEqual(leb128(128), [0x80, 1]);
});

test('sleb128 encodes single-byte values', () => {
  assert.deepStrictEqual(sleb128(0), [0]);
  assert.deepStrictEqual(sleb128(1), [1]);
  assert.deepStrictEqual(sleb128(63), [63]);
  assert.deepStrictEqual(sleb128(-1), [0x7f]);
  assert.deepStrictEqual(sleb128(-64), [0x40]);
});

test('sleb128 encodes multi-byte values', () => {
  // Positive values where bit 6 is set need an extra byte
  assert.deepStrictEqual(sleb128(64), [0xc0, 0]);
  assert.deepStrictEqual(sleb128(127), [0xff, 0]);

  // Negative multi-byte values
  assert.deepStrictEqual(sleb128(-65), [0xbf, 0x7f]);
  assert.deepStrictEqual(sleb128(-127), [0x81, 0x7f]);
  assert.deepStrictEqual(sleb128(-128), [0x80, 0x7f]);
});

test('sleb128 encodes 3+ byte values', () => {
  assert.deepStrictEqual(sleb128(8192), [0x80, 0xc0, 0]);
  assert.deepStrictEqual(sleb128(-8193), [0xff, 0xbf, 0x7f]);
});

test('sleb128 encodes bigint values', () => {
  assert.deepStrictEqual(sleb128(0n), [0]);
  assert.deepStrictEqual(sleb128(-1n), [0x7f]);
  assert.deepStrictEqual(sleb128(-64n), [0x40]);
  assert.deepStrictEqual(sleb128(128n), [0x80, 0x01]);
  assert.deepStrictEqual(sleb128(-128n), [0x80, 0x7f]);
});
