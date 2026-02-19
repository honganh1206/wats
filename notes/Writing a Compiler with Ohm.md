# Writing a Compiler with Ohm

Our compiler's target language is WASM bytecode.

Ohm parses our input into a parse tree (AST)

Usually, we write semantic actions directly inside the grammar, but with Ohm we separate grammars from semantic actions?

## Ohm Operations

An operation traverses the parse tree, and invoke the appropriate semantic action for each node it encounters.

An operation includes semantic actions like `Main`, and each action can invoke any operation it needs via method calls.

## Semantic Action Arguments

Each argument represents a child node.

When an action is invoked to handle a specific node in the parse tree, the arguments in the action represent that node's children.

The number of arguments a function takes is called its **arity** and each rule body has an arity.

