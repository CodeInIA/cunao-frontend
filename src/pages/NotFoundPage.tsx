
import React from 'react';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import { useProductStore } from '../stores/productStore';
import { ProductCard } from '../components/ProductCard';

export const NotFoundPage: React.FC = () => {
  const { navigateTo } = useSmartNavigation();
  const { products, loadingState, fetchProducts } = useProductStore();

  React.useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  // Selecciona 3 productos aleatorios para mostrar
  const randomProducts = React.useMemo(() => {
    if (products.length === 0) return [];
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [products]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12">
      <div className="text-center max-w-2xl w-full">
        {/* 404 grande y colorido */}
        <div className="mb-8">
          <h1 className="text-[8rem] font-patriot font-black text-spanish-red drop-shadow-lg leading-none">
            404
          </h1>
          <div className="h-2 w-32 mx-auto mt-4 rounded-full bg-gradient-to-r from-spanish-red via-spanish-yellow to-spanish-red"></div>
        </div>

        {/* Mensaje cuñao */}
        <h2 className="text-3xl md:text-4xl font-patriot font-bold text-white mb-4">
          ¡Página no encontrada!
        </h2>
        <p className="text-lg text-slate-300 mb-6">
          Parece que esta página se ha perdido por el camino...
        </p>

        <div className="bg-slate-800/80 border border-spanish-yellow rounded-xl p-6 mb-8 shadow">
          <p className="text-spanish-yellow font-patriot italic text-lg">
            "En mi pueblo las páginas no se pierden nunca"
          </p>
          <p className="text-spanish-yellow text-sm mt-2">
            - Tu cuñado favorito
          </p>
        </div>

        {/* Sugerencias */}
        <div className="bg-slate-800 rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">
            ¿Qué puedes hacer?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <Home className="w-8 h-8 text-spanish-yellow mx-auto mb-2" />
              <p className="font-medium text-white">Volver al inicio</p>
              <p className="text-slate-400">Navega desde la página principal</p>
            </div>
            <div className="text-center">
              <Search className="w-8 h-8 text-spanish-yellow mx-auto mb-2" />
              <p className="font-medium text-white">Buscar productos</p>
              <p className="text-slate-400">Encuentra tu camiseta cuñao</p>
            </div>
            <div className="text-center">
              <ArrowLeft className="w-8 h-8 text-spanish-yellow mx-auto mb-2" />
              <p className="font-medium text-white">Ir atrás</p>
              <p className="text-slate-400">Usa el botón atrás del navegador</p>
            </div>
          </div>
        </div>

        {/* Botones de acción con navegación inteligente */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            className="inline-flex items-center px-8 py-3 bg-spanish-red text-white font-semibold rounded-lg shadow hover:bg-spanish-yellow hover:text-slate-900 transition-colors"
            onClick={() => navigateTo('/')}
          >
            <Home className="w-5 h-5 mr-2" />
            Ir al Inicio
          </button>
          <button
            className="inline-flex items-center px-8 py-3 bg-slate-800 text-spanish-yellow border-2 border-spanish-yellow font-semibold rounded-lg shadow hover:bg-spanish-yellow hover:text-slate-900 transition-colors"
            onClick={() => navigateTo('/productos')}
          >
            <Search className="w-5 h-5 mr-2" />
            Ver Productos
          </button>
        </div>

        {/* Productos reales */}
        <div className="mt-2">
          <h3 className="text-xl font-semibold text-white mb-4">
            Mientras tanto, echa un vistazo a estos productos cuñao:
          </h3>
          {loadingState === 'loading' ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spanish-red mx-auto mb-4"></div>
              <p className="text-slate-400">Cargando productos...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {randomProducts.length > 0 ? (
                randomProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div className="col-span-3 text-center text-slate-400 py-8">
                  No hay productos disponibles
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
