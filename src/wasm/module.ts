import { ByteArray } from "./encoding";
import { stringToBytes } from "./utils";

export function module(sections: ByteArray[][]) : ByteArray[] {
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

