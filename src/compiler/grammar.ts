import { grammar } from "ohm-js";

export const grammarDef = `
  WatsLang {
    Main = Expr
    // Accept optional expressions
    Expr = PrimaryExpr (op PrimaryExpr)*
    // Low-level building block of expressions
    // and both branches have an arity of 1
    PrimaryExpr = "(" Expr ")" -- paren
                | number

    op = "+" | "-" | "*" | "/"
    // Digits can be repeated one or more times
    number = digit+
  }

  // Examples:
  //+ "42", "1", "66 + 99" "1 + 2 - 3", "1 + (2 * 3)", "(((1) / 2))"
  //- "abc"
`
export const parser = grammar(grammarDef);

