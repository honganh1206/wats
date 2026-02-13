import { stringToBytes } from "./encoding";

export function compileWats(code: string) {
  if (code !== '') {
    throw new Error(`Expected empty code, got: "${code}"`);
  }
  return Uint8Array.from([0, 97, 115, 109, 1, 0, 0, 0]);
}

function magic() {
  // [0x00, 0x61, 0x73, 0x6d]
  return stringToBytes('\0asm');
}

function version() {
  return [0x01, 0x00, 0x00, 0x00];
}
