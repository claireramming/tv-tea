import path from 'path';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import EnvironmentPlugin from 'vite-plugin-environment';

// process.env.VITE_PROXY can be used to overide the default proxyEndpoint
// in some configuration, http://127.0.0.1 might be needed to make the app work.
const proxyEndpoint = process.env.VITE_PROXY || 'http://localhost:3000/';

// https://vite.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env,
  },
  build: {
    target: ['esnext'],
    outDir: path.resolve(__dirname, '../backend/static/tv-tracker/'),

    lib: {
      entry: path.resolve(__dirname, 'src/main.tsx'),
      formats: ['es'],
      name: 'tv-tracker',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'tv-tracker.es.js',
      },
    },
    sourcemap: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    EnvironmentPlugin({
      TMDB_API_KEY: '',
    }),
  ],
  server: {
    proxy: {
      'index': proxyEndpoint,
      '/logout': proxyEndpoint,
      '/login': proxyEndpoint,
    },
    port: 3090,
  },
})
