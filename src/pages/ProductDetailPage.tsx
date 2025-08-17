import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProductStore } from '../stores/productStore';
import { useCartStore } from '../stores/cartStore';
import { ShoppingCart } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const { currentProduct, fetchProduct, loadingState, error } = useProductStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id, fetchProduct]);

  if (loadingState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spanish-red"></div>
        <span className="ml-4 text-white">Cargando producto...</span>
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Producto no encontrado</h2>
          <p className="text-slate-400 mb-6">El producto que buscas no existe o ha sido eliminado.</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    const cartItem = {
      productId: currentProduct.id,
      variantId: 1,
      quantity: 1,
      title: currentProduct.title,
      price: 19.99,
      image: currentProduct.images[0]?.src || '',
      size: 'M',
      color: 'Negro'
    };
    addItem(cartItem);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-12">
        {/* Imagen */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src={currentProduct.images[0]?.src}
            alt={currentProduct.title}
            className="max-w-md w-full rounded-xl shadow-lg border-4 border-slate-800"
          />
        </div>
        {/* Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            {currentProduct.title}
          </h1>
          <div className="flex items-center gap-6 mb-8">
            <span className="text-3xl font-bold text-spanish-yellow">
              19.99€
            </span>
            <button
              onClick={handleAddToCart}
              className="bg-spanish-yellow text-slate-900 font-bold px-8 py-3 rounded-lg shadow hover:bg-spanish-red hover:text-white transition-colors border-2 border-spanish-yellow flex items-center gap-2"
            >
              <ShoppingCart size={20} /> Añadir al carrito
            </button>
          </div>
          {/* Descripción HTML */}
          <div className="text-lg text-slate-300 mb-6" dangerouslySetInnerHTML={{ __html: currentProduct.description }} />
          {/* GPSR HTML si existe */}
          {currentProduct.gpsr && (
            <div className="mt-6 text-base text-slate-400" dangerouslySetInnerHTML={{ __html: currentProduct.gpsr }} />
          )}
          <div className="flex flex-wrap gap-2 mb-6">
            {currentProduct.tags.map((tag, idx) => (
              <span key={idx} className="bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-600">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
