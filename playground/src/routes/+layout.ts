// Static SPA: prerender the shell, no SSR so the compiler/WebAssembly only
// run in the browser.
export const prerender = true;
export const ssr = false;
