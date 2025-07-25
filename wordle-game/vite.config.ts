import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false,
    hmr: {
      overlay: true,
      clientPort: 5173
    },
    watch: {
      usePolling: true,
      interval: 100
    }
  }
}) 