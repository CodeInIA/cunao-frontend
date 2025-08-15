import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, Clock, MapPin, RefreshCw, Euro, AlertCircle, CheckCircle } from 'lucide-react';
import config from '../config';

export const ShippingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-viking-600 via-viking-500 to-viking-400 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Truck className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Envíos y Devoluciones
          </h1>
          <p className="text-xl md:text-2xl font-vikingo max-w-3xl mx-auto">
            "En mi pueblo los paquetes llegan cuando tienen que llegar"
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        
        {/* Información de envíos */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          
          {/* Envíos */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Package className="w-8 h-8 text-viking-600" />
              Información de Envíos
            </h2>

            {/* Plazos de entrega */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-viking-600 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Plazos de Entrega
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇪🇸</span>
                    <span className="font-medium">España Peninsular</span>
                  </div>
                  <span className="text-viking-600 font-semibold">2-4 días</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏝️</span>
                    <span className="font-medium">Islas Baleares</span>
                  </div>
                  <span className="text-viking-600 font-semibold">3-5 días</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌴</span>
                    <span className="font-medium">Islas Canarias</span>
                  </div>
                  <span className="text-viking-600 font-semibold">5-7 días</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇪🇺</span>
                    <span className="font-medium">Europa (UE)</span>
                  </div>
                  <span className="text-viking-600 font-semibold">5-10 días</span>
                </div>
              </div>
            </div>

            {/* Costos de envío */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-viking-600 mb-4 flex items-center gap-2">
                <Euro className="w-5 h-5" />
                Costos de Envío
              </h3>
              
              <div className="bg-viking-50 border border-viking-200 rounded-lg p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">España Peninsular</span>
                    <span className="font-semibold text-viking-700">5,99€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Islas Baleares</span>
                    <span className="font-semibold text-viking-700">7,99€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Islas Canarias</span>
                    <span className="font-semibold text-viking-700">9,99€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Europa (UE)</span>
                    <span className="font-semibold text-viking-700">12,99€</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-viking-300">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Envío GRATIS en pedidos superiores a 50€</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Proceso de envío */}
            <div>
              <h3 className="text-xl font-semibold text-viking-600 mb-4">
                ¿Cómo Funciona el Envío?
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-viking-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Confirmas tu Pedido</h4>
                    <p className="text-gray-600 text-sm">Recibes email de confirmación inmediatamente</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-viking-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Preparamos tu Camiseta</h4>
                    <p className="text-gray-600 text-sm">Impresión y preparación en 1-2 días laborables</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-viking-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Enviamos tu Pedido</h4>
                    <p className="text-gray-600 text-sm">Recibes número de seguimiento por email</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-viking-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">¡Disfrutas tu Camiseta vikingo!</h4>
                    <p className="text-gray-600 text-sm">Lista para lucir tus opiniones</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Devoluciones */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-6 flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-viking-600" />
              Devoluciones y Cambios
            </h2>

            {/* Derecho de desistimiento */}
            <div className="mb-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  14 Días de Garantía
                </h3>
                <p className="text-green-700">
                  Tienes 14 días desde la recepción para devolver tu producto 
                  sin necesidad de justificación.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-viking-600 mb-4">
                Condiciones para Devoluciones
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Producto en estado original, sin usar</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Con todas las etiquetas originales</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">En su embalaje original</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Sin lavados ni alteraciones</span>
                </div>
              </div>
            </div>

            {/* Proceso de devolución */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-viking-600 mb-4">
                ¿Cómo Hacer una Devolución?
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Contáctanos</h4>
                    <p className="text-gray-600 text-sm">
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
                    <h4 className="font-semibold text-gray-900">Autorización</h4>
                    <p className="text-gray-600 text-sm">Te enviamos las instrucciones y etiqueta de devolución</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Envío</h4>
                    <p className="text-gray-600 text-sm">Envías el producto siguiendo nuestras instrucciones</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Reembolso</h4>
                    <p className="text-gray-600 text-sm">Procesamos el reembolso en 5-7 días laborables</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información importante */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Información Importante
              </h3>
              <ul className="text-yellow-700 text-sm space-y-1">
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
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-6 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-viking-600" />
            Seguimiento de Pedidos
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-viking-600 mb-4">
                ¿Cómo Seguir tu Pedido?
              </h3>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  Una vez que tu pedido salga de nuestras instalaciones, recibirás un email 
                  con el número de seguimiento y enlace directo para trackear tu paquete.
                </p>
                
                <div className="bg-viking-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-viking-700 mb-2">Estados del Pedido:</h4>
                  <ul className="space-y-1 text-gray-700 text-sm">
                    <li>🔄 <strong>Procesando:</strong> Preparando tu camiseta</li>
                    <li>📦 <strong>Enviado:</strong> En camino hacia ti</li>
                    <li>🚛 <strong>En tránsito:</strong> En manos del transportista</li>
                    <li>📬 <strong>En reparto:</strong> Último tramo del viaje</li>
                    <li>✅ <strong>Entregado:</strong> ¡Ya tienes tu camiseta vikingo!</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-viking-600 mb-4">
                ¿Problemas con tu Pedido?
              </h3>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-700 mb-2">Pedido Retrasado</h4>
                  <p className="text-red-700 text-sm">
                    Si han pasado más días de los indicados, contáctanos con tu número de pedido.
                  </p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-700 mb-2">Producto Defectuoso</h4>
                  <p className="text-red-700 text-sm">
                    Envía fotos del problema y te enviamos reposición inmediata.
                  </p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-700 mb-2">Dirección Incorrecta</h4>
                  <p className="text-red-700 text-sm">
                    Si aún no se ha enviado, podemos cambiar la dirección. ¡Avísanos rápido!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preguntas frecuentes */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-display font-bold text-gray-900 mb-6">
            Preguntas Frecuentes
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-viking-600 mb-2">
                  ¿Puedo cambiar mi dirección de envío?
                </h3>
                <p className="text-gray-700 text-sm">
                  Solo si el pedido aún no ha sido procesado. Contáctanos inmediatamente tras realizar el pedido.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-viking-600 mb-2">
                  ¿Qué pasa si no estoy en casa?
                </h3>
                <p className="text-gray-700 text-sm">
                  El transportista dejará un aviso y reintentará la entrega. También puedes recogerlo en punto de recogida.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-viking-600 mb-2">
                  ¿Hacéis envíos internacionales?
                </h3>
                <p className="text-gray-700 text-sm">
                  Actualmente solo enviamos a España y países de la Unión Europea.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-viking-600 mb-2">
                  ¿Puedo devolver por talla incorrecta?
                </h3>
                <p className="text-gray-700 text-sm">
                  Sí, puedes cambiar por otra talla dentro de los 14 días. Consulta nuestra guía de tallas antes de comprar.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-viking-600 mb-2">
                  ¿Cuándo se cobra el pedido?
                </h3>
                <p className="text-gray-700 text-sm">
                  El cobro se realiza en el momento de confirmar el pedido, antes del envío.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-viking-600 mb-2">
                  ¿Emitís factura?
                </h3>
                <p className="text-gray-700 text-sm">
                  Sí, se incluye automáticamente en el paquete. Para empresas, contacta para factura personalizada.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contacto para envíos */}
        <div className="bg-viking-50 border border-viking-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-display font-bold text-viking-700 mb-4">
            ¿Más Dudas sobre Envíos?
          </h2>
          <p className="text-viking-600 mb-6">
            "En mi pueblo siempre ayudamos con las dudas"
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contacto"
              className="inline-flex items-center px-6 py-3 bg-viking-600 text-white font-semibold rounded-lg hover:bg-viking-700 transition-colors"
            >
              <Package className="w-4 h-4 mr-2" />
              Contactar Sobre Envíos
            </Link>
            
            <a
              href={`mailto:${config.EMAILS.shipping}`}
              className="inline-flex items-center px-6 py-3 bg-white text-viking-600 border-2 border-viking-600 font-semibold rounded-lg hover:bg-viking-600 hover:text-white transition-colors"
            >
              {config.EMAILS.shipping}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

