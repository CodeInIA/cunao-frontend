import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [hoveredColorId, setHoveredColorId] = React.useState<number | null>(null);
  const navigate = useNavigate();
  const defaultImage = product.images.find((img: any) => img.is_default) || product.images[0];
  const price = product.variants && product.variants[0] && typeof product.variants[0].price === 'number'
    ? product.variants[0].price / 100
    : 0;

  // Obtener colores disponibles en variantes activas
  const enabledVariants = product.variants?.filter((v: any) => v.is_enabled) || [];
  const colorOptionIds = Array.from(new Set(enabledVariants.flatMap((v: any) => v.options.filter((optId: any) => {
    const opt = product.options?.find((o: any) => o.type === 'color' && o.values.some((val: any) => val.id === optId));
    return !!opt;
  }))));
  const colorOptions = product.options?.find((o: any) => o.type === 'color')?.values.filter((val: any) => colorOptionIds.includes(val.id)) || [];

  // Imagen a mostrar (por defecto o por hover)
  const imageToShow = React.useMemo(() => {
    if (hoveredColorId) {
      // Buscar variante con ese color
      const variant = enabledVariants.find((v: any) => v.options.includes(hoveredColorId));
      if (variant) {
        const img = product.images.find((img: any) => img.variant_ids.includes(variant.id));
        if (img) return img;
      }
    }
    return defaultImage;
  }, [hoveredColorId, product, defaultImage, enabledVariants]);

  const getCunaoPhrase = (title: string) => {
    return title.length > 50 ? title.substring(0, 50) + '...' : title;
  };

  return (
    <div className="group relative bg-slate-800 rounded-xl shadow-dark hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-700">
      <Link to={`/producto/${product.id}`}> 
        {/* Imagen del producto */}
        <div className="aspect-square bg-slate-700 overflow-hidden relative">
          {imageToShow ? (
            <img
              src={imageToShow.src}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <span className="text-4xl">👕</span>
            </div>
          )}
          
        </div>

        {/* Vista previa de colores */}
        {colorOptions.length > 0 && (
          <div className="py-3 px-4">
            <div
              className="flex flex-wrap justify-center items-center gap-2"
              style={{ width: '100%' }}
            >
              {colorOptions.map((color: any) => {
                // Tamaño dinámico: entre 18px y 32px según cantidad y ancho máximo de la tarjeta (aprox 240px)
                const minSize = 18;
                const maxSize = 32;
                const cardWidth = 240; // px, ajusta según el diseño real
                const count = colorOptions.length;
                // Calcula el tamaño para que quepan todos en una fila, pero si son demasiados, se envuelven
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
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/producto/${product.id}?color=${color.title}`);
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Información del producto */}
        <div className="p-6">
          <h3 className="font-display font-semibold text-white mb-2 line-clamp-2 group-hover:underline transition-all duration-200">
            {getCunaoPhrase(product.title)}
          </h3>
          {/* Tags/categorías */}
          <div className="flex flex-wrap gap-1 mb-4">
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
          <div className="flex flex-col gap-4 mt-6">
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

