import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Crown, Zap, TrendingUp, Award, Users, Clock, ArrowRight, Search } from 'lucide-react';
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { FeaturedProductCard } from '../components/FeaturedProductCard';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import type { Product } from '../types';

export const FeaturedPage: React.FC = () => {
  const { featuredProducts, fetchFeaturedProducts, products, fetchProducts, loadingState } = useProductStore();
  const { addItem } = useCartStore();
  const { navigateTo } = useSmartNavigation();

  useEffect(() => {
    fetchFeaturedProducts();
    fetchProducts();
  }, [fetchFeaturedProducts, fetchProducts]);

  const handleAddToCart = (product: Product) => {
    // Obtener el precio real del producto
    const enabledVariants = (product.variants || []).filter(v => v?.is_enabled && v?.is_available !== false);
    const minPrice = enabledVariants.length > 0 
      ? Math.min(...enabledVariants.map(v => v.price).filter(p => typeof p === 'number'))
      : 1999; // fallback en centavos
    
    // Obtener las opciones reales del producto
    const enabledOptionIds = new Set(enabledVariants.flatMap(v => v.options));
    const colorOptions = product.options?.find(o => o.type === 'color')?.values.filter(val => enabledOptionIds.has(val.id)) || [];
    const sizeOptions = product.options?.find(o => o.type === 'size')?.values.filter(val => enabledOptionIds.has(val.id)) || [];
    
    // Intentar encontrar la variante que corresponde a la imagen mostrada
    const defaultImage = product.images?.[0];
    let selectedVariant = enabledVariants[0];
    let selectedColor = colorOptions[0]?.title || 'Negro';
    let selectedSize = sizeOptions[0]?.title || 'M';
    
    // Si la imagen tiene variant_ids, usar esa variante
    if (defaultImage?.variant_ids && defaultImage.variant_ids.length > 0) {
      const imageVariantId = defaultImage.variant_ids[0];
      const imageVariant = enabledVariants.find(v => v.id === imageVariantId);
      if (imageVariant) {
        selectedVariant = imageVariant;
        
        // Encontrar el color de esta variante específica
        const variantColorOptionId = imageVariant.options.find(optId => 
          colorOptions.some(colorOpt => colorOpt.id === optId)
        );
        if (variantColorOptionId) {
          const variantColor = colorOptions.find(c => c.id === variantColorOptionId);
          if (variantColor) {
            selectedColor = variantColor.title;
          }
        }
        
        // Encontrar la talla de esta variante específica
        const variantSizeOptionId = imageVariant.options.find(optId => 
          sizeOptions.some(sizeOpt => sizeOpt.id === optId)
        );
        if (variantSizeOptionId) {
          const variantSize = sizeOptions.find(s => s.id === variantSizeOptionId);
          if (variantSize) {
            selectedSize = variantSize.title;
          }
        }
      }
    }
    
    const cartItem = {
      productId: product.id,
      variantId: selectedVariant.id,
      quantity: 1,
      title: product.title,
      price: minPrice / 100, // Convertir de centavos a euros
      image: product.images[0] ? getOptimizedImageUrl(product.images[0]) : '',
      size: selectedSize,
      color: selectedColor
    };
    
    addItem(cartItem);
  };

  const cuñaoStats = [
  { icon: Users, label: 'Clientes', value: '2', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { icon: TrendingUp, label: 'Pedidos entregados', value: '3', color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: Award, label: 'Diseños originales', value: '5', color: 'text-spanish-yellow', bg: 'bg-spanish-yellow/10' },
    { icon: Clock, label: 'Abierta desde', value: '2025', color: 'text-spanish-red', bg: 'bg-spanish-red/10' }
  ];

  const topPhrases = [
    {
      phrase: "En mis tiempos esto no pasaba",
      popularity: "95%",
      sales: 342,
      badge: "🔥 TENDENCIA"
    },
    {
      phrase: "Yo tengo un cuñado que sabe de esto", 
      popularity: "92%",
      sales: 287,
      badge: "👑 CLÁSICO"
    },
    {
      phrase: "Con Franco estábamos mejor",
      popularity: "88%",
      sales: 256,
      badge: "⚡ POLÉMICO"
    },
    {
      phrase: "Los jóvenes de ahora no saben trabajar",
      popularity: "85%",
      sales: 198,
      badge: "💎 PREMIUM"
    }
  ];

  const highlightedProducts = useMemo(() => {
    const cats = ['destacado', 'popular', 'clásico', 'tendencia'];
    return cats.map(cat => {
      const matches = (products || []).filter(p => (p.tags || []).map(t => String(t).toLowerCase()).includes(cat));
      if (matches.length > 0) {
        matches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return matches[0];
      }
      const fb = (featuredProducts || []).find(p => (p.tags || []).map(t => String(t).toLowerCase()).includes(cat));
      return fb || null;
    });
  }, [products, featuredProducts]);

  return (
    <div className="bg-slate-900">

  {/* Productos Destacados Premium (moved to top) */}
  <section className="min-h-[calc(100vh-72px)] pt-6 pb-0 mb-0 bg-slate-900">
    <div className="container mx-auto px-4 pt-6">
          <div className="text-center mb-10">
            <h2 className="text-4xl md:text-5xl font-patriot font-bold text-white mb-4">
              Productos <span className="text-spanish-yellow">Destacados</span>
            </h2>
            <p className="text-white font-medium max-w-3xl mx-auto text-lg drop-shadow-sm">
              Las camisetas más auténticas del cuñadismo español.
              <br />
              <span className="text-spanish-yellow font-semibold">¡Las que todo el mundo quiere!</span>
            </p>
          </div>

            {loadingState === 'loading' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-max mb-0">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="relative">
                    <div className="bg-slate-700 animate-pulse rounded-xl">
                      <div className="absolute -top-3 -right-3 w-12 h-6 bg-slate-600 rounded-full"></div>
                      <div className={`bg-slate-600 rounded-t-xl mb-4 ${index % 3 === 0 ? 'h-64' : index % 3 === 1 ? 'h-56' : 'h-72'}`}></div>
                      <div className="p-4 space-y-3 pb-6">
                        <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-600 rounded w-1/2"></div>
                        <div className="h-8 bg-slate-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 auto-rows-max mb-0">
                {highlightedProducts.map((product, index) => (
                  product ? (
                    <FeaturedProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      featured={true}
                    />
                  ) : (
                    <div key={`empty-${index}`} className="bg-slate-800 rounded-xl p-6 flex items-center justify-center text-slate-400">
                      Sin producto
                    </div>
                  )
                ))}
              </div>
            ) : (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🤔</div>
              <h3 className="text-2xl font-bold text-white mb-4">
                ¡Vaya! Parece que los productos destacados están de vacaciones
              </h3>
              <p className="text-white text-lg mb-8 font-medium">
                Pero no te preocupes, seguro que en el bar de tu pueblo sí hay opiniones disponibles...
              </p>
                <button
                  className="inline-flex items-center gap-2 bg-spanish-red text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  onClick={() => navigateTo('/productos')}
                >
                  Ver Todos los Productos
                  <ArrowRight size={20} />
                </button>
            </div>
          )}
        </div>
      </section>

      {/* Panel CTA: no encuentro mi artículo (más ancho y horizontal) */}
  <section className="pt-0 pb-6 mt-10">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-6xl mx-auto bg-transparent rounded-2xl border border-white/10 py-4 px-6 flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3 w-full md:w-auto">
              <Search className="w-6 h-6 text-spanish-yellow mt-1" />
              <div className="text-left">
                <h3 className="text-xl font-semibold text-white leading-tight">¿No encuentras lo que buscas?</h3>
                <p className="text-slate-300 text-sm">Explora todo nuestro catálogo o pídenos ayuda personalizada. Tenemos miles de diseños.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 justify-start md:justify-end mt-3 md:mt-0">
              <button
                className="w-full md:w-auto inline-flex justify-center items-center gap-2 bg-spanish-yellow text-slate-900 px-5 py-2 rounded-md font-semibold hover:brightness-95 transition-colors duration-200"
                onClick={() => navigateTo('/productos')}
              >
                Ver catálogo
                <ArrowRight size={16} />
              </button>

              <button
                className="w-full md:w-auto inline-flex justify-center items-center gap-2 bg-transparent border border-white/20 text-white px-4 py-2 rounded-md font-medium hover:bg-white/5 transition-colors duration-200"
                onClick={() => navigateTo('/contacto')}
              >
                Pedir ayuda
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas Impresionantes */}
      <section className="py-4 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {cuñaoStats.map((stat, index) => (
              <div key={index} className={`rounded-xl p-5 ${stat.bg} flex flex-col items-center justify-center text-center`}> 
                <div className="group bg-slate-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-200 transform hover:scale-105 hover:bg-spanish-red">
                  <stat.icon className={`w-5 h-5 ${stat.color} group-hover:text-white`} />
                </div>
                <div className={`text-2xl md:text-3xl font-bold ${stat.color} leading-tight`}>{stat.value}</div>
                <p className="text-white text-sm font-semibold mt-1 drop-shadow-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

  {/* Top Frases del Mes */}
  <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900 mt-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-patriot font-bold text-white mb-4">
              📈 Frases Más Populares del Mes
            </h2>
            <p className="text-white font-medium max-w-2xl mx-auto drop-shadow-sm">
              Las opiniones que más están triunfando en tertulias y reuniones familiares
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {topPhrases.map((item, index) => (
              <div key={index} className="relative group">
                <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-6 hover:border-spanish-yellow transition-all duration-300 transform hover:scale-105">
                  {/* Posición */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-spanish-red text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    #{index + 1}
                  </div>

                  {/* Badge */}
                  <div className="text-right mb-4">
                    <span className="bg-spanish-yellow text-slate-900 px-3 py-1 rounded-full text-sm font-bold">
                      {item.badge}
                    </span>
                  </div>

                  {/* Frase */}
                  <blockquote className="text-xl font-semibold text-white mb-6 italic text-center">
                    "{item.phrase}"
                  </blockquote>

                  {/* Estadísticas centradas */}
                  <div className="flex justify-center items-center gap-8">
                    <div className="text-spanish-yellow text-center">
                      <span className="text-2xl font-bold">{item.popularity}</span>
                      <span className="block text-xs text-white font-medium drop-shadow-sm">Popularidad</span>
                    </div>
                    <div className="text-spanish-red text-center">
                      <span className="text-2xl font-bold">{item.sales}</span>
                      <span className="block text-xs text-white font-medium drop-shadow-sm">Ventas</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final Impactante */}
      <section className="py-20 bg-[url('/bar-image.webp')] bg-cover bg-center text-center relative">
        <div className="container mx-auto px-4 relative">
            <div className="max-w-4xl mx-auto relative z-10">
              <div className="absolute -top-6 -left-6 -right-6 bottom-0 bg-black/60 pointer-events-none rounded-xl z-0" style={{backdropFilter: 'blur(2px)'}}></div>
              <h2 className="text-4xl md:text-5xl font-patriot font-bold text-white mb-6 relative z-10">
                ¿Preparado para ser la Estrella del Bar?
              </h2>
              <p className="text-xl text-white font-bold mb-8 drop-shadow-sm relative z-10">
                Las camisetas más populares de la colección
              </p>
            
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <button
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 text-lg font-bold rounded-lg shadow-xl transition-colors duration-300 inline-flex items-center gap-2 relative"
                  onClick={() => navigateTo('/productos')}
                >
                  <Star className="w-5 h-5" />
                  Ver Todos los Productos
                </button>
              
                <button
                  className="border-2 border-white text-white bg-white/10 hover:bg-white/20 px-8 py-4 text-lg font-bold rounded-lg transition-all duration-300 inline-flex items-center gap-2 relative"
                  onClick={() => navigateTo('/contacto')}
                >
                  Solicitar Diseño Personalizado
                </button>
            </div>

            {/* Testimonios rápidos */}
            <div className="max-w-4xl mx-auto relative z-10">
              <div className="absolute -left-6 -right-6 top-0 bottom-0 bg-black/40 rounded-xl pointer-events-none" style={{backdropFilter: 'blur(2px)'}}></div>
              <div className="relative z-10 p-6 px-8">
                <p className="text-white italic text-lg font-semibold drop-shadow-sm">
                  "Desde que llevo estas camisetas, soy el rey de la tertulia del bar. ¡Todo el mundo quiere saber dónde las compro!"
                </p>
                <p className="text-white font-bold mt-2 drop-shadow-sm">
                  - Paco, 52 años, Cuñado Profesional de Móstoles
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
