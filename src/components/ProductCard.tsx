import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../types';
import { slugify } from '../utils/formatters';
import { OptimizedImage } from './OptimizedImage';
import { getMainProductImage } from '../utils/imageUtils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [hoveredColorId, setHoveredColorId] = React.useState<number | null>(null);
  const navigate = useNavigate();
  const defaultImage = getMainProductImage(product.images);
  const enabledVariants = product.variants?.filter((v: any) => v.is_enabled) || [];
  const uniquePrices = Array.from(new Set(enabledVariants.map((v: any) => v.price)));
  const price = uniquePrices.length === 1
    ? uniquePrices[0] / 100
    : Math.min(...uniquePrices) / 100;

  const colorOptionIds = Array.from(new Set(enabledVariants.flatMap((v: any) => v.options.filter((optId: any) => {
    const opt = product.options?.find((o: any) => o.type === 'color' && o.values.some((val: any) => val.id === optId));
    return !!opt;
  }))));
  const colorOptions = product.options?.find((o: any) => o.type === 'color')?.values.filter((val: any) => colorOptionIds.includes(val.id)) || [];

  const imageToShow = React.useMemo(() => {
    if (hoveredColorId) {
      const variant = enabledVariants.find((v: any) => v.options.includes(hoveredColorId));
      if (variant) {
        const img = product.images.find((img: any) => img.variant_ids.includes(variant.id));
        if (img) return img;
      }
    }
    return defaultImage;
  }, [hoveredColorId, product, defaultImage, enabledVariants]);

  return (
    <div className="group relative bg-slate-800 rounded-xl shadow-dark hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-700">
      <Link
        to={`/producto/${slugify(product.title)}`}
        onClick={() => {
          setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 100);
        }}
      >
        {/* Imagen del producto */}
        <div className="aspect-square bg-slate-700 overflow-hidden relative">
          {imageToShow ? (
            <OptimizedImage
              image={imageToShow}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="eager"
              responsive={true}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <span className="text-4xl">👕</span>
            </div>
          )}
        </div>

        {/* Vista previa de colores */}
        {colorOptions.length > 0 && (
          <div className="pt-2 px-3"> {/* CAMBIO: de py-2 a pt-2 para eliminar padding inferior */}
            <div
              className="flex flex-wrap justify-center items-center gap-2"
              style={{ width: '100%' }}
            >
              {colorOptions.map((color: any) => {
                const minSize = 18;
                const maxSize = 32;
                const cardWidth = 240;
                const count = colorOptions.length;
                const size = Math.max(minSize, Math.min(maxSize, Math.floor((cardWidth - (count - 1) * 8) / count)));
                return (
                  <div
                    key={color.id}
                    className={`rounded-full border-2 cursor-pointer transition-all ${hoveredColorId === color.id ? 'border-spanish-yellow scale-110' : 'border-slate-600'}`}
                    style={{
                      backgroundColor: color.colors?.[0] || '#fff',
                      width: `${size}px`,
                      height: `${size}px`,
                      minWidth: `${size}px`,
                      minHeight: `${size}px`,
                      flex: '0 0 auto',
                    }}
                    title={color.title}
                    onMouseEnter={() => setHoveredColorId(color.id)}
                    onMouseLeave={() => setHoveredColorId(null)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/producto/${slugify(product.title)}?color=${color.title}`);
                      setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }, 100);
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Información del producto */}
        <div className="px-3 pb-3 pt-2"> {/* CAMBIO: de p-3 a px-3 pb-3 pt-2 */}
          <h3 className="font-display font-semibold text-white mb-2 line-clamp-2 group-hover:underline transition-all duration-200" title={product.title}>
            {product.title}
          </h3>
          
          {/* Tags/categorías */}
          <div className="flex flex-wrap gap-1 mb-2">
            {product.tags.slice(0, 2).map((tag: string, index: number) => (
              <span
                key={index}
                className="inline-block bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full border border-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Precio */}
          <div>
            <span className="text-lg font-bold text-spanish-yellow">
              {price.toFixed(2)}€
            </span>
          </div>
        </div>
      </Link>

      {/* Badge de "Nuevo" o "Popular" */}
      {product.tags.includes('nuevo') && (
        <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
          NUEVO
        </div>
      )}
      {product.tags.includes('popular') && (
        <div className="absolute top-2 left-2 bg-spanish-yellow text-slate-900 text-xs font-semibold px-2 py-1 rounded">
          POPULAR
        </div>
      )}
    </div>
  );
};