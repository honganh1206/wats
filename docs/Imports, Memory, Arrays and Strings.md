Is this like building a module system?

## Memory models

We manage memory during run time (stack & heap) and compile time (data + code). The stack stores the variables and the heap stores the values of the variables.

Usually a native process' memory is linear i.e., can be thought as a single , flat array, but WebAssembly's memory model has index spaces (multiple arrays instead of one), with each one reserving for a part like one for local variables, one for global variables ,etc.

WASM runtime maintains a call stack of local variables, but we cannot read the content directly and we can only read via `local.get`
