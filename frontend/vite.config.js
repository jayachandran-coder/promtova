import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Manual chunk splitting for faster initial load
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-charts': ['recharts'],
          'vendor-ui': ['lucide-react'],
          'vendor-helmet': ['react-helmet-async'],
        }
      }
    },
    // Target modern browsers for smaller bundles
    target: 'es2015',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  }
})
