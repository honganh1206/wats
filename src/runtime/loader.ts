
// Compile bytes into WASM modules
export function loadMod(bytes: BufferSource): WebAssembly.Exports {
  const mod = new WebAssembly.Module(bytes);
  return new WebAssembly.Instance(mod).exports;
}
