import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      // Allow Vite to serve files from the parent compiler package (../src)
      allow: [fileURLToPath(new URL('..', import.meta.url))]
    }
  }
});
