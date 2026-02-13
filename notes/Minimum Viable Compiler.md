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

A WebAssembly module is a kkind of *template* which can be used to create multiple module instances?

Each module has a "magic number" (sequence of bytes to identify format `"\0asm"`) and a module version
