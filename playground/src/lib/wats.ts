import { compile } from '$wats/compiler/compile';
import { loadMod } from '$wats/runtime/loader';

export type RunResult =
  | { ok: true; result: unknown }
  | { ok: false; stage: 'compile' | 'instantiate' | 'execute'; error: string };

export function runWats(src: string): RunResult {
  let bytes: Uint8Array;
  try {
    bytes = compile(src);
  } catch (e: any) {
    return { ok: false, stage: 'compile', error: e?.message ?? String(e) };
  }

  let exports: WebAssembly.Exports;
  try {
    exports = loadMod(bytes);
  } catch (e: any) {
    return { ok: false, stage: 'instantiate', error: e?.message ?? String(e) };
  }

  const main = exports.main as ((arg: number) => unknown) | undefined;
  if (typeof main !== 'function') {
    return {
      ok: false,
      stage: 'execute',
      error: 'No exported `main` function found in compiled module.'
    };
  }

  try {
    return { ok: true, result: main(0) };
  } catch (e: any) {
    return { ok: false, stage: 'execute', error: e?.message ?? String(e) };
  }
}
