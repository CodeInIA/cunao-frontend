import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Crown, Zap, TrendingUp, Award, Users, Clock, ArrowRight } from 'lucide-react';
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { FeaturedProductCard } from '../components/FeaturedProductCard';
import type { Product } from '../types';

export const FeaturedPage: React.FC = () => {
  const { featuredProducts, fetchFeaturedProducts, loadingState } = useProductStore();
  const { addItem } = useCartStore();
  const { navigateTo } = useSmartNavigation();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

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

  const cuñaoStats = [
    { icon: Users, label: 'Cuñados satisfechos', value: '2,547', color: 'text-spanish-yellow' },
    { icon: TrendingUp, label: 'Ventas este mes', value: '+189%', color: 'text-green-400' },
    { icon: Award, label: 'Valoración media', value: '4.9★', color: 'text-spanish-yellow' },
    { icon: Clock, label: 'Años de experiencia cuñao', value: '25+', color: 'text-spanish-red' }
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

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero Section Especial */}
      <section className="relative bg-gradient-to-br from-spanish-red via-slate-800 to-spanish-yellow overflow-hidden py-24">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        {/* Efectos de fondo */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-spanish-yellow opacity-20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-spanish-red opacity-20 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white opacity-10 rounded-full blur-lg"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-spanish-red bg-opacity-90 px-6 py-3 rounded-full text-white font-bold text-sm mb-6 shadow-lg">
              <Crown className="w-5 h-5" />
              LO MÁS CUÑAO DE ESPAÑA
              <Crown className="w-5 h-5" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-patriot font-bold text-white mb-6 text-shadow-lg">
              Productos <span className="text-spanish-yellow">Destacados</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white font-medium max-w-3xl mx-auto mb-8 drop-shadow-lg">
              Las camisetas más auténticas del cuñadismo español. 
              <br />
              <span className="text-spanish-yellow font-semibold">¡Las que todo el mundo quiere!</span>
            </p>

            {/* Badges de credibilidad */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <Star className="w-4 h-4 text-spanish-yellow fill-current" />
                <span className="text-white font-semibold">Más vendidas</span>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <Zap className="w-4 h-4 text-spanish-yellow" />
                <span className="text-white font-semibold">Tendencias 2025</span>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <Award className="w-4 h-4 text-spanish-yellow" />
                <span className="text-white font-semibold">Calidad premium</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas Impresionantes */}
      <section className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {cuñaoStats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-spanish-red transition-all duration-300 transform group-hover:scale-110">
                  <stat.icon className={`w-8 h-8 ${stat.color} group-hover:text-white`} />
                </div>
                <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <p className="text-white font-semibold text-sm drop-shadow-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Productos Destacados Premium */}
      <section className="py-20 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-patriot font-bold text-white mb-4">
              🏆 Top Productos Cuñao 2025
            </h2>
            <p className="text-white font-medium max-w-2xl mx-auto text-lg drop-shadow-sm">
              Los diseños que han conquistado bares, tertulias y reuniones familiares en toda España
            </p>
          </div>

          {loadingState === 'loading' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max mb-16">
              {featuredProducts.slice(0, 6).map((product, index) => (
                <FeaturedProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  featured={true} // Todos son destacados aquí
                />
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

      {/* Top Frases del Mes */}
      <section className="py-20 bg-gradient-to-br from-slate-800 to-slate-900">
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
                  <blockquote className="text-xl font-semibold text-white mb-4 italic">
                    "{item.phrase}"
                  </blockquote>

                  {/* Estadísticas */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="text-spanish-yellow">
                        <span className="text-2xl font-bold">{item.popularity}</span>
                        <span className="block text-xs text-white font-medium drop-shadow-sm">Popularidad</span>
                      </div>
                      <div className="text-spanish-red">
                        <span className="text-2xl font-bold">{item.sales}</span>
                        <span className="block text-xs text-white font-medium drop-shadow-sm">Ventas</span>
                      </div>
                    </div>
                    <button className="bg-spanish-red hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
                      {/* Si tienes la ruta de la camiseta, reemplaza '/productos' por la ruta específica */}
                      Ver Camiseta
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final Impactante */}
      <section className="py-20 bg-gradient-to-r from-spanish-red via-spanish-yellow to-spanish-red text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-patriot font-bold text-slate-900 mb-6">
              ¿Preparado para ser la Estrella del Bar?
            </h2>
            <p className="text-xl text-slate-900 font-bold mb-8 drop-shadow-sm">
              Únete a miles de cuñados que ya causan sensación con nuestras camisetas más populares
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <button
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 text-lg font-bold rounded-lg shadow-xl transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-2"
                  onClick={() => navigateTo('/productos')}
                >
                  <Star className="w-5 h-5" />
                  Ver Todos los Productos
                </button>
              
                <button
                  className="border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white px-8 py-4 text-lg font-bold rounded-lg transition-all duration-300 inline-flex items-center gap-2"
                  onClick={() => navigateTo('/contacto')}
                >
                  Solicitar Diseño Personalizado
                </button>
            </div>

            {/* Testimonios rápidos */}
            <div className="bg-black bg-opacity-20 rounded-xl p-6">
              <p className="text-slate-900 italic text-lg font-semibold drop-shadow-sm">
                "Desde que llevo estas camisetas, soy el rey de la tertulia del bar. ¡Todo el mundo quiere saber dónde las compro!"
              </p>
              <p className="text-slate-900 font-bold mt-2 drop-shadow-sm">
                - Paco, 52 años, Cuñado Profesional de Móstoles
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
