import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, Heart } from 'lucide-react';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '../types';

export const HomePage: React.FC = () => {
  const { featuredProducts, fetchFeaturedProducts, loadingState } = useProductStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  const handleAddToCart = (product: Product) => {
    // Usar la primera variante disponible o crear una por defecto
    const cartItem = {
      productId: product.id,
      variantId: 1, // Usaríamos la primera variante disponible
      quantity: 1,
      title: product.title,
      price: 19.99, // Precio por defecto
      image: product.images[0]?.src || '',
      size: 'M', // Talla por defecto
      color: 'Negro' // Color por defecto
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
      {/* Hero Section - Reducido verticalmente */}
      <section className="relative bg-gradient-to-r from-spanish-red to-spanish-yellow text-white py-16">
        <div className="absolute inset-0 spanish-pattern opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-patriot font-bold mb-4 text-shadow">
              Cuñadismo Ilustrado
            </h1>
            <p className="text-lg md:text-xl mb-6 text-shadow">
              La tienda más cuñao de España 
              <span className="inline-block w-7 h-5 ml-2 relative rounded-sm overflow-hidden shadow-lg transform hover:scale-110 transition-transform duration-300" style={{boxShadow: '0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'}}>
                <span className="absolute top-0 left-0 w-full h-1/4 bg-spanish-red"></span>
                <span className="absolute top-1/4 left-0 w-full h-1/2 bg-spanish-yellow"></span>
                <span className="absolute bottom-0 left-0 w-full h-1/4 bg-spanish-red"></span>
              </span>
            </p>
            <p className="text-base mb-8 opacity-90 max-w-2xl mx-auto">
              Camisetas con las frases más auténticas del cuñadismo español. 
              Porque siempre hay algo que opinar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/productos" className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 text-lg rounded-lg shadow-lg border-2 border-slate-700 hover:border-slate-600 transition-all duration-200 inline-flex items-center justify-center">
                Ver Productos
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link to="/destacados" className="bg-white hover:bg-gray-100 text-slate-900 font-bold px-8 py-3 text-lg rounded-lg shadow-lg border-2 border-gray-300 hover:border-gray-400 transition-all duration-200 inline-flex items-center justify-center">
                Productos Destacados
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decoración patriótica */}
        <div className="absolute bottom-0 left-0 w-full h-16">
          <div className="wood-pattern h-full opacity-30"></div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-patriot font-bold text-white mb-4">
              Productos Destacados
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Nuestras camisetas más populares con las frases que todo cuñao respeta
            </p>
          </div>

          {loadingState === 'loading' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-slate-700 animate-pulse rounded-lg h-96"></div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">
                No hay productos destacados disponibles en este momento.
              </p>
            </div>
          )}

          <div className="text-center">
            <Link to="/productos" className="inline-block border-2 border-spanish-yellow text-spanish-yellow px-6 py-3 rounded-lg font-semibold hover:bg-spanish-yellow hover:text-slate-900 transition-colors">
              Ver Todos los Productos
              <ArrowRight className="inline ml-2" size={18} />
            </Link>
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
              <div key={index} className="bg-slate-700 border border-slate-600 rounded-lg p-6 hover:shadow-xl hover:border-spanish-yellow text-center transition-all duration-300 hover:scale-105">
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
      <section className="py-16 bg-gradient-to-r from-spanish-red to-spanish-yellow text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-patriot font-bold mb-4">
            ¿Listo para ser el cuñado más auténtico?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de cuñados que ya visten nuestras camisetas
          </p>
          <Link to="/productos" className="inline-block bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg">
            Empezar a Comprar
            <ArrowRight className="inline ml-2" size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

