import { compile } from '$wats/compiler/compile';
import { loadMod } from '$wats/runtime/loader';

const BUILTIN_FUNCTIONS = `extern funk add(a, b);
extern funk one();
extern funk print(x);
`;

export type RunResult =
  | { ok: true; result: unknown; logs: string[] }
  | { ok: false; stage: 'compile' | 'instantiate' | 'execute'; error: string };

export function runWats(src: string): RunResult {
  const logs: string[] = [];
  const imports: WebAssembly.Imports = {
    watsImports: {
      add: (a: number, b: number) => a + b,
      one: () => 1,
      print: (x: number) => {
        logs.push(String(x));
        return x;
      },
    },
  };

  let bytes: Uint8Array;
  try {
    bytes = compile(BUILTIN_FUNCTIONS + src);
  } catch (e: any) {
    return { ok: false, stage: 'compile', error: e?.message ?? String(e) };
  }

  let exports: WebAssembly.Exports;
  try {
    exports = loadMod(bytes, imports);
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
    return { ok: true, result: main(0), logs };
  } catch (e: any) {
    return { ok: false, stage: 'execute', error: e?.message ?? String(e) };
  }
}

