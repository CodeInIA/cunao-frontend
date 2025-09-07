import React, { useMemo, useState } from 'react';
import { ShoppingCart, Star, Crown, Zap } from 'lucide-react';
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import type { Product } from '../types';
import { OptimizedImage } from './OptimizedImage';
import { getMainProductImage } from '../utils/imageUtils';
import { slugify } from '../utils/formatters';

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
  const { navigateTo } = useSmartNavigation();

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

  const firstImage = getMainProductImage(product.images || []);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  const handleCardClick = () => {
    navigateTo(`/producto/${slugify(product.title)}`);
  };

  return (
    <article
      className={`
        relative group w-full
        rounded-xl overflow-visible cursor-pointer
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Contenedor con borde + sombra que se adapta al contenido */}
      <div
        className={`
          flex flex-col bg-gradient-to-br from-slate-900 to-slate-800
          rounded-xl overflow-hidden shadow-lg transition-shadow duration-300
          ${visual.ring}
        `}
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

        {/* IMAGEN: contenedor que se adapta a las proporciones de la imagen */}
        <div className="w-full bg-slate-900 flex items-center justify-center relative overflow-hidden">
          {/* skeleton / placeholder mientras carga */}
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-800 to-slate-900 min-h-[200px]">
              <div className="w-20 h-24 rounded-md bg-slate-700 animate-pulse" />
            </div>
          )}

          {firstImage ? (
            <OptimizedImage
              image={firstImage}
              alt={product.title || 'Producto'}
              loading="eager"
              className={`w-full h-auto object-cover transition-transform duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'} ${isHovered ? 'scale-105' : 'scale-100'}`}
              responsive={true}
              onLoad={() => setImgLoaded(true)}
            />
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-slate-700">
              <span className="text-5xl">👕</span>
            </div>
          )}

          {/* overlay simple para hover */}
          <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${isHovered ? 'bg-black/10' : 'bg-transparent'}`} />
        </div>

        {/* Contenido textual - con padding compacto */}
        <div className="p-4 flex flex-col">
          {/* rating */}
          {(isDestacado || isPopular || isClasico) && (
            <div className="flex items-center gap-2 mb-3" aria-hidden>
              <div className="flex items-center space-x-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={`${visual.starColor} fill-current`} />
                ))}
              </div>
              <span className={`${visual.starColor} text-sm font-semibold`}>{`(4.9)`}</span>
            </div>
          )}

          {/* Título */}
          <h3
            className={`text-lg font-semibold text-slate-100 leading-tight mb-3 line-clamp-2 transition-all duration-200 ${isHovered ? 'underline decoration-white decoration-2 underline-offset-2' : ''}`}
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Precio y CTA en una sección compacta */}
          <div className="space-y-3">
            {/* Precio */}
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xl font-bold ${isDestacado ? 'text-spanish-yellow' : isPopular ? 'text-spanish-red' : 'text-white'}`}>
                  {hasPrice ? minPriceFormatted : 'Sin precio'}
                </div>
                {hasPrice && (
                  <div className="text-sm text-slate-400 line-through">
                    €{((parseFloat(minPriceFormatted.replace('€', '')) * 1.5)).toFixed(2)}
                  </div>
                )}
              </div>

              {/* etiqueta pequeña */}
              {(isDestacado || isPopular || isClasico) && (
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  {visual.icon}
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={handleAddClick}
              aria-label={`Añadir ${product.title} al carrito`}
              className={`
                w-full py-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none outline-none
                ${isDestacado ? 'bg-spanish-yellow text-slate-900 hover:bg-yellow-400' : isPopular ? 'bg-spanish-red text-white hover:bg-red-600' : 'bg-slate-700 text-white hover:bg-slate-600'}
              `}
              style={{ outline: 'none' }}
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
