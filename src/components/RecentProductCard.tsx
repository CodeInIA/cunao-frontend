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
  const prices = Array.from(new Set(enabledVariants.map((v: any) => v.price)));
  const price = prices.length ? Math.min(...prices) / 100 : 0;

  return (
    <div className={`group bg-slate-800 rounded-lg overflow-hidden border border-slate-700 h-full flex flex-col min-h-0 ${className || ''}`}>
      <Link to={`/producto/${slugify(product.title)}`} className="block h-full flex flex-col">
        <div className="bg-slate-700 p-2 md:p-3 flex items-center justify-center flex-1 min-h-0 overflow-hidden">
          {image ? (
            <OptimizedImage image={image} alt={product.title} className="max-w-full max-h-full object-contain" responsive />
          ) : (
            <div className="text-4xl">👕</div>
          )}
        </div>

        <div className="px-3 py-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 card-title" title={product.title}>{product.title}</h3>
          <div className="text-spanish-yellow font-bold mt-1">{price.toFixed(2)}€</div>
        </div>
      </Link>
    </div>
  );
};

export default RecentProductCard;
