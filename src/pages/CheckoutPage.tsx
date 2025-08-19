import React, { useState } from 'react';
import { useCartStore } from '../stores/cartStore';
import { apiService } from '../services/api';
import { formatPrice } from '../utils/formatters';
import { Lock, ArrowLeft } from 'lucide-react';
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import toast from 'react-hot-toast';

export const CheckoutPage: React.FC = () => {
  const { items, getTotalPrice, getTotalItems } = useCartStore();
  const { navigateTo } = useSmartNavigation();
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = getTotalPrice();
  // El coste de envío final lo calculará Stripe. Mostramos uno estimado.
  const estimatedShipping = 5.99; 
  const total = subtotal + estimatedShipping;

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    toast.loading('Redirigiendo a la pasarela de pago...');

    try {
      const sessionData = await apiService.createCheckoutSession(items);
      if (sessionData.checkout_url) {
        window.location.href = sessionData.checkout_url;
      } else {
        throw new Error('No se pudo obtener la URL de checkout.');
      }
    } catch (error) {
      console.error('Error al crear la sesión de checkout:', error);
      toast.dismiss();
      toast.error('Hubo un problema al procesar tu pago. Inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  if (getTotalItems() === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-3xl font-patriot text-white mb-4">Tu carrito está vacío</h1>
        <p className="text-slate-400 mb-8">Necesitas añadir productos antes de poder pagar.</p>
        <button
          onClick={() => navigateTo('/productos')}
          className="px-6 py-3 bg-spanish-yellow text-slate-900 font-bold rounded-lg shadow hover:bg-yellow-400 transition-colors"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <button onClick={() => navigateTo('/productos')} className="flex items-center gap-2 text-slate-300 hover:text-white mb-8">
          <ArrowLeft size={18} />
          Seguir comprando
        </button>

        <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
          <h2 className="text-3xl font-patriot font-bold mb-6 text-center">Resumen del Pedido</h2>
          
          <div className="space-y-4 mb-6 border-b border-slate-700 pb-6">
            {items.map(item => (
              <div key={item.variantId} className="flex items-center gap-4">
                <div className="relative">
                  <img src={item.image} alt={item.title} className="w-16 h-16 rounded-md object-cover border-2 border-slate-600" />
                  <span className="absolute -top-2 -right-2 bg-spanish-yellow text-slate-900 text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{item.quantity}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold line-clamp-1">{item.title}</p>
                  <p className="text-sm text-slate-400">{item.size} / {item.color}</p>
                </div>
                <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 mb-8">
            <div className="flex justify-between text-slate-300"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-slate-300"><span>Envío (estimado)</span><span>{formatPrice(estimatedShipping)}</span></div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t border-slate-700"><span>Total (aprox.)</span><span className="text-spanish-yellow">{formatPrice(total)}</span></div>
          </div>

          <button onClick={handleProceedToPayment} disabled={isLoading} className="w-full py-4 bg-spanish-yellow text-slate-900 font-patriot font-bold text-lg rounded-lg shadow hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Lock size={18} />
            {isLoading ? 'Procesando...' : 'Proceder al Pago'}
          </button>
        </div>
      </div>
    </div>
  );
};