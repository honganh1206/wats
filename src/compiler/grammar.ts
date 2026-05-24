import { grammar } from "ohm-js";

export const grammarDef = `
  // NOTE: Examples must be declared before declaring rule
  WatsLang {
    Module = (FunctionDecl|ExternFunctionDecl)*

    Stmt = LetStmt
         | IfStmt 
         | ExprStmt
         | WhileStmt

    //+ "let x = 3 + 4;", "let distance = 100 + 2;"
    LetStmt = let identifier "=" Expr ";"

    //+ "while 0 {}", "while x < 10 { x := x + 1; }"
    //- "while 1 { 42 }", "while x < 10 { x := x + 1 }"
    WhileStmt = while Expr BlockStmts

    //+ "funk zero() { 0 }", "funk add(x, y) { x + y }"
    //- "funk x", "funk x();"
    FunctionDecl = funk identifier "(" Params? ")" BlockExpr

    //+ "extern funk print(x);"
    ExternFunctionDecl = extern funk identifier "(" Params? ")" ";"

    Params = identifier ("," identifier)*

    //+ "{ let x = 3; 42 }"
    //- "{ 3abc }"
    //- "{ let x = 3 };"
    BlockExpr = "{" Stmt* Expr "}"

    //+ "{}","{ let x = 3; }", "{ 42; 99; }"
    //- "{ 42 }", "{ x := 1 }"
    BlockStmts = "{" Stmt* "}"

    ExprStmt = Expr ";"

    // Else portion is optional
    //+ "if x < 10 {}", "if z { 42; }", "if x {} else if y {} else { 42; }"
    //- "if x < 10 { 3 } else {}"
    IfStmt = if Expr BlockStmts (else (BlockStmts|IfStmt))?

    //+ "x := 3", "y := 2 + 1"
    AssignmentExpr = identifier ":=" Expr

    // Accept optional expressions
    //+ "42", "add(1, 2)", "if x { 42 } else { 99 }", "iffy := 0"
    //+ "42 + if x { 42 } else { 99 }", "1 + pow(r, 2)"
    //- "1 - iffy := 0"
    Expr = AssignmentExpr --assignment
         | PrimaryExpr (binaryOp PrimaryExpr)* -- binary

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
    keyword = if | else | funk | let | while | extern
    if = "if" ~identPart
    else = "else" ~identPart
    funk = "funk" ~identPart
    let = "let" ~identPart
    while = "while" ~identPart
    extern = "extern" ~identPart

    // Digits can be repeated one or more times
    binaryOp = "+" | "-" | "*" | "/" | compareOp | logicalOp
    compareOp = "==" | "!=" | "<=" | "<" | ">=" | ">"
    logicalOp = "&" | "|"
    number = digit+

    //+ "x", "élan", "_", "_99"
    //- "1", "$nope"

    // Arity of 2 or more
    identifier = ~keyword identStart identPart*

    // snake_case naming convention
    identStart = letter | "_"
    identPart = letter | "_" | digit

    // Comments in Wats. 
    // Use space rule to treat anything after // as white space
    space += singleLineComment | multiLineComment
    singleLineComment = "//" (~"\\n" any)*
    multiLineComment = "/*" (~"*/" any)* "*/"

    //+ "funk addOne(x) { x + one }", "funk one() { 1 } funk two() { 2 }"
    //- "42", "let x", "funk x {}"

}
`;

export const parser = grammar(grammarDef);

