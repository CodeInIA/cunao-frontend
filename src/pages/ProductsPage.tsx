import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useProductStore } from '../stores/productStore';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import type { Product } from '../types';
import { useSmartNavigation } from '../hooks/useSmartNavigation';

export const ProductsPage: React.FC = () => {
  const { products, loadingState, error, fetchProducts, searchProducts } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    sortBy: 'popular'
  });
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
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

  // Efecto para búsqueda en tiempo real
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim()) {
        searchProducts(searchQuery.trim());
        // Actualizar URL sin recargar la página
        const newUrl = `/productos?q=${encodeURIComponent(searchQuery.trim())}`;
        window.history.replaceState(null, '', newUrl);
      } else {
        fetchProducts();
        // Limpiar URL si no hay búsqueda
        window.history.replaceState(null, '', '/productos');
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, searchProducts, fetchProducts]);

  // Efecto para aplicar filtros
  useEffect(() => {
    let filtered = [...products];

    // Filtrar por categoría (usando tags)
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.tags?.some(tag => 
          tag.toLowerCase().includes(filters.category.toLowerCase())
        )
      );
    }

    // Filtrar por rango de precio
    if (filters.priceRange) {
      const minPrice = Math.min(...filtered.flatMap(p => 
        p.variants?.filter(v => v.is_enabled).map(v => v.price || 0) || [0]
      )) / 100;

      switch (filters.priceRange) {
        case 'under35':
          filtered = filtered.filter(product => {
            const prices = product.variants?.filter(v => v.is_enabled).map(v => (v.price || 0) / 100) || [];
            return Math.min(...prices) < 35;
          });
          break;
        case '35-50':
          filtered = filtered.filter(product => {
            const prices = product.variants?.filter(v => v.is_enabled).map(v => (v.price || 0) / 100) || [];
            const minPrice = Math.min(...prices);
            return minPrice >= 35 && minPrice <= 50;
          });
          break;
        case 'over50':
          filtered = filtered.filter(product => {
            const prices = product.variants?.filter(v => v.is_enabled).map(v => (v.price || 0) / 100) || [];
            return Math.min(...prices) > 50;
          });
          break;
      }
    }

    // Ordenar
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => {
          const priceA = Math.min(...(a.variants?.filter(v => v.is_enabled).map(v => v.price || 0) || [0]));
          const priceB = Math.min(...(b.variants?.filter(v => v.is_enabled).map(v => v.price || 0) || [0]));
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        filtered.sort((a, b) => {
          const priceA = Math.min(...(a.variants?.filter(v => v.is_enabled).map(v => v.price || 0) || [0]));
          const priceB = Math.min(...(b.variants?.filter(v => v.is_enabled).map(v => v.price || 0) || [0]));
          return priceB - priceA;
        });
        break;
      case 'newest':
        filtered.sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA;
        });
        break;
      case 'popular':
      default:
        // Mantener orden original (más populares)
        break;
    }

    setFilteredProducts(filtered);
  }, [products, filters]);

  const handleFilterChange = (filterType: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      priceRange: '',
      sortBy: 'popular'
    });
  };

  // Obtener categorías únicas de los tags
  const availableCategories = Array.from(
    new Set(
      products.flatMap(product => product.tags || [])
        .filter(tag => tag.length > 0)
    )
  ).sort();

  const displayedProducts = filteredProducts.length > 0 || Object.values(filters).some(f => f !== '' && f !== 'popular') 
    ? filteredProducts 
    : products;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Ya no necesitamos hacer nada aquí, la búsqueda es en tiempo real
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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
                  onChange={handleSearchInputChange}
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
                  <select 
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:ring-2 focus:ring-spanish-yellow"
                  >
                    <option value="">Todas las categorías</option>
                    {availableCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Precio
                  </label>
                  <select 
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:ring-2 focus:ring-spanish-yellow"
                  >
                    <option value="">Todos los precios</option>
                    <option value="under35">Menos de 35€</option>
                    <option value="35-50">35€ - 50€</option>
                    <option value="over50">Más de 50€</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ordenar por
                  </label>
                  <select 
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 text-white rounded-md focus:ring-2 focus:ring-spanish-yellow"
                  >
                    <option value="popular">Más populares</option>
                    <option value="price-asc">Precio: menor a mayor</option>
                    <option value="price-desc">Precio: mayor a menor</option>
                    <option value="newest">Más recientes</option>
                  </select>
                </div>
              </div>
              {/* Botón para limpiar filtros */}
              {(filters.category || filters.priceRange || filters.sortBy !== 'popular') && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-sm bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
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
              onClick={() => fetchProducts()}
              className="px-6 py-2 bg-spanish-red text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Grid de productos */}
        {loadingState === 'success' && (
          <>
            {displayedProducts.length > 0 ? (
              <>
                <div className="text-sm text-slate-400 mb-4 flex items-center justify-between">
                  <span>
                    Mostrando {displayedProducts.length} de {products.length} productos
                  </span>
                  {(filters.category || filters.priceRange || filters.sortBy !== 'popular') && (
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">
                      Filtros aplicados
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {displayedProducts.map((product) => (
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
                  {searchQuery 
                    ? `No se encontraron productos para "${searchQuery}"`
                    : "No se encontraron productos con los filtros aplicados"
                  }
                </p>
                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      window.history.replaceState({}, '', '/productos');
                      fetchProducts();
                    }}
                    className="px-4 py-2 border border-spanish-red text-spanish-red hover:bg-spanish-red hover:text-white transition-colors rounded-lg mr-2"
                  >
                    Ver todos los productos
                  </button>
                ) : (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 border border-spanish-red text-spanish-red hover:bg-spanish-red hover:text-white transition-colors rounded-lg"
                  >
                    Limpiar filtros
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

