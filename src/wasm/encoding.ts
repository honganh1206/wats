// A single byte in the final Wasm module.
export type Byte = number;

// Byte constructors return nested arrays so callers can compose Wasm
// structures first and flatten them only when the final module is emitted.
export type ByteArray = Byte | ByteArray[];

export type DataSegment = {
  offset: number,
  bytes: ByteArray[],
}

const MIN_U32 = 0;
const MAX_U32 = 2 ** 32 - 1;

export function u32(v: number): ByteArray[] {
  if (v < 0) {
    throw Error(`Value is negative: ${v}`);
  }
  if (v < MIN_U32 || v > MAX_U32) {
    throw Error(`Value out of range for u32: ${v}`);
  }

  return leb128(v);
}

const MIN_I32 = -(2 ** 32 / 2);

const MAX_I32 = 2 ** 32 / 2 - 1;
// Accept two's-complement unsigned representations of negative i32 values,
// e.g. 0xFFFFFFFF (4294967295) encodes as -1.
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

// Unsigned LEB128 encodes a value 7 bits at a time. 
// The high bit of each byte indicates whether another byte follows.
export function leb128(v: number | bigint): ByteArray[] {
  let val = typeof v === "number" ? BigInt(v) : v;
  let more = true;
  const r: ByteArray = [];

  while (more) {
    // Pack the lowest 7 bits into the output byte; the 8th bit is reserved
    // for the continuation marker.
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
    // Bit 6 is the sign bit of the current 7-bit payload.
    const signBitSet = !!(b & 0x40);

    val = val >> 7n;

    // Stop when the remaining bits are only sign extension.
    if ((val === 0n && !signBitSet) || (val === -1n && signBitSet)) {
      more = false;
      r.push(b);
    } else {
      r.push(b | CONTINUATION_BIT);
    }
  }

  return r;
}

export function int32ToBytes(value: number): ByteArray[] {
  // Reject anything outside of i32 range
  if (value < -(2 ** 31) || value > 2 ** 31 - 1) {
    throw Error(`Value out of range for int32: ${value}`);
  }

  return [
    // Encode the length + string to hexadecimal values
    value & 0xff,
    (value >> 8) & 0xff,
    (value >> 16) & 0xff,
    (value >> 24) & 0xff,
  ];
}
