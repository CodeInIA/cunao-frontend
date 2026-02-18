import React, { useEffect } from 'react';
import { useShippingConfig } from '../hooks/useShippingConfig';
import { useProductStore } from '../stores/productStore';
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import { useCartStore } from '../stores/cartStore';
import { X, ShoppingBag, Minus, Plus, Trash2, Truck } from 'lucide-react';
import { formatPrice } from '../utils/formatters';
import { OptimizedImage } from './OptimizedImage';
import { getMainProductImage } from '../utils/imageUtils';

export const CartSidebar: React.FC = () => {
  const shippingConfig = useShippingConfig(import.meta.env.VITE_API_URL);
  const { products, fetchProducts, loadingState } = useProductStore();
  const { navigateTo } = useSmartNavigation();
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    updateVariant,
    removeItem,
    getTotalPrice,
    getTotalItems,
  } = useCartStore();

  useEffect(() => {
    // Si el carrito está abierto y no tenemos los productos cargados, los pedimos.
    if (isOpen && products.length === 0 && loadingState !== 'loading') {
      fetchProducts();
    }
    // Bloquear scroll del body cuando el carrito está abierto
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Limpiar al desmontar
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, products.length, fetchProducts, loadingState]);

  const total = getTotalPrice();
  const FREE_SHIPPING_THRESHOLD = shippingConfig.freeShippingThreshold;
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - total;
  const progressPercentage = FREE_SHIPPING_THRESHOLD > 0 ? Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100) : 0;
  const totalItems = getTotalItems();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 animate-fade-in-fast"
        onClick={closeCart}
      />

  {/* Sidebar - Ancho responsivo: full en móvil, md en tablet, más ancho en PC */}
  <div className="fixed right-0 top-0 h-full w-full sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-[45rem] bg-slate-900 z-50 shadow-2xl flex flex-col border-l border-slate-800 animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 shadow-sm shrink-0">
          <h2 className="text-xl font-patriot font-bold text-white">
            Tu Carrito ({totalItems})
          </h2>
          <button 
            onClick={closeCart}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors"
            aria-label="Cerrar carrito"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-2 lg:p-4 scrollbar-spanish">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={64} className="text-slate-600 mb-4" />
              <h3 className="text-xl font-patriot font-bold text-white mb-2">
                Tu carrito está vacío
              </h3>
              <p className="text-slate-400 mb-6">
                ¡Añade algunas camisetas para empezar!
              </p>
              <button
                className="px-6 py-2 bg-spanish-yellow text-slate-900 font-patriot font-bold rounded-lg shadow hover:bg-yellow-400 transition-colors"
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
              {items.map((item) => {
                const product = products.find(p => p.id === item.productId);
                if (!product) {
                  return <div key={item.variantId} className="h-28 lg:h-36 bg-slate-800 rounded-lg animate-pulse"></div>;
                }
                
                const enabledVariants = product.variants?.filter(v => v.is_enabled) || [];
                const enabledOptionIds = new Set(enabledVariants.flatMap(v => v.options));
                const colorOptions = product.options?.find(o => o.type === 'color')?.values.filter(val => enabledOptionIds.has(val.id)) || [];
                const sizeOptions = product.options?.find(o => o.type === 'size')?.values.filter(val => enabledOptionIds.has(val.id)) || [];
                
                // Obtener la imagen correcta para esta variante específica
                const currentVariant = product.variants?.find(v => v.id === item.variantId);
                const currentVariantOutOfStock = currentVariant ? !currentVariant.is_available : false;

                // Determinar qué combinaciones están en stock
                const currentColorId = colorOptions.find(c => c.title === item.color)?.id;
                const currentSizeId = sizeOptions.find(s => s.title === item.size)?.id;
                const isSizeInStock = (sizeTitle: string) => {
                  const sizeId = sizeOptions.find(s => s.title === sizeTitle)?.id;
                  if (!sizeId || !currentColorId) return true;
                  const v = enabledVariants.find(v => v.options.includes(currentColorId) && v.options.includes(sizeId));
                  return v ? v.is_available !== false : false;
                };
                const isColorInStock = (colorTitle: string) => {
                  const colorId = colorOptions.find(c => c.title === colorTitle)?.id;
                  if (!colorId || !currentSizeId) return true;
                  const v = enabledVariants.find(v => v.options.includes(colorId) && v.options.includes(currentSizeId));
                  return v ? v.is_available !== false : false;
                };
                const variantImage = currentVariant
                  ? product.images?.find(img => img.variant_ids.includes(currentVariant.id))
                  : null;
                const imageToUse = variantImage || getMainProductImage(product.images || []);
                
                return (
                  // Contenedor de item: espaciado responsivo
                  <div key={item.variantId} className="flex space-x-4 lg:space-x-6 p-2 md:p-3 bg-slate-800 rounded-lg border border-slate-700 items-start lg:items-center">
                    {/* Imagen: wrapper overflow-hidden con zoom por defecto */}
                    <div className="w-36 h-36 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-52 lg:h-52 xl:w-56 xl:h-56 overflow-hidden rounded-md shrink-0">
                      {imageToUse ? (
                        <OptimizedImage
                          image={imageToUse}
                          alt={item.title}
                          className="w-full h-full object-cover transform scale-110 md:scale-125"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                          <span className="text-slate-400 text-3xl">👕</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0 h-36 sm:h-40 md:h-48 lg:h-52 xl:h-56 pt-2 pb-2">
                      <div>
                        {/* Título y selectores: mantienen su estilo original en PC */}
                        <h4 className="font-patriot font-bold text-white mb-2 line-clamp-2">
                          {item.title}
                        </h4>
                        {currentVariantOutOfStock && (
                          <p className="text-[11px] text-red-400 font-semibold mb-1">⚠ Variante agotada — cambia talla o color</p>
                        )}
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-slate-400 w-10">Talla:</label>
                          <select
                            className={`bg-slate-700 text-white text-xs rounded px-2 py-1 ${currentVariantOutOfStock ? 'ring-1 ring-red-500' : ''}`}
                            value={item.size}
                            onChange={e => updateVariant(item.productId, item.variantId, e.target.value, item.color || '')}
                          >
                            {sizeOptions.map(size => {
                              const inStock = isSizeInStock(size.title);
                              return (
                                <option key={size.id} value={size.title} disabled={!inStock}>
                                  {size.title}{!inStock ? ' (Agotado)' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <label className="text-xs text-slate-400 w-10">Color:</label>
                          <select
                            className={`bg-slate-700 text-white text-xs rounded px-2 py-1 ${currentVariantOutOfStock ? 'ring-1 ring-red-500' : ''}`}
                            value={item.color}
                            onChange={e => updateVariant(item.productId, item.variantId, item.size || '', e.target.value)}
                          >
                            {colorOptions.map(color => {
                              const inStock = isColorInStock(color.title);
                              return (
                                <option key={color.id} value={color.title} disabled={!inStock}>
                                  {color.title}{!inStock ? ' (Agotado)' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        {/* Precio y controles de cantidad: mantienen su estilo original en PC */}
                        <span className="text-lg font-bold text-spanish-yellow">
                          {formatPrice(item.price)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)} disabled={item.quantity <= 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-50"><Minus size={16} /></button>
                          <span className="w-5 text-center font-bold text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)} className="p-1 text-slate-400 hover:text-white"><Plus size={16} /></button>
                          <button onClick={() => removeItem(item.productId, item.variantId)} className="p-1 text-red-500 hover:text-red-400"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                )})}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-800 p-4 bg-slate-900/80 backdrop-blur-sm shrink-0">
            <div className="mb-4 text-center">
              {shippingConfig.loading ? (
                <p className="text-sm text-slate-300 mb-2">Cargando umbral de envío gratuito...</p>
              ) : remainingForFreeShipping > 0 ? (
                <p className="text-sm text-slate-300 mb-2 flex items-center justify-center gap-2">
                  Añade <span className="font-bold text-spanish-yellow">{formatPrice(remainingForFreeShipping)}</span> más para envío gratuito
                  <Truck size={18} className="text-spanish-yellow" />
                </p>
              ) : (
                <p className="text-sm text-green-400 mb-2 flex items-center justify-center gap-2">
                  ¡Tienes envío gratuito!
                  <Truck size={18} className="text-green-400" />
                </p>
              )}
              <div className="h-2 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className={`h-full ${remainingForFreeShipping > 0 ? 'bg-spanish-yellow' : 'bg-green-500'} transition-all duration-500`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-patriot text-white">
                Total
              </span>
              <span className="text-2xl font-bold text-spanish-yellow">
                {formatPrice(total)}
              </span>
            </div>
            <button
              onClick={() => {
                closeCart();
                navigateTo('/checkout');
              }}
              className="w-full py-3 bg-spanish-yellow text-slate-900 font-patriot font-bold rounded-lg shadow hover:bg-yellow-400 transition-colors"
            >
              Finalizar Compra
            </button>
            <button
              onClick={closeCart}
              className="w-full mt-2 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Seguir Comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
};