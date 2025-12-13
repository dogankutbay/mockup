import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow access from network
    port: 5173,
  },
  build: {
    // Remove console logs in production
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger'], // Remove console.log, console.warn, etc. in production
    },
  },
})
