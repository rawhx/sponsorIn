import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import inertia from '@inertiajs/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/js/app.jsx'],
      refresh: true,
    }),
    inertia({ ssr: false }),
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      // These are Node-only packages that Vite externalizes for the browser.
      // They exist only to satisfy the Vite toolchain on Linux and are not
      // needed at runtime in the browser bundle.
      external: ['fdir', 'fsevents', 'events'],
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5273,
    strictPort: true,
    cors: true,
    hmr: {
      host: 'localhost',
      port: 5273,
    },
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/vendor/**',
        '**/storage/**',
        '**/.git/**',
      ],
    },
  },
});
