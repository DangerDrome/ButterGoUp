import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'trading-charts': ['lightweight-charts'],
          'react-vendor': ['react', 'react-dom'],
          'utils': ['zustand', 'lucide-react']
        }
      }
    }
  },
  base: '/'
})