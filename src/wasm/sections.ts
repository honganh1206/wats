import { Byte, ByteArray, u32, vec } from "./encoding";
import { flatten, stringToBytes } from "./utils";

const SECTION_ID_TYPE = 1;

export function typesec(functypes: ByteArray[][]): ByteArray[] {
  // NOTE: vec() still accepts ByteArray[][]
  // since ByteArray is recursive
  // and ByteArray[] can hold elements that are ByteArray[] 
  // so ByteArray[][], an array of ByteArray[], is assignable to ByteArray[]
  return section(SECTION_ID_TYPE, vec(functypes));
}

const SECTION_ID_FUNCTION = 3;

// A LEB128-encoded u32 value
export const typeidx = (x: number) => u32(x);

// Declare all functions contained in the module
export function funcsec(typeidxs: ByteArray[]): ByteArray[] {
  return section(SECTION_ID_FUNCTION, vec(typeidxs));
}

export function functype(paramTypes: Byte[], resultTypes: Byte[]): ByteArray[] {
  return [0x60, vec(paramTypes), vec(resultTypes)]
}

const SECTION_ID_CODE = 10;

export function codesec(codes: ByteArray[][]): ByteArray[] {
  return section(SECTION_ID_CODE, vec(codes));
}

export function code(func: ByteArray[]): ByteArray[] {
  const sizeInBytes = flatten(func).length;
  return [u32(sizeInBytes), func];
}

export function func(locals: ByteArray[][], body: ByteArray[]): ByteArray[] {
  // NOTE: We vectorize locals
  // since we need a label to specify how many locals we have
  // e.g., [[2], [0x7F, 0x7F]] representing 2 local variables
  return [vec(locals), body];
}

function section(id: Byte, contents: ByteArray[]): ByteArray[] {
  const sizeInBytes = flatten(contents).length;
  return [id, u32(sizeInBytes), contents];
}

const SECTION_ID_EXPORT = 7;

export const funcidx = (x: number) => u32(x);

export const exportdesc = {
  func(idx: number): ByteArray[] {
    // One byte 0x00 indicating the export type
    // and the index to the element to export
    return [0x00, funcidx(idx)];
  },
  mem(idx: number): ByteArray[] {
    // Give an export description for a memory of a given index
    return [0x02, memidx(idx)];
  }
}

export function exportsec(exports: ByteArray[][]): ByteArray[] {
  // Param is a vector of export entries
  return section(SECTION_ID_EXPORT, vec(exports));
}

// An export entry
export function export_(nm: string, exportdesc: ByteArray[]): ByteArray[] {
  return [name(nm), exportdesc]
}

// mod: name, nm: name, d:importdesc
export function import_(mod: string, nm: string, importdesc: ByteArray[]): ByteArray[] {
  return [name(mod), name(nm), importdesc];
}

const SECTION_ID_IMPORT = 2;

// im*:vec(import)
export function importsec(ims: ByteArray[]): ByteArray[] {
  return section(SECTION_ID_IMPORT, vec(ims));
}

export const importdesc = {
  // x: typeidx
  func(idx: number): ByteArray[] {
    // One byte indicating kind of import (function)
    // and index to the type section
    return [0x00, typeidx(idx)];
  },
}

export const localidx = (x: number) => u32(x);
export function locals(n: number, type: Byte): ByteArray[] {
  return [u32(n), type];
}

const SECTION_ID_MEMORY = 5;

export const memidx = (x: number) => u32(x);

export function memsec(mems: ByteArray[][]): ByteArray[] {
  return section(SECTION_ID_MEMORY, vec(mems));
}

export function mem(memtype: ByteArray[]): ByteArray[] {
  return memtype;
}

export function memtype(limits: ByteArray[]): ByteArray[] {
  return limits;
}

// Tell WASM to use alignment and static offset when interacting with memory
// to calculate the final address of the value on the stack?
export function memarg(align: number, offset: number): ByteArray[] {
  // align param is a power-of-two exponent
  // align = 0 -> Cannot promise addresses are nicely aligned
  return [u32(align), u32(offset)];
}

export const limits = {
  // n: u32
  // Memory grows to any size (measured in pages)
  min(n: number) {
    return [0x00, u32(n)];
  },
  minmax(n: number, m: number) {
    return [0x01, u32(n), u32(m)];
  },
}

// A name is encoded as a vector of bytes
// containing UTF-8 character sequence
function name(s: string): ByteArray {
  return vec(stringToBytes(s));
}

