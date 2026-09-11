import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward API and static asset requests to the FastAPI backend
      '/predict': { target: 'http://localhost:8000', changeOrigin: true },
      '/health':  { target: 'http://localhost:8000', changeOrigin: true },
      '/static':  { target: 'http://localhost:8000', changeOrigin: true },
      '/cases':   { target: 'http://localhost:8000', changeOrigin: true },
      '/stats':   { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
