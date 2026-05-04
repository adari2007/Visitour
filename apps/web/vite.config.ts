import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const allowedHosts = [
  'localhost',
  '127.0.0.1',
  '.up.railway.app',
  ...(process.env.RAILWAY_PUBLIC_DOMAIN ? [process.env.RAILWAY_PUBLIC_DOMAIN] : []),
];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    allowedHosts,
  },
  preview: {
    allowedHosts,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

