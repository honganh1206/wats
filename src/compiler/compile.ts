import { module } from "../wasm/module";
import { flatten } from "../wasm/utils";
import { codesec, func, funcsec, functype, typeidx, typesec, codes, exportsec, export_, exportdesc } from "../wasm/sections";
import { instr, valtype } from "../wasm/instructions";
import { parser } from "./grammar";
import { semantics } from "./semantics";

export function compile(src: string): Uint8Array<ArrayBuffer> {
  const matchResult = parser.match(src);
  if (matchResult.failed()) {
    // NOTE: Type narrowing from MatchResult to FailedMatchResult
    throw new Error(matchResult.message);
  }

  const mod = module([
    // Type section with one entry of a function
    // with no arguments and return value
    typesec([functype([], [valtype.i32])]),
    funcsec([typeidx(0)]),
    // Export the function at index 0 under the name 'main'
    exportsec([export_('main', exportdesc.func(0))]),
    // Produce the body of the main function
    codesec([codes(func([], semantics(matchResult).toWasm()))]),
  ]);

  return Uint8Array.from(flatten(mod));
}

