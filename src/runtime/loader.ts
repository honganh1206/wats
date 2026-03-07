// Compile bytes into WASM modules
export function loadMod(bytes: BufferSource): Function {
  const mod = new WebAssembly.Module(bytes);
  return new WebAssembly.Instance(mod).exports as Function;
}
