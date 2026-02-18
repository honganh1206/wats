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
  number(digits) {
    // Any operations defined in the same semantics instance
    //  can call each other
    const value = this.jsValue();
    return [instr.i32.const, ...i32(value)];
  },
});

