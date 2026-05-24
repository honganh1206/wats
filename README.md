# Wats

A toy language that compiles to WebAssembly binary format, written in TypeScript.

## Language

Wats uses a simple syntax with functions declared using `funk`:

```
funk add(x, y) { x + y }

funk main() {
  let result = add(1, 2);
  result
}
```

Supports arithmetic (`+`, `-`, `*`, `/`), `let` bindings, variable assignment (`:=`), and function calls.

## Usage

```sh
# Run tests
bun test

# Type check
npm run check
```

## Project Structure

- `src/wasm/` — Low-level WebAssembly binary encoding (LEB128, instructions, sections, module builder)
- `src/compiler/` — Language frontend: [Ohm.js](https://ohmjs.org/) PEG grammar, semantic actions, and compiler
- `src/runtime/` — WebAssembly module loader
- `test/` — Tests (mirrors `src/` structure)
