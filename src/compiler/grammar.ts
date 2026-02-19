import { grammar } from "ohm-js";

export const grammarDef = `
  WatsLang {
    Main = Expr
    // Accept optional expressions
    Expr = number (op number)*

    op = "+" | "-"
    // Digits can be repeated one or more times
    number = digit+
  }

  // Examples:
  //+ "42", "1", "66 + 99" "1 + 2 - 3"
  //- "abc"
`
export const parser = grammar(grammarDef);

