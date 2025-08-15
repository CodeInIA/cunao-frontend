import React, { useEffect, useState } from 'react';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import type { Product } from '../types';

export const ProductsPage: React.FC = () => {
  const { products, loadingState, error, fetchProducts, searchProducts } = useProductStore();
  const { addItem } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
      searchProducts(searchQuery);
    } else {
      fetchProducts();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            Productos vikingo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra colección completa de camisetas con las frases más auténticas del cuñadismo español
          </p>
        </div>

        {/* Búsqueda y filtros */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Barra de búsqueda */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar frases vikingo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-viking-500 focus:border-transparent"
                />
              </div>
            </form>

            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={20} />
              Filtros
            </button>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>Todas las categorías</option>
                    <option>Clásicos vikingo</option>
                    <option>Política</option>
                    <option>Fútbol</option>
                    <option>Nostalgia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option>Todos los precios</option>
                    <option>Menos de 20€</option>
                    <option>20€ - 30€</option>
                    <option>Más de 30€</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
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
            <div className="viking-loader mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos vikingo...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="btn-primary"
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
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">
                  No se encontraron productos
                </p>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      fetchProducts();
                    }}
                    className="btn-outline"
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
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
            ¿No encuentras lo que buscas?
          </h2>
          <p className="text-gray-600 mb-6">
            Tenemos una amplia variedad de frases vikingo. Si no encuentras la tuya, ¡contáctanos!
          </p>
          <button className="btn-primary">
            Contactar con nosotros
          </button>
        </div>
      </div>
    </div>
  );
};

