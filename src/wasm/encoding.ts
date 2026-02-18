import assert from "node:assert";

// NOTE: We use number instead of UInt8Array for flexibility?
export type Byte = number;

// Nested recursive array structure that references itself
// meaning every function returns either raw bytes 
// or arbitrarily nested arrays of bytes
export type ByteArray = Byte | ByteArray[];

const MIN_U32 = 0;
const MAX_U32 = 2 ** 32 - 1;

export function u32(v: number): ByteArray[] {
  assert(v >= 0, `Value is negative: ${v}`);
  if (v < MIN_U32 || v > MAX_U32) {
    throw Error(`Value out of range for u32: ${v}`);
  }

  return leb128(v);
}

const MIN_I32 = -(2 ** 32 / 2);

const MAX_I32 = 2 ** 32 / 2 - 1;
// Input might be an unsigned representation of a negative number e.g., 0xFFFFFFFF = 4294967295 for -1

// so we need to convert back to the actual negative number
const I32_NEG_OFFSET = 2 ** 32;

export function i32(v: number): ByteArray[] {
  if (v > MAX_U32 || v < MIN_I32) {
    throw Error(`Value out of range for i32: ${v}`);
  }

  if (v > MAX_I32) {
    return sleb128(v - I32_NEG_OFFSET);
  }

  return sleb128(v);
}

const MIN_U64 = 0n;
const MAX_U64 = 2n ** 64n - 1n;

export function u64(v: bigint): ByteArray[] {
  if (v < MIN_U64 || v > MAX_U64) {
    throw Error(`Value out of range for u64: ${v}`);
  }

  return leb128(v);
}

const MIN_I64 = -(2n ** 64n / 2n);
const MAX_I64 = 2n ** 64n / 2n - 1n;
const I64_NEG_OFFSET = 2n ** 64n;

export function i64(v: bigint): ByteArray[] {
  if (v < MIN_I64 || v > MAX_U64) {
    throw Error(`Value out of range for i64: ${v}`);
  }

  if (v > MAX_I64) {
    return sleb128(v - I64_NEG_OFFSET);
  }

  return sleb128(v);
}

export function vec(elements: ByteArray[]): ByteArray[] {
  return [u32(elements.length), elements];
}

const SEVEN_BIT_MASK_BIG_INT = 0b01111111n;
const CONTINUATION_BIT = 0b10000000;

// Encode all numbers that fit into 7 bits from 0 to 127
export function leb128(v: number | bigint): ByteArray[] {
  let val = typeof v === "number" ? BigInt(v) : v;
  let more = true;
  const r: ByteArray = [];

  while (more) {
    // Extract the lowest 7 bits of val
    // and pack them into each output byte.
    // The 8th bit is reserved for the continuation bit
    const b = Number(val & SEVEN_BIT_MASK_BIG_INT);
    // Shift to the next 7 bits to process
    val = val >> 7n;
    more = val !== 0n;
    if (more) {
      // Set the continuation bit in the current byte
      r.push(b | CONTINUATION_BIT);
    } else {
      r.push(b);
    }
  }

  return r;
}

export function sleb128(v: number | bigint): ByteArray[] {
  let val = typeof v === "number" ? BigInt(v) : v;
  let more = true;

  const r: ByteArray = [];

  while (more) {
    const b = Number(val & SEVEN_BIT_MASK_BIG_INT);
    // Isolate bit 6 and check if either 1 or 0
    const signBitSet = !!(b & 0x40);

    val = val >> 7n;

    // Check for both unsigned (val is 0 and sign bit 6 clear) and signed (val is -1 and sign bit 6 set)
    if ((val === 0n && !signBitSet) || (val === -1n && signBitSet)) {
      // No bit left to process or highest negative value?
      more = false;
      r.push(b);
    } else {
      r.push(b | CONTINUATION_BIT);
    }
  }

  return r;
}
