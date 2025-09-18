import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, Heart } from 'lucide-react';
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { FeaturedProductCard } from '../components/FeaturedProductCard';
import ProductsCarousel from '../components/ProductsCarousel';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import type { Product } from '../types';

// Componente auxiliar para manejar la altura del carrusel desde el badge hasta el bottom del hero
const CarouselSection: React.FC<{ products: Product[] }> = ({ products }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    const calc = () => {
      try {
        const badge = document.getElementById('recent-badge');
        const viewportHeight = window.innerHeight;
        const badgeBottom = badge ? (badge.getBoundingClientRect().bottom) : 0;
        // Si el hero ocupa la parte superior de la página, medimos desde el badge hasta el bottom del viewport
        const available = Math.max(200, viewportHeight - badgeBottom - 16); // mínimo razonable
        setHeight(`${available}px`);
      } catch (e) {
        setHeight(undefined);
      }
    };

    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  return (
    <div ref={containerRef} className="mb-8 px-8 overflow-visible">
      <div style={{ height }} className="relative overflow-visible">
        <ProductsCarousel products={products.slice().sort((a,b)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime())} maxVisible={4} className="h-full" />
      </div>
    </div>
  );
};

export const HomePage: React.FC = () => {
  const { featuredProducts, fetchFeaturedProducts, products, fetchProducts, loadingState } = useProductStore();
  const { addItem } = useCartStore();
  const { navigateTo } = useSmartNavigation();

  useEffect(() => {
    // Cargamos los productos recientes (todos) y también mantenemos fetchFeaturedProducts por compatibilidad
    fetchProducts();
    fetchFeaturedProducts();
  }, [fetchProducts, fetchFeaturedProducts]);

  const handleAddToCart = (product: Product) => {
    // Obtener el precio real del producto
    const enabledVariants = (product.variants || []).filter(v => v?.is_enabled);
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
    
    // Usar la variante seleccionada
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

  const phrases = [
    "Esto no lo ves en el telediario",
    "En mis tiempos esto no pasaba",
    "Yo tengo un cuñado que sabe de esto",
    "Con Franco estábamos mejor",
    "Los jóvenes de ahora no saben lo que es trabajar",
    "En mi pueblo hacemos esto mejor"
  ];

  return (
    <div className="min-h-screen">
  {/* Hero Section - imagen de fondo */}
  <section style={{ backgroundPosition: 'center 60%' }} className="relative text-white py-6 bg-[url('/bar-image-2.webp')] bg-cover bg-center">
        <div className="absolute inset-0 spanish-pattern opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-black/40 backdrop-blur-[4px] px-6 py-6 rounded-xl">
              <h1 className="text-4xl md:text-6xl font-patriot font-bold mb-4 text-shadow">
                Cuñadismo Ilustrado
              </h1>
              <p className="text-lg md:text-xl mb-6 text-shadow">
                La tienda más cuñao de España 
                <span className="inline-block w-7 h-5 ml-2 relative rounded-sm overflow-hidden shadow-lg transition-colors duration-200" style={{boxShadow: '0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'}}>
                  <span className="absolute top-0 left-0 w-full h-1/4 bg-spanish-red"></span>
                  <span className="absolute top-1/4 left-0 w-full h-1/2 bg-spanish-yellow"></span>
                  <span className="absolute bottom-0 left-0 w-full h-1/4 bg-spanish-red"></span>
                </span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    className="bg-slate-900 text-white font-bold px-6 py-2 text-base rounded-lg shadow hover:shadow-lg border-2 border-slate-700 hover:border-slate-600 transition-colors duration-200 inline-flex items-center justify-center"
                onClick={() => navigateTo('/productos')}
              >
                Ver Productos
                <ArrowRight className="ml-2" size={18} />
              </button>
                  <button
                    className="bg-white text-slate-900 font-bold px-6 py-2 text-base rounded-lg shadow hover:shadow-lg border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200 inline-flex items-center justify-center"
                onClick={() => navigateTo('/destacados')}
              >
                Productos Destacados
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* Decoración patriótica */}
        <div className="absolute bottom-0 left-0 w-full h-16">
          <div className="wood-pattern h-full opacity-30"></div>
        </div>
      </section>

      {/* Productos Recientes */}
      <section className="py-6 bg-slate-900 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-1">
            <div id="recent-badge" className="inline-flex items-center gap-2 bg-spanish-red px-4 py-2 rounded-full text-white font-semibold text-sm mb-4">
              <Star className="w-4 h-4 fill-current" />
              PRODUCTOS RECIENTES
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>

          {loadingState === 'loading' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-slate-700 animate-pulse rounded-xl h-96">
                  <div className="h-48 bg-slate-600 rounded-t-xl mb-4"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-600 rounded w-1/2"></div>
                    <div className="h-8 bg-slate-600 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <CarouselSection products={products} />

              {/* Estadísticas */}
              <div className="bg-slate-800 rounded-2xl p-8 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-3xl font-bold text-spanish-yellow mb-2">2.547</div>
                    <p className="text-slate-300">Cuñados satisfechos</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-spanish-yellow mb-2">4.9★</div>
                    <p className="text-slate-300">Valoración media</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-spanish-yellow mb-2">15</div>
                    <p className="text-slate-300">Frases legendarias</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">😢</div>
              <p className="text-slate-400 text-lg">
                No hay productos recientes disponibles en este momento.
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Visita nuestra colección o vuelve más tarde para ver novedades.
              </p>
            </div>
          )}

          <div className="text-center">
            <button
              className="inline-flex items-center gap-2 bg-gradient-to-r from-spanish-red to-spanish-yellow text-white px-8 py-4 rounded-xl font-bold text-lg shadow hover:shadow-xl transition-colors transition-shadow duration-300"
              onClick={() => navigateTo('/productos')}
            >
              Ver Toda la Colección
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Frases Destacadas */}
      <section className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-patriot font-bold text-center mb-12 text-white">
            Frases que marcan época
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phrases.map((phrase, index) => (
              <div key={index} className="bg-slate-700 border border-slate-600 rounded-lg p-6 hover:shadow-xl hover:border-spanish-yellow text-center transition-colors transition-shadow duration-300">
                <p className="text-lg font-cunao italic text-slate-200 mb-4">
                  "{phrase}"
                </p>
                <div className="text-spanish-yellow font-semibold">
                  - Tu cuñado favorito
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-patriot font-bold text-center mb-12">
            ¿Por qué elegir Cuñadismo Ilustrado?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-spanish-red w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-spanish-yellow transition-colors duration-300">
                <Star size={24} className="text-white group-hover:text-slate-900" />
              </div>
              <h3 className="font-semibold mb-2 text-spanish-yellow">Calidad Premium</h3>
              <p className="text-slate-300">
                Camisetas de alta calidad que duran más que las opiniones de tu cuñado
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-spanish-red w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-spanish-yellow transition-colors duration-300">
                <Truck size={24} className="text-white group-hover:text-slate-900" />
              </div>
              <h3 className="font-semibold mb-2 text-spanish-yellow">Envío Rápido</h3>
              <p className="text-slate-300">
                Entrega en 2-3 días laborables en toda España
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-spanish-red w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-spanish-yellow transition-colors duration-300">
                <Shield size={24} className="text-white group-hover:text-slate-900" />
              </div>
              <h3 className="font-semibold mb-2 text-spanish-yellow">Compra Segura</h3>
              <p className="text-slate-300">
                Pago seguro con Stripe y garantía de satisfacción
              </p>
            </div>
            <div className="text-center group">
              <div className="bg-spanish-red w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-spanish-yellow transition-colors duration-300">
                <Heart size={24} className="text-white group-hover:text-slate-900" />
              </div>
              <h3 className="font-semibold mb-2 text-spanish-yellow">Hecho con Amor</h3>
              <p className="text-slate-300">
                Cada diseño está hecho con el cariño de un verdadero español
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
  <section style={{ backgroundPosition: 'center 75%' }} className="py-28 md:py-32 bg-[url('/pool.webp')] bg-cover text-white text-center relative">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="inline-block bg-black/60 backdrop-blur-[4px] px-8 py-10 rounded-xl mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-patriot font-bold mb-4">
              ¿Listo para ser el cuñado más auténtico?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Únete a miles de cuñados que ya visten nuestras camisetas
            </p>
            <button
              className="inline-block bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 text-lg font-semibold rounded-lg shadow hover:shadow-lg transition-colors transition-shadow duration-300"
              onClick={() => navigateTo('/productos')}
            >
              Empezar a Comprar
              <ArrowRight className="inline ml-2" size={20} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

