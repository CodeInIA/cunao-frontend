import React from 'react';
import { useShippingConfig } from '../hooks/useShippingConfig';
import { Link } from 'react-router-dom';
import { Truck, Package, Clock, MapPin, RefreshCw, Euro, AlertCircle, CheckCircle } from 'lucide-react';
import config from '../config';
import { useSmartNavigation } from '../hooks/useSmartNavigation';

export const ShippingPage: React.FC = () => {
  const shippingConfig = useShippingConfig(config.API_URL);
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
        
        {/* Fecha de actualización */}
        <div className="text-center mb-8">
          <p className="text-slate-400">
            <strong>Última actualización:</strong> 23 de septiembre de 2025
          </p>
        </div>
        
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
                    <span className="font-medium text-white">España</span>
                  </div>
                  <span className="text-spanish-red font-semibold">2-7 días laborables</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-slate-700 border border-slate-600 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🇪🇺</span>
                    <span className="font-medium text-white">Europa (UE)</span>
                  </div>
                  <span className="text-spanish-red font-semibold">5-10 días laborables</span>
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
                    <span className="text-white font-medium">España</span>
                    <span className="font-semibold text-spanish-yellow">
                      {shippingConfig.loading ? 'Cargando...' : `${shippingConfig.shippingCostSpain}€`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">Europa (UE)</span>
                    <span className="font-semibold text-spanish-yellow">
                      {shippingConfig.loading ? 'Cargando...' : `${shippingConfig.shippingCostEuropa}€`}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-500">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">
                      {shippingConfig.loading
                        ? 'Cargando...'
                        : `Envío GRATIS en pedidos superiores a ${shippingConfig.freeShippingThreshold}€`}
                    </span>
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

          {/* Devoluciones adaptadas a Print‑On‑Demand */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-8">
            <h2 className="text-3xl font-patriot font-bold text-white mb-6 flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-spanish-red" />
              Devoluciones y Reclamaciones
            </h2>

            <div className="mb-6">
              <p className="text-slate-300">
                Nuestros productos se fabrican bajo demanda mediante proveedores externos. Por este motivo <strong>no realizamos devoluciones por desistimiento o por cambio de opinión</strong> en productos fabricados bajo pedido.
              </p>
              <p className="text-slate-300 mt-3 text-sm">
                <strong>Base legal:</strong> De acuerdo con el art. 103.c del Real Decreto Legislativo 1/2007, los productos confeccionados conforme a las especificaciones del consumidor o claramente personalizados quedan excluidos del derecho de desistimiento.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-spanish-yellow mb-3">Qué sí cubrimos</h3>
              <ul className="space-y-2 text-slate-200 text-sm">
                <li>• Defectos de fabricación (impresión incorrecta, costuras sueltas, material defectuoso).</li>
                <li>• Producto distinto al pedido o faltantes atribuibles a la preparación/envío.</li>
                <li>• Producto seriamente dañado en tránsito, siempre que se aporte la prueba requerida.</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-spanish-yellow mb-3">Requisitos obligatorios para tramitar la reclamación</h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-200 text-sm">
                <li>Contactar en un plazo máximo: <strong>7 días</strong> desde la recepción para daños por transporte o <strong>14 días</strong> para defectos de fabricación, a: <a className="text-spanish-yellow underline" href={`mailto:${config.EMAILS.returns}`}>{config.EMAILS.returns}</a>.</li>
                <li>Enviar un <strong>vídeo</strong> (unboxing) donde se muestre el paquete cerrado y la apertura por primera vez, la etiqueta/envelope con número de seguimiento y el producto tal y como se extrae del paquete. Adjuntar además fotografías en alta resolución.</li>
                <li>No utilizar, lavar ni alterar el producto hasta recibir instrucciones. Conservar embalaje y etiquetas.</li>
                <li>Indicar número de pedido, fecha de recepción y descripción del defecto.</li>
              </ol>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-spanish-yellow mb-3">Gastos de envío en devoluciones</h3>
              <p className="text-slate-200 text-sm">
                Los gastos de devolución correrán a cargo del cliente salvo que, tras nuestra evaluación, confirmemos que se trata de un defecto de fabricación o un error imputable a nosotros o al proveedor. En ese caso, aceptaremos y cubriremos los costes razonables de devolución o gestionaremos la reposición.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-spanish-yellow mb-3">Plazo y resolución</h3>
              <p className="text-slate-200 text-sm">
                Tras recibir la reclamación y las pruebas solicitadas realizaremos una evaluación en un plazo de hasta <strong>10–14 días hábiles</strong>. Si la reclamación se admite, ofreceremos, a nuestra elección y según disponibilidad: reposición, reparación o reembolso total/parcial. El reembolso se realizará por el mismo método de pago y puede tardar hasta 14 días laborables en reflejarse.
              </p>
            </div>

            <div className="mb-6 bg-yellow-900 border border-yellow-700 rounded-lg p-6">
              <h3 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Información clave
              </h3>
              <ul className="text-yellow-300 text-sm space-y-1">
                <li>• No aceptamos devoluciones por cambio de opinión en nuestros productos.</li>
                <li>• Vídeo unboxing obligatorio para tramitar cualquier reclamación por defecto o daño.</li>
                <li>• Conserva embalaje y etiquetas hasta resolver la reclamación.</li>
                <li>• Productos personalizados no son retornables salvo defecto de fabricación.</li>
                <li>• Nos reservamos el derecho a solicitar la devolución para inspección por el proveedor antes de autorizar reembolso.</li>
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
                <p className="text-slate-300 text-sm">
                  <strong>Nota:</strong> en algunos casos puede que se envíen artículos desde distintos proveedores, por lo que tu pedido puede llegar en paquetes separados y recibirás varios emails de seguimiento.
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
                    En caso de defecto, envía un <strong>vídeo de unboxing</strong> (mostrando el paquete cerrado, la etiqueta de envío y la apertura por primera vez) y fotografías del defecto a <a className="underline text-spanish-yellow" href={`mailto:${config.EMAILS.returns}`}>{config.EMAILS.returns}</a>. No uses ni laves el producto hasta recibir instrucciones.
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
            Preguntas Frecuentes (FAQ)
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
                    <strong>No aceptamos devoluciones ni cambios por talla salvo defecto de fabricación comprobado.</strong> Debido a que nuestros productos se fabrican por encargo, los cambios por motivo de talla o por cambio de opinión <strong>no se admitirán</strong>. Si crees que tu producto tiene un defecto, sigue el procedimiento de reclamación y envía el vídeo de unboxing y las fotografías solicitadas. <strong>Revisa cuidadosamente la guía de tallas antes de comprar</strong> para evitar errores de elección.
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
              
              <div className="mt-6">
                <h3 className="font-semibold text-spanish-red mb-2">
                  ¿Por qué no aceptáis devoluciones estándar?
                </h3>
                <p className="text-slate-300 text-sm">
                Nuestros productos son personalizados y fabricados bajo demanda para cada cliente. Por esta razón, la normativa permite excluir el derecho de desistimiento en productos confeccionados conforme a las especificaciones del consumidor o claramente personalizados. Por ello solo aceptamos devoluciones en los casos expresados en esta página (defecto de fabricación o error atribuible al proveedor).
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
    {/* Aviso sobre correos automáticos */}
    <div className="bg-slate-900 border-t border-spanish-yellow mt-12 pt-8 pb-8 text-center">
      <p className="text-sm text-spanish-yellow italic">
        {config.EMAIL_INFO_TEXT}
      </p>
    </div>
  </div>
  );
};

