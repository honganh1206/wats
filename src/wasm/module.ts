import { ByteArray } from "./encoding";
import { flatten } from "./utils";
import { codesec, func, funcsec, functype, instr, typeidx, typesec, codes } from "./sections";

export function compile(code: string) : Uint8Array<ArrayBuffer> {
  // TODO: What is ArrayBuffer?
  if (code !== '') {
    throw new Error(`Expected empty code, got: "${code}"`);
  }

  const mod = [
    magic(),
    version(),
    typesec([functype([], [])]),
    funcsec([typeidx(0)]),
    codesec([codes(func([], [instr.end]))]),
  ];

  return Uint8Array.from(flatten(mod));
}

// Each WASM module has a magic number
function magic() : ByteArray {
  // [0x00, 0x61, 0x73, 0x6d]
  return stringToBytes('\0asm');
}

// Version for WASM module
function version() : ByteArray {
  return [0x01, 0x00, 0x00, 0x00];
}

function stringToBytes(s: string) : ByteArray {
  const bytes = new TextEncoder().encode(s);
  return Array.from(bytes);
}
