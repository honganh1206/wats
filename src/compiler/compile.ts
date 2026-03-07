import { codesec, func, funcsec, functype, typeidx, typesec, code, exportsec, export_, exportdesc, locals } from "../wasm/sections";
import { instr, valtype } from "../wasm/instructions";
import { parser } from "./grammar";
import { i32 } from "../wasm/encoding";
import { buildSymbolTable } from "./symbol";
import { defineToWasm } from "./semantics";

export function compile(src: string): Uint8Array<ArrayBuffer> {
  const matchResult = parser.match(src);
  if (matchResult.failed()) {
    // NOTE: Type narrowing from MatchResult to FailedMatchResult
    throw new Error(matchResult.message);
  }

  // NOTE: Discard at the end of the function?
  const semantics = parser.createSemantics();

  // Top-level symbol table with a single key 'Main'
  const symbols = buildSymbolTable(parser, matchResult);
  const localVars = symbols.get('main');
  defineToWasm(semantics, symbols);

  // Load locals from stack and define the WASM body
  const mainFn = func(
    [locals(localVars.size, valtype.i32)],
    semantics(matchResult).toWasm(),
  )
}

