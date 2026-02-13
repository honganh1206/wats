export function stringToBytes(s: string) {
  const bytes = new TextEncoder().encode(s);
  return Array.from(bytes);
}
