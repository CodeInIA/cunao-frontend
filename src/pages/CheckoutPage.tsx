import React, { useState, useEffect, useCallback } from 'react';
import { useShippingConfig } from '../hooks/useShippingConfig';
import { useCartStore } from '../stores/cartStore';
import { apiService } from '../services/api';
import { formatPrice } from '../utils/formatters';
import { Lock, ArrowLeft, MapPin, ChevronDown, Check } from 'lucide-react'; // Importaciones añadidas
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import { getConsent } from '../utils/consent';

// Import dynamic tracking helper
import { trackEvent } from '../hooks/useGtag';
import toast from 'react-hot-toast';
import { Listbox } from '@headlessui/react'; // Importación de Headless UI
import { getWebPImageUrl } from '../utils/imageUtils';

type ShippingRegion = 'spain' | 'europa' | '';

// Pequeño componente auxiliar para las opciones del Listbox para no repetir código
const shippingOptions = [
  { id: 'spain', name: 'España' },
  { id: 'europa', name: 'Resto de Europa (UE, no incluye España)' },
];

export const CheckoutPage: React.FC = () => {
  const shippingConfig = useShippingConfig(import.meta.env.VITE_API_URL);
  const { items, getTotalPrice, getTotalItems } = useCartStore();
  const { navigateTo } = useSmartNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [shippingRegion, setShippingRegion] = useState<ShippingRegion>('');
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [emailMarketing, setEmailMarketing] = useState(true); // Activado por defecto
  
  // Estados para el código de descuento
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    percentage: number;
    amount: number;
    finalTotal: number;
    appliesTo?: 'subtotal' | 'shipping';
  } | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState('');

  const subtotal = getTotalPrice();
  const FREE_SHIPPING_THRESHOLD = shippingConfig.freeShippingThreshold;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  
  // Calcular total y envío considerando descuento
  const shippingAfterDiscount = (() => {
    if (isFreeShipping) return 0;
    if (!appliedDiscount) return shippingCost ?? 0;
    if (appliedDiscount.appliesTo === 'shipping') {
      // Si tenemos shippingCost y un porcentaje, recalcular a partir del porcentaje para evitar usar un importe absoluto viejo
      if (typeof shippingCost === 'number' && typeof appliedDiscount.percentage === 'number') {
        const discountAmount = Math.round(((shippingCost) * appliedDiscount.percentage) / 100 * 100) / 100;
        return Math.max(0, shippingCost - discountAmount);
      }
      return Math.max(0, (shippingCost ?? 0) - appliedDiscount.amount);
    }
    return shippingCost ?? 0;
  })();

  const total = appliedDiscount ? appliedDiscount.finalTotal : (isFreeShipping ? subtotal : subtotal + (shippingCost ?? 0));

  // Función para validar código de descuento
  const validateDiscountCode = useCallback(async (silent: boolean = false) => {
    if (!discountCode.trim()) {
      if (!silent) {
        setDiscountError('Introduce un código de descuento');
      }
      return;
    }

    setIsValidatingDiscount(true);
    setDiscountError('');

    try {
      // No enviar shippingCost si aún no se ha seleccionado región (shippingCost === null)
      const response = await apiService.validateDiscountCode(
        discountCode.trim(),
        subtotal,
        typeof shippingCost === 'number' ? shippingCost : undefined
      );

      if (response.success && response.data?.isValid) {
        // Si el backend indica que falta el coste de envío para calcular el descuento de envío
        if (response.data.message && response.data.message.includes('Selecciona la región de envío')) {
          setDiscountError(response.data.message);
          setAppliedDiscount(null);
        } else {
          setAppliedDiscount({
            code: discountCode.trim(),
            percentage: response.data.discountPercentage!,
            amount: response.data.discountAmount!,
            finalTotal: response.data.finalTotal!,
            appliesTo: response.data.appliesTo
          });
          const appliesTo = response.data.appliesTo || 'subtotal';
          if (!silent) {
            toast.success((response.data.message ? response.data.message + ' ' : '') + (appliesTo === 'shipping' ? 'Se ha aplicado al envío.' : 'Se ha aplicado al subtotal.'));
          }
        }
      } else {
        setDiscountError(response.data?.message || 'Código de descuento no válido');
        setAppliedDiscount(null);
      }
    } catch (error) {
      console.error('Error validando descuento:', error);
      if (!silent) {
        setDiscountError('Error al validar el código de descuento');
      }
      setAppliedDiscount(null);
    } finally {
      setIsValidatingDiscount(false);
    }
  }, [discountCode, subtotal, shippingCost]);

  // Función para remover descuento
  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };

  useEffect(() => {
    if (shippingConfig.loading) return;
    if (isFreeShipping) {
      setShippingCost(0);
      return;
    }
    if (!shippingRegion) {
      setShippingCost(null);
      return;
    }
    let cost = 0;
    switch (shippingRegion) {
      case 'spain':
        cost = shippingConfig.shippingCostSpain;
        break;
      case 'europa':
        cost = shippingConfig.shippingCostEuropa;
        break;
      default:
        setShippingCost(null);
        return;
    }
    setShippingCost(cost);
  }, [shippingRegion, isFreeShipping, subtotal, shippingConfig]);

  // Si hay un descuento aplicado, revalidarlo silenciosamente si cambia el coste de envío
  useEffect(() => {
    // No revalidar si no hay un código de descuento aplicado.
    if (!appliedDiscount?.code) {
      return;
    }
    // No revalidar si el coste de envío no está determinado todavía.
    if (typeof shippingCost !== 'number' || shippingConfig.loading) {
      return;
    }

    // Revalidar en backend en background (silent=true) para mantener el valor actualizado y autoritativo
    validateDiscountCode(true).catch(err => console.error('Error revalidando descuento tras cambio de coste de envío:', err));
  }, [shippingCost, appliedDiscount?.code, shippingConfig.loading, validateDiscountCode]);

  // Mostrar aviso cerca del selector si el descuento requiere seleccionar región
  const discountRequiresRegion = Boolean(discountError && discountError.includes('Selecciona la región de envío'));

  const handleProceedToPayment = async () => {
    if (!shippingRegion) {
      toast.error('Por favor, selecciona tu región de envío.');
      return;
    }
    setIsLoading(true);
    toast.loading('Redirigiendo a la pasarela de pago...');

    try {
      // Track begin_checkout if consent
      try {
        const consent = getConsent();
        if (consent?.analytics) {
          trackEvent('begin_checkout', {
            currency: 'EUR',
            value: subtotal,
            items: items.map(i => ({ id: i.productId, name: i.title, price: i.price, quantity: i.quantity }))
          });
        }
      } catch (e) {
        console.warn('begin_checkout tracking failed', e);
      }
      const sessionData = await apiService.createCheckoutSession(
        items,
        shippingRegion,
        emailMarketing,
        appliedDiscount?.code,
        appliedDiscount?.appliesTo
      );
      if (sessionData.checkout_url) {
        // Track add_payment_info (user is being redirected to payment)
        try {
          const consent = getConsent();
          if (consent?.analytics) {
            trackEvent('add_payment_info', {
              currency: 'EUR',
              value: subtotal,
              items: items.map(i => ({ id: i.productId, name: i.title, price: i.price, quantity: i.quantity }))
            });
          }
        } catch (e) {
          console.warn('add_payment_info tracking failed', e);
        }
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
                  <img 
                    src={getWebPImageUrl(item.image)} 
                    alt={item.title} 
                    className="w-16 h-16 rounded-md object-cover border-2 border-slate-600" 
                  />
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

          {/* Selector de Envío con Headless UI */}
          <div className="mb-6">
            {isFreeShipping && (
              <div className="bg-green-900 border border-green-700 text-green-300 text-sm rounded-lg p-3 mb-4 text-center">
                ¡Felicidades! Has conseguido <span className="font-bold">envío gratuito</span>.
              </div>
            )}
            <label className="flex items-center gap-2 text-slate-300 mb-2 font-semibold">
              <MapPin size={18} />
              {isFreeShipping ? 'Confirma tu región de envío' : 'Selecciona tu región de envío'}
            </label>
            
            <Listbox value={shippingRegion} onChange={setShippingRegion}>
              <div className="relative">
                <Listbox.Button 
                  className={`relative w-full cursor-default rounded-md border-2 py-3 pl-4 pr-10 text-left transition-colors
                    bg-slate-800 text-white border-slate-600
                    focus:outline-none focus:border-spanish-yellow
                  `}
                >
                  <span className="block truncate">
                    {shippingOptions.find(opt => opt.id === shippingRegion)?.name || '-- Elige una opción --'}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm border border-slate-700">
                  {shippingOptions.map((option) => (
                    <Listbox.Option
                      key={option.id}
                      value={option.id}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? 'bg-spanish-yellow text-slate-900' : 'text-white'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                            {option.name}
                          </span>
                          {selected ? (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              <Check className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>

          </div>

          {/* Sección de código de descuento */}
          <div className="mb-6 p-5 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl border border-slate-500 shadow-lg">
            <h3 className="text-lg font-semibold text-white mb-4">¿Tienes un código de descuento?</h3>
            
            {!appliedDiscount ? (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    placeholder="Introduce tu código"
                    className="w-full sm:flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-spanish-yellow focus:border-transparent"
                    disabled={isValidatingDiscount}
                  />
                  <button
                    onClick={() => validateDiscountCode(false)}
                    disabled={isValidatingDiscount || !discountCode.trim()}
                    className="w-full sm:w-auto px-6 py-3 bg-spanish-yellow text-slate-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    {isValidatingDiscount ? 'Validando...' : 'Aplicar'}
                  </button>
                </div>
                {discountError && (
                  <p className="text-red-400 text-sm">{discountError}</p>
                )}
              </div>
            ) : (
              <div className="bg-green-900/50 border border-green-500 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-green-400" />
                      <span className="font-semibold text-green-400">Código aplicado: {appliedDiscount.code}</span>
                    </div>
                    <p className="text-green-300 text-sm mt-1">
                      {appliedDiscount.percentage}% de descuento (-{formatPrice(appliedDiscount.amount)})
                    </p>
                  </div>
                  <button
                    onClick={removeDiscount}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 mb-8">
            <div className="flex justify-between text-slate-300"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            
            {appliedDiscount && (
              <div className="flex justify-between text-green-400">
                <span>Descuento ({appliedDiscount.code}) {appliedDiscount.appliesTo === 'shipping' ? '— aplicado al envío' : ''}</span>
                <span>-{formatPrice(appliedDiscount.amount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-300">
              <span>Envío</span>
              {shippingConfig.loading ? (
                <span>Cargando...</span>
              ) : isFreeShipping ? (
                <span className="font-semibold text-green-400">Gratis</span>
              ) : (
                <span>{shippingCost !== null ? formatPrice(shippingAfterDiscount) : 'Selecciona una región'}</span>
              )}
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t border-slate-700">
              <span>Total</span>
              <span className="text-spanish-yellow">
                {shippingConfig.loading
                  ? 'Cargando...'
                  : (!isFreeShipping && shippingCost === null 
                    ? `${formatPrice(subtotal)} + envío` 
                    : formatPrice(total))}
              </span>
            </div>
          </div>

          {/* Checkbox de email marketing */}
          <div className="mb-6 p-5 bg-gradient-to-r from-slate-700 to-slate-600 rounded-xl border border-slate-500 shadow-lg">
            <label className="flex items-start gap-4 cursor-pointer">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={emailMarketing}
                  onChange={(e) => setEmailMarketing(e.target.checked)}
                  className="sr-only"
                />
                <div className={`
                  w-6 h-6 rounded-lg border-2 transition-all duration-300 ease-in-out
                  ${emailMarketing 
                    ? 'bg-gradient-to-br from-spanish-yellow to-yellow-400 border-spanish-yellow shadow-lg shadow-yellow-400/30' 
                    : 'bg-slate-800 border-slate-400'
                  }
                  relative overflow-hidden
                `}>
                  {emailMarketing && (
                    <Check className="absolute inset-0 w-4 h-4 text-slate-900 m-auto animate-in zoom-in-50 duration-200" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-semibold text-white">
                    Acepto recibir newsletter, ofertas y promociones exclusivas por email
                  </span>
                  <div className="px-2 py-0.5 bg-spanish-yellow/20 text-spanish-yellow text-xs font-medium rounded-full border border-spanish-yellow/30">
                    Recomendado
                  </div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Te enviaremos nuestra newsletter semanal, descuentos, nuevas camisetas cuñao y ofertas especiales. 
                  Puedes cancelar tu suscripción en cualquier momento.
                </p>
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    Sin spam
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    Cancelación fácil
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    Ofertas exclusivas
                  </span>
                </div>
              </div>
            </label>
          </div>

          <button onClick={handleProceedToPayment} disabled={isLoading || !shippingRegion || (!isFreeShipping && shippingCost === null)} className="w-full py-4 bg-spanish-yellow text-slate-900 font-patriot font-bold text-lg rounded-lg shadow hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Lock size={18} />
            {isLoading ? 'Procesando...' : 'Proceder al Pago'}
          </button>
        </div>
      </div>
    </div>
  );
};