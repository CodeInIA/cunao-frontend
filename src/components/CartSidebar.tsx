import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { Link } from 'react-router-dom';
import { useSmartNavigation } from '../hooks/useSmartNavigation';

export const CartSidebar: React.FC = () => {
  const { navigateTo } = useSmartNavigation();
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();

  const total = getTotalPrice();
  const totalItems = getTotalItems();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={closeCart}
      />

      {/* Sidebar */}
  <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-slate-800">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 shadow-sm">
            <h2 className="text-xl font-patriot font-bold text-white">
              Tu Carrito <span className="text-white">({totalItems})</span>
            </h2>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-slate-800 rounded-md transition-colors"
            >
              <X size={20} className="text-spanish-yellow" />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag size={64} className="text-spanish-yellow mb-4 drop-shadow-lg" />
                <h3 className="text-2xl font-patriot font-bold text-white mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-slate-300 mb-6 text-lg">
                  ¡Añade algunas camisetas cuñaos para empezar!
                </p>
                <button
                  className="px-8 py-3 bg-spanish-yellow text-slate-900 font-patriot font-bold rounded-lg shadow-lg hover:bg-yellow-400 hover:text-spanish-red transition-all duration-300"
                  onClick={() => {
                    closeCart();
                    navigateTo('/productos');
                  }}
                >
                  Ver Productos
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex items-center space-x-4 p-4 bg-slate-800 rounded-lg border border-slate-800 shadow-md">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-md border-2 border-spanish-yellow shadow"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-patriot font-bold text-spanish-yellow truncate">
                        {item.title}
                      </h4>
                      {item.size && (
                        <p className="text-xs text-slate-300">Talla: {item.size}</p>
                      )}
                      {item.color && (
                        <p className="text-xs text-slate-300">Color: {item.color}</p>
                      )}
                      <p className="text-base font-bold text-spanish-red">
                        {item.price.toFixed(2)}€
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Controles de cantidad */}
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="p-1 hover:bg-spanish-yellow/10 rounded-md transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} className="text-spanish-yellow" />
                      </button>
                      <span className="w-8 text-center text-base font-bold text-spanish-yellow">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="p-1 hover:bg-spanish-yellow/10 rounded-md transition-colors"
                      >
                        <Plus size={16} className="text-spanish-yellow" />
                      </button>
                      {/* Eliminar */}
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="p-1 text-spanish-yellow hover:bg-spanish-yellow/10 rounded-md transition-colors ml-2"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-slate-800 p-6 bg-slate-900 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-patriot font-bold text-spanish-yellow">
                  Total:
                </span>
                <span className="text-xl font-bold text-spanish-yellow">
                  {total.toFixed(2)}€
                </span>
              </div>
              <div className="space-y-2">
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full px-8 py-3 bg-spanish-yellow text-slate-900 font-patriot font-bold rounded-lg shadow-lg block text-center hover:bg-yellow-400 hover:text-spanish-red transition-all duration-300"
                >
                  Finalizar Compra
                </Link>
                <button
                  onClick={() => {
                    closeCart();
                    setTimeout(() => {
                      if (window.location.pathname === '/productos' || window.location.pathname.startsWith('/producto/')) {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        navigateTo('/productos');
                        setTimeout(() => {
                          window.scrollTo({ top: 0, behavior: 'auto' });
                        }, 100);
                      }
                    }, 100);
                  }}
                  className="w-full px-8 py-3 bg-slate-800 text-spanish-yellow font-patriot font-bold rounded-lg border border-spanish-yellow hover:bg-spanish-yellow hover:text-slate-900 transition-all duration-300"
                >
                  Seguir Comprando
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

