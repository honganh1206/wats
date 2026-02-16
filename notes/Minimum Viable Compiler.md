# Minimum Viable Compiler

We will build a *small compiler* that compiles  

## Handling binary data in JS/TS

```js
const arr = new Uint8Array(2); // An array of two bytes.
arr[0] = 5;
arr[1] = 7;
console.log(arr[0] + arr[1]); // Prints '12'
```

Hexadecimal: A byte can be represented by two characters from 0 (`00`) to 255 (`ff`)

## WASM Module

A WebAssembly module is a kind of *template* which can be used to create multiple module instances?

Each module has a "magic number" (sequence of bytes to identify format `"\0asm"`) and a module version. This is a **preamble**. 

After the preable, a WASM module consists of zero or more sections. These sections are optional.

WASM expects a function to be split into three sections:

1. *Type* section contains the function's type signature. If multiple functions share the same signature, they can refer to the same entry in this section (WASM refers to functions by index).
2. *Function* to declare the function. The function is referred to by its index in this section?. 
3. *Code* is the body of the function.

### WASM Section

Each section has three parts:

1. *Section identifier* like type section has the ID of 1.
2. *Size* represents the size of the section payload.
3. *Contents* vary based on section type, but usually structured as a list of zero or more entries?.

All integers in a WASM module are encoded with a [[Variable-Length Encoding]] following LEB128 (Little-Endian Base 128), meaning if the integer does not fit into one byte, the algorithm will try to fit it in two, then three, and so on.

For non-negative integers that fit in a single byte, no encoding is necessary.
