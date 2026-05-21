# wats playground

A minimal SvelteKit web UI for trying out the [wats](../) compiler in the
browser. Everything (parsing, compilation to WebAssembly, and execution) runs
client-side — there is no backend.

## Develop

```sh
cd playground
npm install
npm run dev
```

Then open the printed URL (typically <http://localhost:5173>).

## Build a static site

```sh
npm run build
```

The build is produced in `playground/build/` using `@sveltejs/adapter-static`
and can be deployed to any static host (GitHub Pages, Vercel, Netlify, …).

Use `npm run preview` to serve the built site locally.

## Notes

- The playground imports the compiler directly from the parent package's
  `src/` directory via the `$wats` alias declared in
  [`svelte.config.js`](./svelte.config.js).
- The textarea contents are persisted to `localStorage` between reloads.
- Press <kbd>Ctrl/Cmd + Enter</kbd> to run.
