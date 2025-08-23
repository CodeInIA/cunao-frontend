import React, { useMemo, useState } from 'react';
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
  const [imgLoaded, setImgLoaded] = useState(false);

  // Categorías (busca 'destacado', 'popular', 'clásico' sin sensibilidad a mayúsculas)
  const tagsLower = (product.tags || []).map(t => String(t).toLowerCase());
  const isDestacado = tagsLower.includes('destacado');
  const isPopular = tagsLower.includes('popular');
  const isClasico = tagsLower.includes('clásico');

  // Badge / color según categoría
  const visual = useMemo(() => {
    if (isDestacado) {
      return {
        ring: 'border-2 border-spanish-yellow',
        badgeBg: 'bg-spanish-yellow text-slate-900',
        starColor: 'text-spanish-yellow',
        icon: <Crown size={14} />,
        label: 'MÁS VENDIDO'
      };
    }
    if (isPopular) {
      return {
        ring: 'border-2 border-spanish-red',
        badgeBg: 'bg-spanish-red text-white',
        starColor: 'text-spanish-red',
        icon: <Zap size={14} />,
        label: 'MÁS POPULAR'
      };
    }
    if (isClasico) {
      return {
        ring: 'border-2 border-green-500',
        badgeBg: 'bg-green-500 text-white',
        starColor: 'text-green-500',
        icon: <Star size={14} />,
        label: 'CLÁSICO'
      };
    }
    return {
      ring: 'border border-slate-700',
      badgeBg: 'bg-slate-700 text-white',
      starColor: 'text-slate-400',
      icon: null,
      label: ''
    };
  }, [isDestacado, isPopular, isClasico]);

  // Precio mínimo (si hay variantes)
  const { minPriceFormatted, hasPrice } = useMemo(() => {
    const enabledVariants = (product.variants || []).filter(v => v?.is_enabled);
    const uniquePrices = Array.from(new Set(enabledVariants.map(v => v.price).filter(p => typeof p === 'number')));
    if (uniquePrices.length === 0) return { minPriceFormatted: '', hasPrice: false };
    const min = Math.min(...uniquePrices);
    return { minPriceFormatted: `€${(min / 100).toFixed(2)}`, hasPrice: true };
  }, [product.variants]);

  const firstImage = product.images?.[0];

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <article
      className={`
        relative group w-full max-w-[280px] min-w-[220px]
        rounded-xl overflow-visible transform transition-all duration-300
        ${isHovered ? 'scale-[1.02] z-10' : 'z-0'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Contenedor con borde + sombra para dar consistencia */}
      <div
        className={`
          h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-800
          rounded-xl overflow-hidden shadow-lg transition-shadow duration-300
          ${visual.ring}
        `}
        style={{ minHeight: 430 }} /* Mantener altura consistente en grid */
      >
        {/* Badge */}
        {visual.label && (
          <div className="absolute -top-3 right-3 z-30">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold shadow-md ${visual.badgeBg}`}
              aria-hidden
            >
              {visual.icon}
              {visual.label}
            </span>
          </div>
        )}

        {/* IMAGEN: contenedor fijo responsive para que todas las tarjetas alineen */}
        <div className="w-full h-56 md:h-64 lg:h-72 bg-slate-900 flex items-center justify-center relative">
          {/* skeleton / placeholder mientras carga */}
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900">
              <div className="w-20 h-24 rounded-md bg-slate-700 animate-pulse" />
            </div>
          )}

          {firstImage ? (
            <img
              src={firstImage.src}
              alt={product.title || 'Producto'}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              className={`max-h-full w-auto object-contain transition-transform duration-400 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              style={{ display: 'block' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-700">
              <span className="text-5xl">👕</span>
            </div>
          )}

          {/* overlay simple para hover */}
          <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isHovered ? 'bg-black/10' : 'bg-transparent'}`} />
          {/* floating cart button (visible on hover and keyboard focus) */}
          <button
            onClick={handleAddClick}
            aria-label={`Añadir ${product.title} al carrito`}
            className={`
              absolute bottom-3 right-3 p-3 rounded-full text-white shadow-lg
              bg-spanish-red hover:bg-spanish-yellow focus:outline-none focus:ring-2 focus:ring-spanish-yellow
              transition-all duration-200 transform
              ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
            `}
          >
            <ShoppingCart size={18} />
          </button>
        </div>

        {/* Contenido textual */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* rating */}
            {(isDestacado || isPopular || isClasico) && (
              <div className="flex items-center gap-2 mb-2" aria-hidden>
                <div className="flex items-center -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={`${visual.starColor} fill-current`} />
                  ))}
                </div>
                <span className={`${visual.starColor} text-sm font-semibold`}>{`(4.9)`}</span>
              </div>
            )}

            {/* Título */}
            <h3
              className="text-lg font-semibold text-slate-100 leading-tight mb-2 line-clamp-3"
              title={product.title}
              style={{ minHeight: 56 }}
            >
              {product.title}
            </h3>

            {/* Precio */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className={`text-lg font-bold ${isDestacado ? 'text-spanish-yellow' : isPopular ? 'text-spanish-red' : 'text-white'}`}>
                  {hasPrice ? minPriceFormatted : 'Sin precio'}
                </div>
                {hasPrice && (
                  <div className="text-xs text-slate-400 line-through mt-1">
                    €{((parseFloat(minPriceFormatted.replace('€', '')) * 1.5)).toFixed(2)}
                  </div>
                )}
              </div>

              {/* etiqueta pequeña */}
              {(isDestacado || isPopular || isClasico) && (
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  {visual.icon}
                  <span className="opacity-90">{visual.label}</span>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-4">
            <button
              onClick={handleAddClick}
              aria-label={`Añadir ${product.title} al carrito`}
              className={`
                w-full py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-spanish-yellow
                ${isDestacado ? 'bg-spanish-yellow text-slate-900 hover:bg-yellow-400' : isPopular ? 'bg-spanish-red text-white hover:bg-red-600' : 'bg-slate-700 text-white hover:bg-slate-600'}
              `}
            >
              Añadir al Carrito
            </button>
          </div>
        </div>

        {/* pequeño footer decorativo */}
        <div className="h-1 bg-gradient-to-r from-transparent via-slate-700 to-transparent" aria-hidden />
      </div>
    </article>
  );
};
