import { Byte, ByteArray } from "./encoding";
import { code, codesec, export_, exportdesc, exportsec, func, funcsec, functype, import_, importdesc, importsec, limits, mem, memsec, memtype, typeidx, typesec } from "./sections";
import { flatten, stringToBytes } from "./utils";

type FunctionDeclaration = {
  module: string,
  name: string,
  paramTypes: Byte[],
  resultType: number,
  locals: ByteArray[][],
  body: (number | ByteArray[])[]
}

export function buildModule(importDecls: FunctionDeclaration[], funcDecls: FunctionDeclaration[]): Uint8Array<ArrayBuffer> {
  const types = [...importDecls, ...funcDecls].map((f) =>
    functype(f.paramTypes, [f.resultType]),
  );
  // Map functions with indexes of different sections
  const funcs = funcDecls.map((_, i) => typeidx(i));
  const codes = funcDecls.map((f) => code(func(f.locals, f.body)));
  const imports = importDecls.map((f, i) =>
    import_(f.module, f.name, importdesc.func(i)));
  const exports = funcDecls.map((f, i) =>
    // Make space for imported functions with very first indexes
    export_(f.name, exportdesc.func(i + importDecls.length)));

  // Include a memory section
  exports.push(export_('$watsMemory', exportdesc.mem(0)));
  const mod = module([
    // Type section with one entry of a function
    // with no arguments and return value
    typesec(types),
    importsec(imports),
    funcsec(funcs),
    memsec([mem(memtype(limits.min(1)))]),
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

