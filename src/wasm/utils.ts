import { Byte, ByteArray } from "./encoding";

export function flatten(arr: ByteArray[]) : Byte[] {
  const result: Byte[] = [];
  for (const el of arr) {
    if (Array.isArray(el)) {
      result.push(...flatten(el));
    } else {
      result.push(el);
    }
  }
  return result;
}
