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

  // Determinar categoría visual
  const tagsLower = product.tags.map(t => t.toLowerCase());
  const isDestacado = tagsLower.includes('destacado');
  const isPopular = tagsLower.includes('popular');
  const isClasico = tagsLower.includes('clásico');

  // Color y badge según categoría
  let cardColor = 'bg-slate-800 border border-slate-600';
  let badge = null;
  let starColor = 'text-slate-400';
  let icon = null;
  let label = '';
  if (isDestacado) {
    cardColor = 'bg-gradient-to-br from-slate-800 to-slate-700 border-2 border-spanish-yellow shadow-xl';
    badge = (
      <div className="absolute -top-3 -right-3 z-20 bg-spanish-yellow text-slate-900 font-bold text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
        <Crown size={12} /> DESTACADO
      </div>
    );
    starColor = 'text-spanish-yellow';
    icon = <Zap size={14} />;
    label = 'MÁS VENDIDO';
  } else if (isPopular) {
    cardColor = 'bg-gradient-to-br from-slate-800 to-slate-700 border-2 border-spanish-red shadow-xl';
    badge = (
      <div className="absolute -top-3 -right-3 z-20 bg-spanish-red text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
        <Zap size={12} /> POPULAR
      </div>
    );
    starColor = 'text-spanish-red';
    icon = <Zap size={14} />;
    label = 'MÁS POPULAR';
  } else if (isClasico) {
    cardColor = 'bg-gradient-to-br from-slate-800 to-slate-700 border-2 border-green-500 shadow-xl';
    badge = (
      <div className="absolute -top-3 -right-3 z-20 bg-green-500 text-white font-bold text-xs px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
        <Star size={12} /> CLÁSICO
      </div>
    );
    starColor = 'text-green-500';
    icon = <Star size={14} />;
    label = 'CLÁSICO';
  }

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-300 w-full max-w-[240px] min-w-[220px] flex flex-col items-stretch justify-between mx-auto`}
      style={{ minHeight: '370px', height: '370px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge de categoría */}
      {badge}

      {/* Card principal */}
      <div className={`relative overflow-hidden rounded-xl transition-all duration-300 ${cardColor} ${isHovered ? 'shadow-2xl' : 'shadow-lg'}`}
        style={{ minHeight: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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
        <div className="p-4 flex flex-col justify-between h-full">
          {/* Estrellas */}
          {(isDestacado || isPopular || isClasico) && (
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={18} 
                  className={starColor + ' fill-current'} 
                />
              ))}
              <span className={starColor + " text-sm ml-2 font-semibold"}>
                (4.9)
              </span>
            </div>
          )}
          <h3 className={`
            font-semibold mb-4 transition-colors duration-200 text-lg break-words whitespace-normal leading-snug
            ${featured 
              ? 'text-white group-hover:text-spanish-yellow' 
              : 'text-slate-200 group-hover:text-white'
            }
          `} style={{ minHeight: '2.5em', maxHeight: '3.5em', overflow: 'visible' }}>
            {product.title}
          </h3>

          {/* Precio y características */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              {(() => {
                const enabledVariants = product.variants?.filter(v => v.is_enabled) || [];
                const uniquePrices = Array.from(new Set(enabledVariants.map(v => v.price)));
                const minPrice = uniquePrices.length > 0 ? Math.min(...uniquePrices) : undefined;
                return (
                  <>
                    <span className={`
                      font-bold text-lg
                      ${isDestacado ? 'text-spanish-yellow' : isPopular ? 'text-spanish-red' : isClasico ? 'text-green-500' : 'text-white'}
                    `}>
                      {minPrice !== undefined ? `€${(minPrice / 100).toFixed(2)}` : 'Sin precio'}
                    </span>
                    {minPrice !== undefined && (
                      <span className="text-slate-400 text-xs line-through">
                        €{((minPrice * 1.5) / 100).toFixed(2)}
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
            {(isDestacado || isPopular || isClasico) && (
              <div className={`flex items-center gap-1 ${isDestacado ? 'text-spanish-yellow' : isPopular ? 'text-spanish-red' : 'text-green-500'}`}>
                {icon}
                <span className="text-xs font-semibold">{label}</span>
              </div>
            )}
          </div>

          {/* Botón de acción */}
          <button
            onClick={handleAddToCart}
            className={`
              w-full py-2 px-4 rounded-lg font-semibold transition-all duration-200 mt-2
              ${isDestacado
                ? 'bg-spanish-yellow text-slate-900 hover:bg-yellow-400 shadow-lg hover:shadow-xl'
                : isPopular
                  ? 'bg-spanish-red text-white hover:bg-red-600'
                  : isClasico
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
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
