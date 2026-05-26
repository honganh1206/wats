import { u32 } from "./encoding";

// Map from instruction name to opcode
export const instr = {
  end: 0x0b,
  i32: {
    'const': 0x41,
    'add': 0x6a,
    'sub': 0x6b,
    'mul': 0x6c,
    'div_s': 0x6d,
    'eqz': 0x45, // a == 0
    'eq': 0x46,
    'ne': 0x47,
    // _s for signed and _u for unsigned
    'lt_s': 0x48,
    'lt_u': 0x49,
    'gt_s': 0x4a,
    'gt_u': 0x4b,
    'le_s': 0x4c,
    'le_u': 0x4d,
    'ge_s': 0x4e,
    'ge_u': 0x4f,
    // Logical (bitwise) operators
    'and': 0x71,
    'or': 0x72,
    // Read/write data from memory section
    'load': 0x28,
    'store': 0x36,
  },
  i64: {
    'const': 0x42,
  },
  f32: {
    'const': 0x43,
  },
  f64: {
    'const': 0x44,
  },
  local: {
    // Push value to stack
    'get': 0x20,
    // Set value at index x and remove from the stack
    'set': 0x21,
    // Like set but retain the value of the stack
    'tee': 0x22,
  },
  drop: 0x1a,
  call: 0x10,
  // Every if must be paired with an end
  if: 0x04,
  else: 0x05,
  block: 0x02,
  loop: 0x03,
  br: 0x0c,
  // Break out of loop
  br_if: 0x0d,
  memory: {
    // Return the current size of a memory in pages
    size: 0x3f, // [] -> [i32]with imports
    // Grow memory by a given number of pages and return the previous size
    grow: 0x40, // [i32] -> [i32]
  },
  unreachable: 0x00,
}

export const valtype = {
  i32: 0x7f,
  i64: 0x7e,
  f32: 0x7d,
  f64: 0x7c,
}

export const blocktype = { empty: 0x40, ...valtype }

export const labelidx = u32;

