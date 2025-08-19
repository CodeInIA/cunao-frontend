import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, Clock, MapPin, RefreshCw, Euro, AlertCircle, CheckCircle } from 'lucide-react';
import config from '../config';
import { useSmartNavigation } from '../hooks/useSmartNavigation';

export const ShippingPage: React.FC = () => {
  const { navigateTo } = useSmartNavigation();
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-spanish-red via-slate-800 to-slate-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Truck className="w-16 h-16 mx-auto mb-6 text-spanish-yellow" />
          <h1 className="text-4xl md:text-6xl font-patriot font-bold mb-6">
            Envíos y Devoluciones
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-slate-200">
            "En mi pueblo los paquetes llegan cuando tienen que llegar"
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        
        {/* Información de envíos */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          
          {/* Envíos */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-patriot font-bold text-white mb-6 flex items-center gap-3">
              <Package className="w-8 h-8 text-spanish-red" />
              Información de Envíos
            </h2>

            {/* Plazos de entrega */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-spanish-yellow mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Plazos de Entrega
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-700 border border-slate-600 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇪🇸</span>
                    <span className="font-medium text-white">España Peninsular</span>
                  </div>
                  <span className="text-spanish-red font-semibold">2-4 días</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700 border border-slate-600 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏝️</span>
                    <span className="font-medium text-white">Islas Baleares</span>
                  </div>
                  <span className="text-spanish-red font-semibold">3-5 días</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700 border border-slate-600 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌴</span>
                    <span className="font-medium text-white">Islas Canarias</span>
                  </div>
                  <span className="text-spanish-red font-semibold">5-7 días</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700 border border-slate-600 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇪🇺</span>
                    <span className="font-medium text-white">Europa (UE)</span>
                  </div>
                  <span className="text-spanish-red font-semibold">5-10 días</span>
                </div>
              </div>
            </div>

            {/* Costos de envío */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-spanish-yellow mb-4 flex items-center gap-2">
                <Euro className="w-5 h-5" />
                Costos de Envío
              </h3>
              
              <div className="bg-slate-700 border border-slate-600 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">España Peninsular</span>
                    <span className="font-semibold text-spanish-yellow">{import.meta.env.VITE_SHIPPING_COST_PENINSULA}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Islas Baleares</span>
                    <span className="font-semibold text-spanish-yellow">{import.meta.env.VITE_SHIPPING_COST_BALEARES}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Islas Canarias</span>
                    <span className="font-semibold text-spanish-yellow">{import.meta.env.VITE_SHIPPING_COST_CANARIAS}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Europa (UE)</span>
                    <span className="font-semibold text-spanish-yellow">{import.meta.env.VITE_SHIPPING_COST_EUROPA}€</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-500">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Envío GRATIS en pedidos superiores a {import.meta.env.VITE_FREE_SHIPPING_THRESHOLD}€</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Proceso de envío */}
            <div>
              <h3 className="text-xl font-semibold text-spanish-yellow mb-4">
                ¿Cómo Funciona el Envío?
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-spanish-red text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Confirmas tu Pedido</h4>
                    <p className="text-slate-300 text-sm">Recibes email de confirmación inmediatamente</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-spanish-red text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Preparamos tu Camiseta</h4>
                    <p className="text-slate-300 text-sm">Impresión y preparación en 1-2 días laborables</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-spanish-red text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Enviamos tu Pedido</h4>
                    <p className="text-slate-300 text-sm">Recibes número de seguimiento por email</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-spanish-red text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">¡Disfrutas tu Camiseta cuñao!</h4>
                    <p className="text-slate-300 text-sm">Lista para lucir tus opiniones</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Devoluciones */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-patriot font-bold text-white mb-6 flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-spanish-red" />
              Devoluciones y Cambios
            </h2>

            {/* Derecho de desistimiento */}
            <div className="mb-8">
              <div className="bg-green-900 border border-green-700 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-green-400 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  14 Días de Garantía
                </h3>
                <p className="text-green-300">
                  Tienes 14 días desde la recepción para devolver tu producto 
                  sin necesidad de justificación.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-spanish-yellow mb-4">
                Condiciones para Devoluciones
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Producto en estado original, sin usar</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Con todas las etiquetas originales</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">En su embalaje original</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-white">Sin lavados ni alteraciones</span>
                </div>
              </div>
            </div>

            {/* Proceso de devolución */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-spanish-yellow mb-4">
                ¿Cómo Hacer una Devolución?
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Contáctanos</h4>
                    <p className="text-slate-300 text-sm">
                      Email: {config.EMAILS.returns}<br />
                      Incluye: número de pedido y motivo de devolución
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Autorización</h4>
                    <p className="text-slate-300 text-sm">Te enviamos las instrucciones y etiqueta de devolución</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Envío</h4>
                    <p className="text-slate-300 text-sm">Envías el producto siguiendo nuestras instrucciones</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Reembolso</h4>
                    <p className="text-slate-300 text-sm">Procesamos el reembolso en 5-7 días laborables</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información importante */}
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Información Importante
              </h3>
              <ul className="text-yellow-300 text-sm space-y-1">
                <li>• Los gastos de devolución corren a cargo del cliente</li>
                <li>• El reembolso se realiza por el mismo método de pago</li>
                <li>• No se reembolsan los gastos de envío originales</li>
                <li>• Productos personalizados no admiten devolución</li>
                <li>• En caso de defecto, asumimos todos los gastos</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sección de seguimiento */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-patriot font-bold text-white mb-6 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-spanish-red" />
            Seguimiento de Pedidos
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-spanish-yellow mb-4">
                ¿Cómo Seguir tu Pedido?
              </h3>
              
              <div className="space-y-4">
                <p className="text-slate-300">
                  Una vez que tu pedido salga de nuestras instalaciones, recibirás un email 
                  con el número de seguimiento y enlace directo para trackear tu paquete.
                </p>
                
                <div className="bg-slate-700 border border-slate-600 p-4 rounded-lg">
                  <h4 className="font-semibold text-spanish-yellow mb-2">Estados del Pedido:</h4>
                  <ul className="space-y-1 text-slate-300 text-sm">
                    <li>🔄 <strong>Procesando:</strong> Preparando tu camiseta</li>
                    <li>📦 <strong>Enviado:</strong> En camino hacia ti</li>
                    <li>🚛 <strong>En tránsito:</strong> En manos del transportista</li>
                    <li>📬 <strong>En reparto:</strong> Último tramo del viaje</li>
                    <li>✅ <strong>Entregado:</strong> ¡Ya tienes tu camiseta cuñao!</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-spanish-yellow mb-4">
                ¿Problemas con tu Pedido?
              </h3>
              
              <div className="space-y-4">
                <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-2">Pedido Retrasado</h4>
                  <p className="text-red-300 text-sm">
                    Si han pasado más días de los indicados, contáctanos con tu número de pedido.
                  </p>
                </div>
                
                <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-2">Producto Defectuoso</h4>
                  <p className="text-red-300 text-sm">
                    Envía fotos del problema y te enviamos reposición inmediata.
                  </p>
                </div>
                
                <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                  <h4 className="font-semibold text-red-400 mb-2">Dirección Incorrecta</h4>
                  <p className="text-red-300 text-sm">
                    Si aún no se ha enviado, podemos cambiar la dirección. ¡Avísanos rápido!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preguntas frecuentes */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-patriot font-bold text-white mb-6">
            Preguntas Frecuentes
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-spanish-red mb-2">
                  ¿Puedo cambiar mi dirección de envío?
                </h3>
                <p className="text-slate-300 text-sm">
                  Solo si el pedido aún no ha sido procesado. Contáctanos inmediatamente tras realizar el pedido.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-spanish-red mb-2">
                  ¿Qué pasa si no estoy en casa?
                </h3>
                <p className="text-slate-300 text-sm">
                  El transportista dejará un aviso y reintentará la entrega. También puedes recogerlo en punto de recogida.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-spanish-red mb-2">
                  ¿Hacéis envíos internacionales?
                </h3>
                <p className="text-slate-300 text-sm">
                  Actualmente solo enviamos a España y países de la Unión Europea.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-spanish-red mb-2">
                  ¿Puedo devolver por talla incorrecta?
                </h3>
                <p className="text-slate-300 text-sm">
                  Sí, puedes cambiar por otra talla dentro de los 14 días. Consulta nuestra guía de tallas antes de comprar.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-spanish-red mb-2">
                  ¿Cuándo se cobra el pedido?
                </h3>
                <p className="text-slate-300 text-sm">
                  El cobro se realiza en el momento de confirmar el pedido, antes del envío.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-spanish-red mb-2">
                  ¿Emitís factura?
                </h3>
                <p className="text-slate-300 text-sm">
                  Sí, se incluye automáticamente en el paquete. Para empresas, contacta para factura personalizada.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contacto para envíos */}
        <div className="bg-slate-800 border border-spanish-yellow rounded-lg p-8 text-center">
          <h2 className="text-2xl font-patriot font-bold text-spanish-yellow mb-4">
            ¿Más Dudas sobre Envíos?
          </h2>
          <p className="text-spanish-yellow mb-6 italic">
            "En mi pueblo siempre ayudamos con las dudas"
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigateTo('/contacto')}
              className="inline-flex items-center px-6 py-3 bg-spanish-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors border-none cursor-pointer"
            >
              <Package className="w-4 h-4 mr-2" />
              Contactar Sobre Envíos
            </button>
            
            <a
              href={`mailto:${config.EMAILS.shipping}`}
              className="inline-flex items-center px-6 py-3 bg-slate-700 text-spanish-yellow border-2 border-spanish-red font-semibold rounded-lg hover:bg-spanish-red hover:text-white transition-colors"
            >
              {config.EMAILS.shipping}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

