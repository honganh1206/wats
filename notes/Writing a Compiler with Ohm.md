# Writing a Compiler with Ohm

Our compiler's target language is WASM bytecode.

Ohm parses our input into a parse tree (AST)

Usually, we write semantic actions directly inside the grammar, but with Ohm we separate grammars from semantic actions?

## Ohm Operations

An operation traverses the parse tree, and invoke the appropriate semantic action for each node it encounters.

## WASM Value Types

Everything WASM programs do boils down to **operations on primitive values**.

Four types of primitive values: `i32, i64, f32, f64`

Most WASM instructions are numeric instructions that examine or manipulate primitive values.
