import assert from "node:assert";
import { i32 } from "../wasm/encoding";
import { instr } from "../wasm/instructions";
import { parser } from "./grammar"

export const semantics = parser.createSemantics();

// Interpreter for Wats
semantics.addOperation('jsValue', {
  // Where each rule has a semantic action (function)
  Main(num) {
    return num.jsValue();
  },
  Expr(num, iterOps, iterOperands) {
    // Just a number, no operator
    assert.strictEqual(iterOps.numChildren, 0);
    assert.strictEqual(iterOperands.numChildren, 0);
    return num.jsValue();
  },
  number(digits) {
    // Evaluate the number
    // as jsValue() visits number node
    return parseInt(this.sourceString, 10);
  }
});

semantics.addOperation('toWasm', {
  Main(num) {
    // Return the number parsed from the input string
    return [num.toWasm(), instr.end];
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
  op(char) {
    return [char.sourceString === "+" ? instr.i32.add : instr.i32.sub];
  },
  number(digits) {
    // Any operations defined in the same semantics instance
    //  can call each other
    const value = this.jsValue();
    return [instr.i32.const, ...i32(value)];
  },
});

