// Compile bytes into WASM modules
export function loadMod(bytes: BufferSource, imports: WebAssembly.Imports): WebAssembly.Exports {
  const mod = new WebAssembly.Module(bytes);
  return new WebAssembly.Instance(mod, imports).exports;
}
