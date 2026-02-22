import { module } from "../wasm/module";
import { flatten } from "../wasm/utils";
import { codesec, func, funcsec, functype, typeidx, typesec, codes, exportsec, export_, exportdesc } from "../wasm/sections";
import { instr, localidx, locals, valtype } from "../wasm/instructions";
import { parser } from "./grammar";
import { i32 } from "../wasm/encoding";

export function compile(src: string): Uint8Array<ArrayBuffer> {
  const matchResult = parser.match(src);
  if (matchResult.failed()) {
    // NOTE: Type narrowing from MatchResult to FailedMatchResult
    throw new Error(matchResult.message);
  }

  const mod = module([
    // Type section with one entry of a function
    // with no arguments and return value
    typesec([functype([valtype.i32], [valtype.i32])]),
    funcsec([typeidx(0)]),
    // Export the function at index 0 under the name 'main'
    exportsec([export_('main', exportdesc.func(0))]),
    // Produce the body of the main function
    codesec([codes(
      func(
        // Arg
        [locals(1, valtype.i32)],
        [
          [instr.i32.const, i32(42)],
          // Set the local var
          [instr.local.set, localidx(1)],
          // Get the values from the stack
          [instr.local.get, localidx(0)],
          [instr.local.get, localidx(1)],
          instr.i32.add,
          instr.end,
        ]
      )
    )]),
  ]);

  return Uint8Array.from(flatten(mod));
}

