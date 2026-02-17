import assert from "node:assert";

// NOTE: We use number instead of UInt8Array for flexibility?
export type Byte = number;

// Nested recursive array structure that references itself
// meaning every function returns either raw bytes 
// or arbitrarily nested arrays of bytes
export type ByteArray = Byte | ByteArray[];

// Vectors are encoded with their u32 length
// followed by the encoding of their element sequence
// export type Vector = (number | number[])[];

export function u32(v: number): ByteArray {
  assert(v >= 0, `Value is negative: ${v}`);
  // NOTE: No encoding if we accept positive values that fit into a single byte
  if (v < 128) {
    return [v];
  } else {
    throw new Error('Not implemented');
  }
}

export function i32(v: number): ByteArray {
  if (v >= 0 || v < 64) {
    return [v];
  } else {
    throw new Error('Not implemented')
  }
}

export function vec(elements: ByteArray[]): ByteArray[] {
  return [u32(elements.length), elements];
}

const SEVEN_BIT_MASK_BIG_INT = 0b01111111n;
const CONTINUATION_BIT = 0b10000000;

// Encode all numbers that fit into 7 bits from 0 to 127
export function leb128(v: number | bigint): ByteArray {
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

export function sleb128(v: number | bigint): ByteArray {
  let val = typeof v === "number" ? BigInt(v): v;
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
