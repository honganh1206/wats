import { i32 } from "../wasm/encoding";
import { instr } from "../wasm/instructions";
import { Semantics } from "ohm-js";
import { Symbol } from "./symbol";

export function defineToWasm(semantics: Semantics, localVars: Map<string, Symbol>) {
  semantics.addOperation('toWasm', {
    // TODO: Update Main rule now with arity = 2
    Main(stmtIter, expr) {
      return [
        stmtIter.children.map((c) => c.toWasm()),
        expr.toWasm(),
        instr.end,
      ];
    },
    // Arity = 3? Two last parameters are iteration nodes
    // which are array-like objects that capture multiple matches.
    // NOTE: iterOps and iterOperands share the same number of children
    Expr(num, iterOps, iterOperands) {
      const result = [num.toWasm()];
      for (let i = 0; i < iterOps.numChildren; i++) {
        const op = iterOps.child(i);
        const operand = iterOperands.child(i);
        result.push(operand.toWasm(), op.toWasm());
      }
      return result;
    },
    PrimaryExpr_paren(_lparen, expr, _rparen) {
      return expr.toWasm();
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


