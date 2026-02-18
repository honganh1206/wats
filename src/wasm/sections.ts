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

export function codes(func: ByteArray[]): ByteArray[] {
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

const funcidx = (x: number) => u32(x);

export const exportdesc = {
  func(idx: number): ByteArray[] {
    // One byte 0x00 indicating the export type
    // and the index to the element to export
    return [0x00, funcidx(idx)];
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

// A name is encoded as a vector of bytes
// containing UTF-8 character sequence
function name(s: string): ByteArray {
  return vec(stringToBytes(s));
}
