import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { slugify } from '../utils/formatters';
import { OptimizedImage } from './OptimizedImage';
import { getMainProductImage } from '../utils/imageUtils';

interface Props {
  product: Product;
  className?: string;
}

const RecentProductCard: React.FC<Props> = ({ product, className }) => {
  const image = getMainProductImage(product.images);
  const enabledVariants = product.variants?.filter((v: any) => v.is_enabled) || [];
  const uniquePrices = Array.from(new Set(enabledVariants.map((v: any) => v.price)));
  const price = uniquePrices.length === 1 ? uniquePrices[0] / 100 : Math.min(...uniquePrices) / 100;

  return (
  <div className={`group relative overflow-hidden min-w-0 hover:shadow-xl transition-shadow duration-300 ${className || ''}`}>
      <Link
        to={`/producto/${slugify(product.title)}`}
        className="block h-full"
        onClick={() => { setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 100); }}
      >
        <div className="aspect-square overflow-hidden relative flex items-center justify-center">
          {image ? (
            <div className="w-full h-full flex items-center justify-center p-3 box-border">
              <OptimizedImage
                image={image}
                alt={product.title}
                className="max-w-full max-h-full w-full h-full object-contain scale-110 group-hover:scale-125 transition-transform duration-300 will-change-transform"
                loading="eager"
                responsive={true}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <span className="text-4xl">👕</span>
            </div>
          )}
        </div>

        <div className="px-3 pb-2 pt-2 text-center">
          <h3 className="font-display font-semibold text-white mb-1 text-sm line-clamp-2 group-hover:underline transition-all duration-150" title={product.title}>
            {product.title}
          </h3>
          <div>
            <span className="text-lg font-bold text-spanish-yellow">
              {price.toFixed(2)}€
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RecentProductCard;
