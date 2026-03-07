// Map from instruction name to opcode
export const instr = {
  end: 0x0b,
  i32: {
    'const': 0x41,
    'add': 0x6a,
    'sub': 0x6b,
    'mul': 0x6c,
    // Signed integers
    'div_s': 0x6d,
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
}

export const valtype = {
  i32: 0x7f,
  i64: 0x7e,
  f32: 0x7d,
  f64: 0x7c,
}
