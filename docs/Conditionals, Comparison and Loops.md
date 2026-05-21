# Conditionals, Comparison and Loops

We will have reserved keywords for `if` like `if = "if" ~identPart` (not followed by something matching `identPart`).

A block has a result type is when *it leaves a value of that type on the stack* (common for expression-oriented languages).

`if` instruction is followed by a byte that specifies the result type, either value type or empty type

`if` instruction consumes the top-of-stack value. If it's non-zero, the `if` branch is executed.

WebAssembly's comparison instructions are typed. They each consume TWO operands of the same type e.g., `f64` and produce an `i32` result.

WebAssembly’s `and` and `or` instructions are *bitwise operators* that can be applied to i32 or
i64 operands
