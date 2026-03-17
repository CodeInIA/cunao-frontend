import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

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
  plugins: [tailwindcss(), react()],
  define: {
    // Eliminar warnings de desarrollo en producción
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  // Configuramos la eliminación de console/debugger para el nuevo minificador de Vite 8
  build: {
    outDir: 'dist',
    sourcemap: false,
    cssCodeSplit: true,
    target: 'es2020',
    rolldownOptions: {
      output: {
        minify: {
          compress: {
            dropConsole: process.env.NODE_ENV === 'production',
            dropDebugger: process.env.NODE_ENV === 'production',
          },
        },
      },
    },
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
        secure: process.env.NODE_ENV === 'production' // true en producción, false en desarrollo
        // Nota: no reescribimos el path para mantener el prefijo /api y que las rutas en el backend coincidan.
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
