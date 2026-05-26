## Memory models

We manage memory during run time (stack & heap) and compile time (data + code). The stack stores the variables and the heap stores the values of the variables.

Usually a native process' memory is linear i.e., can be thought as a single , flat array, but WebAssembly's memory model has index spaces (multiple arrays instead of one), with each one reserving for a part like one for local variables, one for global variables ,etc.

WASM runtime maintains a call stack of local variables, but we cannot read the content directly and we can only read via `local.get`

## Arrays and strings

For WASM we use memory to store more complex (aggregate) types. 

WASM has no way to pass structs by values, so we need a more low-level features like pointers and bump allocators.

Strings are a finite ordered sequence of zero or more 16-bit unsigned integer values. For WASM, we store 16-bit code unit as element of i32 array.
