import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react-pdf', 'pdfjs-dist'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-vendor': ['react-pdf', 'pdfjs-dist'],
          'firebase-vendor': ['firebase/app', 'firebase/auth'],
          'ai-vendor': ['@google/generative-ai'],
        },
      },
    },
  },
  worker: {
    format: 'es',
  },
});
