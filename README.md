# Wats

A toy language that compiles to WebAssembly binary format, written in TypeScript.

## Language

Wats uses a simple syntax with functions declared using `funk`:

```wats
funk add(x, y) { x + y }

funk main() {
  let result = add(1, 2);
  result
}
```

Wats currently supports integer arithmetic, local bindings, assignment, function calls, imported functions, conditionals, loops, i32 arrays, raw linear memory access, and string literals.

### Variables, arithmetic, assignment, and functions

```wats
funk square(x) { x * x }

funk main() {
  let total = square(6) + 4;
  total := total / 2;
  total - 1
}
```

### Imports and calls into host JavaScript

Imported functions are declared with `extern funk`. The host supplies their implementations when the Wasm module is instantiated.

```wats
extern funk print(x);
extern funk add(a, b);

funk main() {
  let answer = add(40, 2);
  print(answer)
}
```

### Comparisons, logical operators, and conditionals

Comparisons return `1` for true and `0` for false. `if` can be used as an expression or as a statement.

```wats
funk classify(x) {
  if x < 0 {
    0 - 1
  } else if x == 0 {
    0
  } else {
    1
  }
}

funk main() {
  let inRange = 10 <= 42 & 42 <= 99;
  if inRange { classify(42) } else { 0 }
}
```

Available binary operators: `+`, `-`, `*`, `/`, `==`, `!=`, `<`, `<=`, `>`,
`>=`, `&`, and `|`.

### Loops and i32 arrays

`newInt32Array(len)` allocates a linear-memory-backed array. Array indexing is bounds-checked.

```wats
funk sumTo(n) {
  let values = newInt32Array(n);
  let idx = 0;
  let sum = 0;

  while idx < n {
    values[idx] := idx + 1;
    sum := sum + values[idx];
    idx := idx + 1;
  }

  sum
}
```

### String literals

String literals are stored in the module's data section as an i32 length followed by one i32 per character. 

Evaluating a string literal returns the linear-memory offset of that string data.

```wats
funk main() {
  let greeting = "hey";
  greeting
}
```

### Raw linear memory access

The reserved `__mem` name exposes raw Wasm linear memory as i32 loads and stores at byte offsets.

Prefer arrays for normal programs; `__mem` is useful for experiments with memory layout.

```wats
funk main() {
  __mem[16] := 42;
  __mem[16]
}
```

### Full playground-style example

The browser playground provides `add(a, b)`, `one()`, and `print(x)` as built-in host imports. This example combines imports, function calls, variables, assignment, comparisons, logical operators, `if`, `while`, arrays, and a string literal.

```wats
funk fib(n) {
  let prev = 0;
  let curr = 1;
  let idx = 0;

  while idx < n {
    let next = prev + curr;
    prev := curr;
    curr := next;
    idx := idx + 1;
  }

  prev
}

funk main() {
  let title = "wats";
  let values = newInt32Array(4);
  let idx = 0;
  let total = 0;

  while idx < 4 {
    values[idx] := fib(idx + one());
    total := add(total, values[idx]);
    idx := idx + 1;
  }

  let ok = total >= 7 & total != 0;
  let result = if ok { total } else { 0 };

  print(title);
  print(result)
}
```

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
