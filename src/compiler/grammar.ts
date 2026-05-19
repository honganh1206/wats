import { grammar } from "ohm-js";

export const grammarDef = `
  // NOTE: Examples must be declared before declaring rule
  WatsLang {
    Module = FunctionDecl*

    Stmt = LetStmt
         | ExprStmt

    //+ "let x = 3 + 4;", "let distance = 100 + 2;"
    LetStmt = let identifier "=" Expr ";"

    //+ "funk zero() { 0 }", "funk add(x, y) { x + y }"
    //- "funk x", "funk x();"
    FunctionDecl = funk identifier "(" Params? ")" BlockExpr

    Params = identifier ("," identifier)*

    //+ "{ let x = 3; 42 }"
    //- "{ 3abc }"
    //- "{ let x = 3 };"
    BlockExpr = "{" Stmt* Expr "}"

    ExprStmt = Expr ";"

    //+ "x := 3", "y := 2 + 1"
    AssignmentExpr = identifier ":=" Expr

    // Accept optional expressions
    //+ "42", "add(1, 2)", "if x { 42 } else { 99 }", "iffy := 0"
    //+ "42 + if x { 42 } else { 99 }", "1 + pow(r, 2)"
    //- "1 - iffy := 0"
    Expr = AssignmentExpr --assignment
         | PrimaryExpr (op PrimaryExpr)* -- arithmetic

    // Low-level building block of expressions
    // and both branches have an arity of 1
    // and expression could be either a number or an identifier
    PrimaryExpr = "(" Expr ")" -- paren
                | number
                | CallExpr
                | identifier -- var
                | IfExpr

    op = "+" | "-" | "*" | "/"

    CallExpr = identifier "(" Args? ")"

    // Function args
    Args = Expr ("," Expr)*

    //+ "if x { 42 } else { 99 }", "if x { 42 } else if y { 99 } else { 0 }"
    //- "if x { 42 }"
    IfExpr = if Expr BlockExpr else (BlockExpr|IfExpr)

    // Reserved keywords
    keyword = if | else | funk | let
    if = "if" ~identPart
    else = "else" ~identPart
    funk = "funk" ~identPart
    let = "let" ~identPart

    // Digits can be repeated one or more times
    number = digit+

    //+ "x", "élan", "_", "_99"
    //- "1", "$nope"

    // Arity of 2 or more
    identifier = ~keyword identStart identPart*

    // snake_case naming convention
    identStart = letter | "_"
    identPart = letter | "_" | digit

    //+ "funk addOne(x) { x + one }", "funk one() { 1 } funk two() { 2 }"
    //- "42", "let x", "funk x {}"
}
`;

export const parser = grammar(grammarDef);

