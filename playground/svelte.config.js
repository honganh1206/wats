import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// When deploying to GitHub Pages under a project subpath (e.g. `/wats`),
// set BASE_PATH=/wats before running `npm run build`.
const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: 'index.html'
    }),
    paths: {
      base
    },
    alias: {
      $wats: '../src',
      '$wats/*': '../src/*'
    }
  }
};

export default config;
