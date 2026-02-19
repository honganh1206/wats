# Index

WebAssembly (WASM) is a *low-level bytecode* format. It is intended as a *compilation target*, allowing languages like C++, Go, and Rust to be executed on the browser at near-native speed. 

A browser will download the bytecode and translate it to native machine code on the user's device.

Unlike machine code, WASM does not target any specific CPU architecture. It is meant to be portable and close enough to real CPU instructions.

Four key properties: 

1. Safe: A module does not anything it is not allowed to do.
2. Fast: Simple and fast to compile to native code.
3. Portable + Compact: Once code is compiled to WASM module, it will run on any platform or hardware architecture.

## How Figma uses WASM

A Figma engineer writes some C++ code and compiles it to produce a WASM module `.wasm` (not executable, more like a shared library?).

We use JS to execute WASM.

```js
// Fetch the binary module
const source = fetch('compiled_wasm.wasm');
// Verify, compile, and instantiate the module
const {instance} = await WebAssembly.instantiateStreaming(source);
// Call the module's exported function
instance.exports.renderFigma();
```

## Structure of WASM

(Refer to [WASM Core Specification](https://www.w3.org/TR/wasm-core-1/) )

Execution model: Instruction set + Formal definitions of how instructions are interpreted

Binary module format `.wasm` to package and distribute WASM

Validation rules + Textual format `.wat` as a human-readable way of defining modules (not cover for now, since no need to support it for compilers and browsers)

The *host environments* cover the module instantiation, imports, and exports. Node.js is an example of this via the [WASM JavaScript Interface](https://www.w3.org/TR/wasm-core-1/) and [WASM Web API](https://www.w3.org/TR/wasm-web-api/).

For non-browser runtimes, we use [WASI](https://wasi.dev/) that specifies APIs to cover things like filesystems and networking.

## Project structure

```
wafer-compiler/
├── src/
│   ├── wasm/              # Low-level Wasm binary encoding
│   │   ├── encoding.ts    # leb128, u32, i32, stringToBytes
│   │   ├── sections.ts    # typesec, funcsec, codesec, exportsec, importsec, memsec, datasec
│   │   ├── instructions.ts # instr opcodes, valtype, blocktype
│   │   └── module.ts      # module(), buildModule()
│   ├── compiler/          # Wafer language compiler
│   │   ├── grammar.ts     # Ohm grammar definition (wafer)
│   │   ├── symbols.ts     # buildSymbolTable, resolveSymbol
│   │   ├── strings.ts     # buildStringTable
│   │   ├── semantics.ts   # defineToWasm, defineImportDecls, defineFunctionDecls
│   │   └── compile.ts     # compile() entry point
│   ├── runtime/           # Runtime helpers
│   │   ├── loader.ts      # loadMod(), waferStringToJS()
│   │   └── prelude.ts     # waferPrelude source string
│   └── index.ts           # Public API re-exports
├── tests/
│   ├── wasm/
│   │   ├── encoding.test.ts
│   │   └── sections.test.ts
│   ├── compiler/
│   │   ├── grammar.test.ts
│   │   ├── symbols.test.ts
│   │   └── compile.test.ts
│   └── runtime/
│       └── loader.test.ts
├── tsconfig.json
├── package.json
└── vitest.config.ts       # or use node:test with tsx
```

[[Minimum Viable Compiler]]

[[Variable-Length Integer Encoding]]

[[Writing a Compiler with Ohm]]

[[About WASM]]
