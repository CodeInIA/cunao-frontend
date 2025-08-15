import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { Link } from 'react-router-dom';

export const CartSidebar: React.FC = () => {
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
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Tu Carrito ({totalItems})
            </h2>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag size={64} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-gray-500 mb-6">
                  ¡Añade algunas camisetas cuñaos para empezar!
                </p>
                <Link
                  to="/productos"
                  onClick={closeCart}
                  className="btn-primary"
                >
                  Ver Productos
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variantId}`} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </h4>
                      {item.size && (
                        <p className="text-xs text-gray-500">Talla: {item.size}</p>
                      )}
                      {item.color && (
                        <p className="text-xs text-gray-500">Color: {item.color}</p>
                      )}
                      <p className="text-sm font-semibold text-patriot-red">
                        {item.price.toFixed(2)}€
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Controles de cantidad */}
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </button>
                      
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <Plus size={16} />
                      </button>

                      {/* Eliminar */}
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-md transition-colors ml-2"
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
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-gray-900">
                  Total:
                </span>
                <span className="text-lg font-bold text-patriot-red">
                  {total.toFixed(2)}€
                </span>
              </div>
              
              <div className="space-y-2">
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full btn-primary block text-center"
                >
                  Finalizar Compra
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full btn-secondary"
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

