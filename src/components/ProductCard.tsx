import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const defaultImage = product.images.find(img => img.is_default) || product.images[0];
  const price = product.variants && product.variants[0] && typeof product.variants[0].price === 'number'
    ? product.variants[0].price / 100
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const getCunaoPhrase = (title: string) => {
    // Extractar la frase cuñao del título
    return title.length > 50 ? title.substring(0, 50) + '...' : title;
  };

  return (
  <div className="group relative bg-slate-800 rounded-xl shadow-dark hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-slate-700">
      <Link to={`/producto/${product.id}`}> 
        {/* Imagen del producto */}
        <div className="aspect-square bg-slate-700 overflow-hidden relative">
          {defaultImage ? (
            <img
              src={defaultImage.src}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500">
              <span className="text-4xl">👕</span>
            </div>
          )}
          {/* Overlay con acciones */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleAddToCart}
                className="bg-spanish-red text-white p-2 rounded-full hover:bg-spanish-yellow hover:text-slate-900 transition-colors shadow"
                title="Añadir al carrito"
              >
                <ShoppingCart size={18} />
              </button>
              <button 
                className="bg-slate-900 text-slate-300 p-2 rounded-full hover:bg-slate-700 hover:text-white transition-colors"
                title="Vista rápida"
              >
                <Eye size={18} />
              </button>
              <button 
                className="bg-slate-900 text-slate-300 p-2 rounded-full hover:bg-spanish-yellow hover:text-slate-900 transition-colors"
                title="Añadir a favoritos"
              >
                <Heart size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Información del producto */}
        <div className="p-6">
          <h3 className="font-display font-semibold text-white mb-2 line-clamp-2">
            {getCunaoPhrase(product.title)}
          </h3>
          {/* Tags/categorías */}
          <div className="flex flex-wrap gap-1 mb-4">
            {product.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full border border-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
          {/* Precio y botón */}
          <div className="flex flex-col gap-4 mt-6">
            <span className="text-lg font-bold text-spanish-yellow">
              {price.toFixed(2)}€
            </span>
            <button
              onClick={handleAddToCart}
              className="bg-spanish-yellow text-slate-900 font-bold text-sm px-6 py-2 rounded-lg shadow hover:bg-spanish-red hover:text-white transition-colors border-2 border-spanish-yellow"
            >
              Añadir
            </button>
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

