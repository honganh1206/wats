export type Module = { main: Function };

// Compile bytes into WASM modules
export function loadMod(bytes: BufferSource): Module {
  const mod = new WebAssembly.Module(bytes);
  return new WebAssembly.Instance(mod).exports as Module;
}
