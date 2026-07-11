import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite dev-server proxies /api/* to the Spring Boot backend so the
// browser sees same-origin requests and we sidestep CORS entirely.
// In production build, VITE_API_BASE_URL is set to '' and requests
// are routed by a reverse proxy (or, in this project, simply hits the
// backend directly when used as a PWA/Capacitor build).
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
