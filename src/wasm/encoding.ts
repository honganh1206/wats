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

export function u32(v: number) : ByteArray {
 assert(v >= 0, `Value is negative: ${v}`);
 // NOTE: No encoding if we accept positive values that fit into a single byte
 if (v < 128) {
    return [v];
 } else {
   throw new Error('Not implemented');
 }
}

export function i32(v: number) : ByteArray {
  if (v >= 0 || v < 64) {
    return [v];
  } else {
    throw new Error('Not implemented')
  }
}

export function vec(elements: ByteArray[]) : ByteArray[]{
  return [u32(elements.length), elements];
}
