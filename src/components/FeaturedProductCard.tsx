import React, { useState } from 'react';
import { ShoppingCart, Star, Crown, Zap } from 'lucide-react';
import type { Product } from '../types';

interface FeaturedProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  featured?: boolean;
}

export const FeaturedProductCard: React.FC<FeaturedProductCardProps> = ({ 
  product, 
  onAddToCart, 
  featured = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-300 ${
        featured 
          ? 'transform hover:scale-105 hover:z-10' 
          : 'transform hover:scale-102'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge de destacado */}
      {featured && (
        <div className="absolute -top-3 -right-3 z-20 bg-spanish-yellow text-slate-900 font-bold text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          <Crown size={12} />
          DESTACADO
        </div>
      )}

      {/* Card principal */}
      <div className={`
        relative overflow-hidden rounded-xl transition-all duration-300 
        ${featured 
          ? 'bg-gradient-to-br from-slate-800 to-slate-700 border-2 border-spanish-yellow shadow-xl' 
          : 'bg-slate-800 border border-slate-600 hover:border-spanish-red'
        }
        ${isHovered ? 'shadow-2xl' : 'shadow-lg'}
      `}>
        {/* Imagen del producto */}
        <div className="relative aspect-square overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].src}
              alt={product.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-slate-600 flex items-center justify-center">
              <span className="text-4xl">👕</span>
            </div>
          )}
          
          {/* Overlay con efectos */}
          <div className={`
            absolute inset-0 transition-opacity duration-300
            ${isHovered 
              ? 'bg-black bg-opacity-20' 
              : 'bg-transparent'
            }
          `}>
            {/* Botón de agregar al carrito flotante */}
            <button
              onClick={handleAddToCart}
              className={`
                absolute bottom-4 right-4 
                bg-spanish-red hover:bg-spanish-yellow 
                text-white hover:text-slate-900 
                p-3 rounded-full shadow-lg 
                transition-all duration-300 transform
                ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
                hover:scale-110 focus:outline-none focus:ring-2 focus:ring-spanish-yellow
              `}
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>

        {/* Contenido del producto */}
        <div className="p-6">
          {/* Rating si está destacado */}
          {featured && (
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={14} 
                  className="text-spanish-yellow fill-current" 
                />
              ))}
              <span className="text-spanish-yellow text-xs ml-1 font-semibold">
                (4.9)
              </span>
            </div>
          )}

          {/* Título */}
          <h3 className={`
            font-semibold mb-2 transition-colors duration-200 line-clamp-2
            ${featured 
              ? 'text-white text-lg group-hover:text-spanish-yellow' 
              : 'text-slate-200 group-hover:text-white'
            }
          `}>
            {product.title}
          </h3>

          {/* Descripción */}
          {product.description && (
            <p className="text-slate-400 text-sm mb-3 line-clamp-2">
              {product.description.substring(0, 80)}...
            </p>
          )}

          {/* Precio y características */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className={`
                font-bold text-lg
                ${featured ? 'text-spanish-yellow' : 'text-white'}
              `}>
                €19.99
              </span>
              {featured && (
                <span className="text-slate-400 text-xs line-through">
                  €24.99
                </span>
              )}
            </div>
            
            {featured && (
              <div className="flex items-center gap-1 text-spanish-yellow">
                <Zap size={14} />
                <span className="text-xs font-semibold">MÁS VENDIDO</span>
              </div>
            )}
          </div>

          {/* Botón de acción */}
          <button
            onClick={handleAddToCart}
            className={`
              w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200
              ${featured
                ? 'bg-spanish-yellow text-slate-900 hover:bg-yellow-400 shadow-lg hover:shadow-xl'
                : 'bg-spanish-red text-white hover:bg-red-600'
              }
              transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-spanish-yellow
            `}
          >
            Añadir al Carrito
          </button>
        </div>

        {/* Efecto de brillo para productos destacados */}
        {featured && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-spanish-yellow to-transparent opacity-20 transform -skew-x-12 -translate-x-full animate-shimmer"></div>
          </div>
        )}
      </div>
    </div>
  );
};
