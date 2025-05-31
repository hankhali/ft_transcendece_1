import { defineConfig } from 'vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  server: {
    host: '0.0.0.0',
    cors: true,
    allowedHosts: ['5176-iq9tmrflwz2r5v1vhgrcn-fc69a50f.manusvm.computer', 'all'],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
