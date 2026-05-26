import { i32 } from "../wasm/encoding";
import { blocktype, instr, labelidx, valtype } from "../wasm/instructions";
import { Node, Semantics } from "ohm-js";
import { resolveSymbol, Scope, Symbol } from "./symbol";
import { funcidx, localidx, locals, memarg } from "../wasm/sections";

export function defineToWasm(semantics: Semantics, symbolTable: Scope) {
  const scopes: Scope[] = [symbolTable];
  semantics.addOperation('toWasm', {
    FunctionDecl(_func, ident, _lparen, optParams, _rparen, blockExpr) {
      // Get the local scope of the function
      scopes.push(symbolTable.children.get(ident.sourceString));
      const result = [blockExpr.toWasm(), instr.end];
      scopes.pop();
      return result;
    },
    BlockExpr(_lbrace, iterStmt, expr, _rbrace) {
      return [...iterStmt.children, expr].map((c) => c.toWasm());
    },
    BlockStmts(_lbrace, iterStmt, _rbrace) {
      return iterStmt.children.map((c) => c.toWasm())
    },
    // NOTE: Ohm automatically generates this "pass-through" action,
    // even though we do not explicitly specify it.
    Stmt(child) {
      return child.toWasm();
    },
    LetStmt(_let, ident, _eq, expr, _) {
      // Passing the innermost scope (What?)
      const info = resolveSymbol(ident, scopes.at(-1));
      return [expr.toWasm(), instr.local.set, localidx(info.idx)];
    },
    // Output and remove value off the stack
    ExprStmt(expr, _) {
      return [expr.toWasm(), instr.drop];
    },
    WhileStmt(_while, cond, body) {
      return [
        [instr.loop, blocktype.empty],
        cond.toWasm(),
        [instr.if, blocktype.empty],
        body.toWasm(),
        [instr.br, labelidx(1)], // Back to top of loop
        instr.end, // End if
        instr.end, // End loop
      ];
    },
    // Arity = 3? Two last parameters are iteration nodes
    // which are array-like objects that capture multiple matches.
    // NOTE: iterOps and iterOperands share the same number of children
    Expr_binary(num, iterOps, iterOperands) {
      const result = [num.toWasm()];
      for (let i = 0; i < iterOps.numChildren; i++) {
        const op = iterOps.child(i);
        const operand = iterOperands.child(i);
        result.push(operand.toWasm(), op.toWasm());
      }
      return result;
    },
    // Leave the value on the stack
    AssignmentExpr_var(ident, _, expr) {
      const info = resolveSymbol(ident, scopes.at(-1));
      return [expr.toWasm(), instr.local.tee, localidx(info.idx)];
    },
    AssignmentExpr_array(ident, _lbracket, idxExpr, _rbracket, _, expr) {
      const tempVar = scopes.at(-1).locals.get('$temp');
      if (ident.sourceString === "__mem") {
        return [
          idxExpr.toWasm(),
          expr.toWasm(),
          // We must leave a value on a stack for __mem
          [instr.local.tee, localidx(tempVar.idx)], // Save value but leave original value on stack
          // Array accesses should be aligned to a four-byte boundary?
          [instr.i32.store, memarg(2, 0)],
          [instr.local.get, localidx(tempVar.idx)],
        ]
      }
    },
    // Case label for _paren alternative
    PrimaryExpr_paren(_lparen, expr, _rparen) {
      return expr.toWasm();
    },
    PrimaryExpr_var(ident) {
      const info = resolveSymbol(ident, scopes.at(-1));
      return [instr.local.get, localidx(info.idx)];
    },
    PrimaryExpr_index(ident, _lbracket, idxExpr, _rbracket) {
      // Special variable name reserved for memory array
      if (ident.sourceString === "__mem") {
        // Load the offset onto the stack
        return [idxExpr.toWasm(), instr.i32.load, memarg(0, 0)];
      }
      // TODO: Yet to support array structure
      throw new Error('Not supported yet')
    },
    CallExpr(ident, _lparen, optArgs, _rparen) {
      const name = ident.sourceString;
      // Get all funk names from top-level symbol table
      const funkNames = Array.from(scopes[0].children.keys());
      const idx = funkNames.indexOf(name);
      return [
        // Emit arg bytecodes first, then call instruction
        optArgs.children.map((c) => c.toWasm()),
        [instr.call, funcidx(idx)],
      ];
    },
    Args(expr, _, iterExpr) {
      return [expr, ...iterExpr.children].map((c) => c.toWasm());
    },
    IfExpr(_if, expr, thenBlock, _else, elseBlock) {
      return [
        expr.toWasm(),
        [instr.if, blocktype.i32],
        thenBlock.toWasm(),
        instr.else,
        elseBlock.toWasm(),
        instr.end,
      ];
    },
    IfStmt(_if, expr, thenBlock, _else, iterElseBlock) {
      const elseFrag =
        iterElseBlock.child(0) ?
          [instr.else, iterElseBlock.child(0).toWasm()]
          : [];
      return [
        expr.toWasm(),
        [instr.if, blocktype.empty],
        thenBlock.toWasm(),
        elseFrag,
        instr.end,
      ];
    },
    binaryOp(char) {
      const op = char.sourceString;
      const instructionByOp = {
        '+': instr.i32.add,
        '-': instr.i32.sub,
        '*': instr.i32.mul,
        '/': instr.i32.div_s,
        '==': instr.i32.eq,
        '!=': instr.i32.ne,
        '<': instr.i32.lt_s,
        '<=': instr.i32.le_s,
        '>': instr.i32.gt_s,
        '>=': instr.i32.ge_s,
        '&': instr.i32.and,
        '|': instr.i32.or,
      };
      if (!Object.hasOwn(instructionByOp, op)) {
        throw new Error(`Unhandled operator '${op}'`);
      }
      return instructionByOp[op];
    },
    number(digits) {
      // Any operations defined in the same semantics instance
      //  can call each other
      const value = parseInt(this.sourceString, 10);
      return [instr.i32.const, ...i32(value)];
    },
  });
}

export function defineFunctionDecls(semantics: Semantics, symbolTable: Scope) {
  semantics.addOperation('functionDecls', {
    _default(...children) {
      return children.flatMap((c) => c.functionDecls());
    },
    FunctionDecl(_func, ident, _lparen, _params, _rparen, _blockExpr) {
      // Extract parameter values and types
      const name = ident.sourceString;
      const localVars = Array.from(symbolTable.children.get(name).locals.values());
      const params = localVars.filter((info) => info.what === 'param');
      const paramTypes = params.map((_) => valtype.i32);
      const varsCount = localVars.filter((info) => info.what === 'local').length;
      return [
        {
          name,
          paramTypes,
          resultType: valtype.i32,
          locals: [locals(varsCount, valtype.i32)],
          body: this.toWasm(),
        },
      ];
    },
  });
}

export function defineImportDecls(semantics: Semantics) {
  semantics.addOperation('importDecls', {
    _default(...children) {
      return children.flatMap((c) => c.importDecls());
    },
    ExternFunctionDecl(_extern, _func, ident, _l, optParams, _r, _) {
      const name = ident.sourceString;
      const paramTypes =
        optParams.numChildren === 0 ?
          []
          : getParamTypes(optParams.child(0));
      return [
        {
          module: 'watsImports',
          name,
          paramTypes,
          resultType: valtype.i32,
        }
      ]
    },
  });
}

function getParamTypes(node: Node) {
  // A Params node of a imported functions should always have three child nodes:
  // First is the identifier, second is the commas between params, and third is identifiers after the 1st one
  if (node.ctorName !== 'Params') {
    throw new Error('Wrong node type');
  }
  if (node.numChildren !== 3) {
    throw new Error('Wrong number of children');
  }
  const [_, __, iterRest] = node.children;
  // Tell the compiler the Wasm type of the params (i32, the language currently supports i32 only) 
  return new Array(iterRest.numChildren + 1).fill(valtype.i32);
}
