import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Helper para generar chunks por página
const pageChunk = (id: string) => {
  if (id.includes('/pages/')) {
    const match = id.split('/pages/')[1];
    if (match) {
      const name = match.split('.')[0];
      return `page-${name.toLowerCase()}`;
    }
  }
  return undefined;
};

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Eliminar warnings de desarrollo en producción
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  // Eliminamos console/debugger en producción (aplica al transform de esbuild - dependencias no swc)
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: true,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router-dom')) return 'router';
            if (id.includes('react-hot-toast')) return 'toast';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('@headlessui')) return 'headlessui';
            if (id.includes('stripe')) return 'stripe';
          }
          const page = pageChunk(id);
          if (page) return page;
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
    },
    // Proxy para redirigir las peticiones de API al backend
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true,
        secure: process.env.NODE_ENV === 'production', // true en producción, false en desarrollo
        rewrite: (path) => path.replace(/^\/api/, '')
      }
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
