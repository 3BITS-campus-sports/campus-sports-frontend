import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// KAN-41: Configurare proxy Vite catre serverul backend Express (port 5000)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
