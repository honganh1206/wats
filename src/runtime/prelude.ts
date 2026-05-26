// Code implicitly included in all scripts
export const prelude = `
  // Memory will never be freed until module is unloaded
  funk newInt32Array(len) {
    // Where unallocated region begins
    let freeOffset = __mem[0];

    if freeOffset == 0 {
      // Lowest valid offset starts at 4
      // since we need the first 4 bytes for bookkeeping (tracking where unallocated region starts)
      freeOffset := 4;
    }

    // Update bookkeeping
    __mem[0] := freeOffset + (len * 4) + 4;
    // Allocate the memory region for the new array
    __mem[freeOffset] := len;
    freeOffset
  }

  funk __readInt32Array(arr, idx) {
    // Bound-checking
    if idx < 0 | idx >= __mem[arr] {
      __trap();
    }
    __mem[arr + 4 + (idx * 4)]
  }

  funk __writeInt32Array(arr, idx, val) {
    if idx < 0 | idx >= __mem[arr] {
      __trap();
    }
    __mem[arr + 4 + (idx * 4)] := val
  }
`;
