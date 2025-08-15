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
  const price = 19.99; // Precio por defecto, deberías obtenerlo de las variantes

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
    <div className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <Link to={`/producto/${product.id}`}>
        {/* Imagen del producto */}
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {defaultImage ? (
            <img
              src={defaultImage.src}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">👕</span>
            </div>
          )}
          
          {/* Overlay con acciones */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleAddToCart}
                className="bg-viking-600 text-white p-2 rounded-full hover:bg-viking-700 transition-colors"
                title="Añadir al carrito"
              >
                <ShoppingCart size={18} />
              </button>
              <button 
                className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Vista rápida"
              >
                <Eye size={18} />
              </button>
              <button 
                className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Añadir a favoritos"
              >
                <Heart size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Información del producto */}
        <div className="p-4">
          <h3 className="font-display font-semibold text-gray-900 mb-2 line-clamp-2">
            {getCunaoPhrase(product.title)}
          </h3>
          
          {/* Tags/categorías */}
          <div className="flex flex-wrap gap-1 mb-2">
            {product.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-viking-100 text-viking-700 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Precio y botón */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-viking-600">
                {price.toFixed(2)}€
              </span>
              {/* Precio tachado si hay descuento */}
              {/* <span className="text-sm text-gray-500 line-through">24.99€</span> */}
            </div>

            <button
              onClick={handleAddToCart}
              className="btn-primary text-sm px-4 py-2"
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
        <div className="absolute top-2 left-2 bg-viking-600 text-white text-xs font-semibold px-2 py-1 rounded">
          POPULAR
        </div>
      )}
    </div>
  );
};

