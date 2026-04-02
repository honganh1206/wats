import { i32 } from "../wasm/encoding";
import { instr, valtype } from "../wasm/instructions";
import { Semantics } from "ohm-js";
import { resolveSymbol, Scope, Symbol } from "./symbol";
import { localidx, locals } from "../wasm/sections";

export function defineToWasm(semantics: Semantics, symbolTable: Scope) {
  const scopes: [Scope] = [{ locals: new Map<string, Symbol>(), children: new Map<string, Scope>() }];
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
    // Arity = 3? Two last parameters are iteration nodes
    // which are array-like objects that capture multiple matches.
    // NOTE: iterOps and iterOperands share the same number of children
    Expr_arithmetic(num, iterOps, iterOperands) {
      const result = [num.toWasm()];
      for (let i = 0; i < iterOps.numChildren; i++) {
        const op = iterOps.child(i);
        const operand = iterOperands.child(i);
        result.push(operand.toWasm(), op.toWasm());
      }
      return result;
    },
    // Leave the value on the stack
    AssignmentExpr(ident, _, expr) {
      const info = resolveSymbol(ident, scopes.at(-1));
      return [expr.toWasm(), instr.local.tee, localidx(info.idx)];
    },
    // Case label for _paren alternative
    PrimaryExpr_paren(_lparen, expr, _rparen) {
      return expr.toWasm();
    },
    PrimaryExpr_var(ident) {
      const info = resolveSymbol(ident, scopes.at(-1));
      return [instr.local.get, localidx(info.idx)];
    },
    op(char) {
      const op = char.sourceString;
      const instructionByOp = {
        '+': instr.i32.add,
        '-': instr.i32.sub,
        '*': instr.i32.mul,
        '/': instr.i32.div_s,
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
      // Extract param values and types
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
        }
      ]
    }
  })
}
