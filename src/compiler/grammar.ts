import { grammar } from "ohm-js";

export const grammarDef = `
  // NOTE: Examples must be declared before declaring rule
  WatsLang {
    Module = FunctionDecl*

    Stmt = LetStmt
         | ExprStmt

    // Examples for variable declaration:
    //+ "let x = 3 + 4;", "let distance = 100 + 2;"
    LetStmt = "let" identifier "=" Expr ";"

    //+ "funk zero() { 0 }", "funk add(x, y) { x + y }"
    //- "funk x", "funk x();"
    FunctionDecl = "funk" identifier "(" Params? ")" BlockExpr

    Params = identifier ("," identifier)*

    //+ "42", "1", "66 + 99", "1 + 2 - 3", "1 + (2 * 3)", "(((1) / 2))"
    //+ "let x = 3; 42"

    // NOTE: "abc" is a valid expression. 
    // We have yet to enforce that only previously declared variables appear in an expression
    // NOTE: Program must contain at least one expression (for now)
    //- "3abc"
    //- "let x = 3;"
    BlockExpr = "{" Stmt* Expr "}"

    // An expression could also be a statement, yes
    ExprStmt = Expr ";"

    //+ "x := 3", "y := 2 + 1"
    AssignmentExpr = identifier ":=" Expr

    // Accept optional expressions
    Expr = AssignmentExpr --assignment
         | PrimaryExpr (op PrimaryExpr)* -- arithmetic

    // Low-level building block of expressions
    // and both branches have an arity of 1
    // and expression could be either a number or an identifier
    PrimaryExpr = "(" Expr ")" -- paren
                | number
                | identifier -- var

    op = "+" | "-" | "*" | "/"
    // Digits can be repeated one or more times
    number = digit+


    // Examples with identifiers:
    //+ "x", "élan", "_", "_99"
    //- "1", "$nope"

    // Arity of 2 or more
    identifier = identStart identPart*

    // We do snake case here
    identStart = letter | "_"
    identPart = letter | "_" | digit

    // Examples:
    //+ "funk addOne(x) { x + one }", "funk one() { 1 } funk two() { 2 }"
    //- "42", "let x", "funk x {}"
}
`;

export const parser = grammar(grammarDef);

