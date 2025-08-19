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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    country: 'ES',
  });

  const subtotal = getTotalPrice();
  const shippingCost = 5.99; // O puedes calcularlo dinámicamente
  const total = subtotal + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast.loading('Redirigiendo a la pasarela de pago...');

    const shippingAddress = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      address1: formData.address,
      city: formData.city,
      zip: formData.zip,
      country: formData.country,
    };

    try {
      // La función solo necesita los artículos, Stripe se encarga de la dirección.
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
      <div className="container mx-auto max-w-6xl">
        <button onClick={() => navigateTo('/productos')} className="flex items-center gap-2 text-slate-300 hover:text-white mb-8">
          <ArrowLeft size={18} />
          Seguir comprando
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulario de Envío */}
          <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
            <h2 className="text-2xl font-patriot font-bold mb-6">Información de Envío</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <input name="firstName" placeholder="Nombre" onChange={handleInputChange} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-spanish-yellow outline-none" />
                <input name="lastName" placeholder="Apellidos" onChange={handleInputChange} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-spanish-yellow outline-none" />
              </div>
              <input type="email" name="email" placeholder="Correo Electrónico" onChange={handleInputChange} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-spanish-yellow outline-none" />
              <input name="address" placeholder="Dirección" onChange={handleInputChange} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-spanish-yellow outline-none" />
              <div className="grid sm:grid-cols-2 gap-4">
                <input name="city" placeholder="Ciudad" onChange={handleInputChange} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-spanish-yellow outline-none" />
                <input name="zip" placeholder="Código Postal" onChange={handleInputChange} required className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-spanish-yellow outline-none" />
              </div>
              <select name="country" onChange={handleInputChange} value={formData.country} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-spanish-yellow outline-none">
                <option value="ES">España</option>
                {/* Añadir más países si es necesario */}
              </select>
              <button type="submit" disabled={isLoading} className="w-full mt-6 py-4 bg-spanish-yellow text-slate-900 font-patriot font-bold text-lg rounded-lg shadow hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Lock size={18} />
                {isLoading ? 'Procesando...' : `Pagar ${formatPrice(total)}`}
              </button>
            </form>
          </div>

          {/* Resumen del Pedido */}
          <div className="bg-slate-800 p-8 rounded-lg border border-slate-700 self-start">
            <h2 className="text-2xl font-patriot font-bold mb-6">Resumen del Pedido</h2>
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
            <div className="space-y-2">
              <div className="flex justify-between text-slate-300"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-slate-300"><span>Envío</span><span>{formatPrice(shippingCost)}</span></div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-slate-700"><span>Total</span><span className="text-spanish-yellow">{formatPrice(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};