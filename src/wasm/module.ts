import { ByteArray } from "./encoding";
import { flatten, stringToBytes } from "./utils";
import { codesec, func, funcsec, functype, instr, typeidx, typesec, codes, exportsec, export_, exportdesc } from "./sections";

export function compile(code: string): Uint8Array<ArrayBuffer> {
  // TODO: What is ArrayBuffer?
  if (code !== '') {
    throw new Error(`Expected empty code, got: "${code}"`);
  }

  const mod = module([
    // Type section with one entry of a function
    // with no arguments and return value
    typesec([functype([], [])]),
    funcsec([typeidx(0)]),
    // Export the function at index 0 under the name 'main'
    exportsec([export_('main', exportdesc.func(0))]),
    codesec([codes(func([], [instr.end]))]),
  ]);

  return Uint8Array.from(flatten(mod));
}

function module(sections: ByteArray[][]) : ByteArray[] {
  return [magic(), version(), sections]
}

// Each WASM module has a magic number
function magic(): ByteArray[] {
  // [0x00, 0x61, 0x73, 0x6d]
  return stringToBytes('\0asm');
}

// Version for WASM module
function version(): ByteArray {
  return [0x01, 0x00, 0x00, 0x00];
}

