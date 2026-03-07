import { Byte, ByteArray, i32 } from "./encoding";
import { instr, locals, valtype } from "./instructions";
import { code, codesec, export_, exportdesc, exportsec, func, funcsec, functype, typeidx, typesec } from "./sections";
import { flatten, stringToBytes } from "./utils";

type FunctionDeclaration = {
  name: string,
  paramTypes: Byte[],
  resultType: number,
  locals: ByteArray[][],
  body: (number | ByteArray[])[]
}

export function buildModule(funcDecls: FunctionDeclaration[]): Uint8Array<ArrayBuffer> {
  const types = funcDecls.map((f) =>
    functype(f.paramTypes, [f.resultType]),
  );
  // Type declaration for each function
  // assuming all functions share the same type signature
  const funcs = funcDecls.map(() => typeidx(0));
  const codes = funcDecls.map((f) => code(func(f.locals, f.body)));
  const exports = funcDecls.map((f, i) =>
    export_(f.name, exportdesc.func(i)));

  const mod = module([
    // Type section with one entry of a function
    // with no arguments and return value
    typesec(types),
    funcsec(funcs),
    // Export the function at index 0 under the name 'main'
    exportsec(exports),
    // Produce the body of the main function
    codesec(codes),
  ]);

  return Uint8Array.from(flatten(mod));

}

function module(sections: ByteArray[][]): ByteArray[] {
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

