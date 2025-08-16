import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Eliminar warnings de desarrollo en producción
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'react-hot-toast']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    // Configuración para evitar algunos warnings de extensiones
    hmr: {
      overlay: true
    }
  },
  preview: {
    port: 5173,
    host: true
  },
  // Optimización para dependencias
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'react-hot-toast']
  }
})
