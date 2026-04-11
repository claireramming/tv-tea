import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import EnvironmentPlugin from 'vite-plugin-environment';

// https://vite.dev/config/
export default defineConfig({
  define: {
    'process.env': process.env
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  build: {
    target: ['esnext'],
    outDir: path.resolve(__dirname, './dist/'),
    sourcemap: true
  },
  plugins: [
    react(),
    tailwindcss(),
    EnvironmentPlugin({
      TMDB_API_KEY: '',
      API_URL: '',
    })
  ],
  server: {
    port: 3090
  }
});
