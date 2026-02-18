// Map from instruction name to opcode
export const instr = {
  end: 0x0b,
  i32: {
    'const': 0x41,
  },
  i64: {
    'const': 0x42,
  },
  f32: {
    'const': 0x43,
  },
  f64: {
    'const': 0x44,
  }
}

export const valtype = {
  i32: 0x7f,
  i64: 0x7e,
  f32: 0x7d,
  f64: 0x7c,
}

