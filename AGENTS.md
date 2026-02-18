# AGENTS.md — Wats (WebAssembly from TypeScript)

## Commands
- **Type check:** `npx tsc --noEmit`
- **All tests:** `bun test` (or `npm test` for Node with `--experimental-strip-types`)
- **Single test:** `bun test test/wasm/encoding.test.ts`

## Architecture
Wats is a toy language that compiles to WebAssembly binary format.
- `src/wasm/` — Low-level Wasm binary encoding: LEB128 encoding (`encoding.ts`), instructions (`instructions.ts`), sections (`sections.ts`), module builder (`module.ts`), byte utilities (`utils.ts`). Core type: `ByteArray = Byte | ByteArray[]` (recursive nested byte arrays, flattened at module assembly).
- `src/compiler/` — Language frontend: Ohm.js PEG grammar (`grammar.ts`), semantic actions (`semantics.ts`), and top-level `compile()` that produces a `Uint8Array` Wasm module (`compile.ts`).
- `test/` — Mirrors `src/` structure. Uses `node:test` and `node:assert`.

## Code Style
- TypeScript with `strict: false`, `module: nodenext`. No build step — runs via `--experimental-strip-types` or Bun.
- Imports: named imports from relative paths with `.ts` extensions (e.g., `import { u32 } from "../wasm/encoding"`). Only dependency: `ohm-js`.
- Types: prefer explicit return types on exported functions. `ByteArray` is the core recursive type for all Wasm byte construction.
- Tests: one `test()` per behavior, flat assertions with `assert.strictEqual`/`assert.deepStrictEqual`/`assert.throws`. No test framework beyond `node:test`.
- Naming: `snake_case` for Wasm spec terms (e.g., `export_`, `exportdesc`), `camelCase` for everything else.
- No comments unless explaining non-obvious Wasm encoding logic.
