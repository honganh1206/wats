# Conditionals, Comparison and Loops

We will have reserved keywords for `if` like `if = "if" ~identPart` (not followed by something matching `identPart`).

A block has a result type is when *it leaves a value of that type on the stack* (common for expression-oriented languages). 

`if` instruction is followed by a byte that specifies the result type, either value type or empty type

`if` instruction consumes the top-of-stack value. If it's non-zero, the `if` branch is executed.
