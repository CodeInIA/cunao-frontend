import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import type { Product } from '../types';
import { useSmartNavigation } from '../hooks/useSmartNavigation';

export const ProductsPage: React.FC = () => {
  const { products, loadingState, error, fetchProducts, searchProducts } = useProductStore();
  const { addItem } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { navigateTo } = useSmartNavigation();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
    if (query) {
      searchProducts(query);
    } else {
      fetchProducts();
    }
  }, [location.search, fetchProducts, searchProducts]);

  const handleAddToCart = (product: Product) => {
    const cartItem = {
      productId: product.id,
      variantId: 1,
      quantity: 1,
      title: product.title,
      price: 19.99,
      image: product.images[0]?.src || '',
      size: 'M',
      color: 'Negro'
    };
    
    addItem(cartItem);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigateTo('/productos');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-patriot font-bold text-white mb-4">
            Productos Cuñao
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Descubre nuestra colección completa de camisetas con las frases más auténticas del cuñadismo español
          </p>
        </div>

        {/* Búsqueda y filtros */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Barra de búsqueda */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar frases cuñao..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700/80 border border-slate-600 text-white placeholder-slate-400 rounded-lg transition-colors duration-200 focus:outline-none focus:border-spanish-yellow focus:placeholder-slate-300"
                />
              </div>
            </form>

            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              <SlidersHorizontal size={20} />
              Filtros
            </button>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="mt-4 p-4 bg-slate-800 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Categoría
                  </label>
                  <select className="w-full p-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:ring-2 focus:ring-spanish-yellow">
                    <option>Todas las categorías</option>
                    <option>Clásicos cuñao</option>
                    <option>Política</option>
                    <option>Fútbol</option>
                    <option>Nostalgia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Precio
                  </label>
                  <select className="w-full p-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:ring-2 focus:ring-spanish-yellow">
                    <option>Todos los precios</option>
                    <option>Menos de 35€</option>
                    <option>35€ - 50€</option>
                    <option>Más de 50€</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ordenar por
                  </label>
                  <select className="w-full p-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:ring-2 focus:ring-spanish-yellow">
                    <option>Más populares</option>
                    <option>Precio: menor a mayor</option>
                    <option>Precio: mayor a menor</option>
                    <option>Más recientes</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Estado de carga */}
        {loadingState === 'loading' && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spanish-red mx-auto mb-4"></div>
            <p className="text-slate-300">Cargando productos cuñao...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-6 py-2 bg-spanish-red text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Grid de productos */}
        {loadingState === 'success' && (
          <>
            {products.length > 0 ? (
              <>
                <div className="text-sm text-gray-600 mb-4">
                  Mostrando {products.length} productos
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg mb-4">
                  No se encontraron productos
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      window.history.replaceState({}, '', '/productos');
                      fetchProducts();
                    }}
                    className="px-4 py-2 border border-spanish-red text-spanish-red hover:bg-spanish-red hover:text-white transition-colors rounded-lg"
                  >
                    Ver todos los productos
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Información adicional */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-patriot font-bold text-white mb-4">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-slate-300 mb-6">
            Tenemos una amplia variedad de frases cuñao. Si no encuentras la tuya, ¡contáctanos!
          </p>
          <button 
            className="px-6 py-3 bg-spanish-red text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
            onClick={() => navigateTo('/contacto')}
          >
            Contactar con nosotros
          </button>
        </div>
      </div>
    </div>
  );
};

