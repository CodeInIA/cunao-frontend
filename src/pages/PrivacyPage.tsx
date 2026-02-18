import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Eye, Clock, Lock } from 'lucide-react';
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import config from '../config';

export const PrivacyPage: React.FC = () => {
  const { navigateTo } = useSmartNavigation();

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-spanish-red via-slate-800 to-slate-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Shield className="w-16 h-16 mx-auto mb-6 text-spanish-yellow" />
          <h1 className="text-4xl md:text-6xl font-patriot font-bold mb-6">
            Política de Privacidad
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-slate-200">
            "En mi pueblo respetamos la privacidad como se debe"
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-8">
            <p className="text-slate-400 mb-4">
              <strong>Última actualización:</strong> 23 de septiembre de 2025
            </p>
            <p className="text-slate-300">
              En <strong>Cuñadismo Ilustrado</strong> respetamos tu privacidad tanto como respetamos las opiniones cuñao. 
              Esta política explica cómo recopilamos, utilizamos y protegemos tu información personal en nuestra tienda online 
              y sistema de newsletter.
            </p>
          </div>

          {/* Qué información recopilamos */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-spanish-red" />
              ¿Qué información recopilamos?
            </h2>
            
            <div className="space-y-4">
              <div className="bg-slate-700 border border-slate-600 p-4 rounded-lg">
                <h3 className="font-semibold text-spanish-yellow mb-2">Información Personal</h3>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  <li>Nombre y apellidos</li>
                  <li>Dirección de email</li>
                  <li>Dirección postal para envíos</li>
                  <li>Número de teléfono (obligatorio para la gestión del envío y contacto relacionado con el pedido)</li>
                </ul>
              </div>
              <div className="bg-slate-700 border border-slate-600 p-4 rounded-lg">
                <h3 className="font-semibold text-spanish-yellow mb-2">Información de Navegación</h3>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  <li>Páginas visitadas y tiempo en la web (solo si das tu consentimiento para analítica)</li>
                </ul>
              </div>

              <div className="bg-slate-700 border border-slate-600 p-4 rounded-lg">
                <h3 className="font-semibold text-spanish-yellow mb-2">Información de Compra</h3>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  <li>Historial de pedidos</li>
                  <li>Preferencias de productos</li>
                  <li>Información de pago (procesada por Stripe)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cómo utilizamos la información */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-spanish-red" />
              ¿Cómo utilizamos tu información?
            </h2>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-spanish-red rounded-full mt-2 shrink-0"></span>
                <span className="text-slate-300">
                  <strong>Procesar pedidos:</strong> Para enviarte tus camisetas cuñao a tiempo
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-spanish-red rounded-full mt-2 shrink-0"></span>
                <span className="text-slate-300">
                  <strong>Comunicación:</strong> Para enviarte confirmaciones de pedido y actualizaciones
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-spanish-red rounded-full mt-2 shrink-0"></span>
                <span className="text-slate-300">
                  <strong>Mejorar la experiencia:</strong> Para personalizar tu experiencia de compra
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-spanish-red rounded-full mt-2 shrink-0"></span>
                <span className="text-slate-300">
                  <strong>Newsletter:</strong> Solo si te suscribes voluntariamente
                </span>
              </li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4">
              Cookies y Tecnologías Similares
            </h2>
            
            <p className="text-slate-300 mb-4">
              Usamos cookies y almacenamiento local para funciones esenciales (por ejemplo, mantener el carrito) y para análisis cuando das tu consentimiento. No usamos técnicas invasivas ni vendemos tus datos.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-700 border border-spanish-red p-4 rounded-lg">
                <h4 className="font-semibold text-spanish-yellow mb-2">Cookies Necesarias</h4>
                <p className="text-sm text-slate-400">
                  Necesarias para el funcionamiento de la tienda (por ejemplo, persistencia del carrito). Guardamos el carrito en `localStorage` bajo la clave <code>cunao-cart-storage</code> y el consentimiento en <code>cunao.consent</code>.
                </p>
              </div>
              <div className="bg-slate-700 border border-spanish-red p-4 rounded-lg">
                <h4 className="font-semibold text-spanish-yellow mb-2">Cookies de Análisis</h4>
                <p className="text-sm text-slate-400">
                  Solo se activan si aceptas el uso de analítica. Estas cookies ayudan a mejorar la web y se usan de forma agregada.
                </p>
              </div>
            </div>
          </section>

          {/* Newsletter */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-spanish-yellow" />
              Sistema de Newsletter
            </h2>
            
            <div className="bg-slate-700 border border-slate-600 p-6 rounded-lg">
              <h3 className="font-semibold text-spanish-yellow mb-3">¿Cómo funciona nuestro newsletter?</h3>
              <ul className="space-y-2 text-slate-300 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-spanish-red">•</span>
                  <span>Suscripción 100% voluntaria desde el footer de la web o mediante opt-in explícito durante el proceso de compra</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-spanish-red">•</span>
                  <span>Envío semanal automático los domingos a las 20:00 (hora de España peninsular). Este envío está dedicado a <strong>novedades</strong> (productos añadidos y contenido editorial).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-spanish-red">•</span>
                  <span>52 frases cuñao diferentes, una para cada semana del año</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-spanish-red">•</span>
                  <span>Gestión de preferencias con enlaces seguros y únicos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-spanish-red">•</span>
                  <span>Puedes darte de baja o modificar preferencias en cualquier momento mediante los enlaces únicos de gestión en cada email o contactando a {config.EMAILS.privacy}.</span>
                </li>
              </ul>
              
              <div className="bg-slate-800 border border-slate-600 p-4 rounded">
                <h4 className="font-semibold text-white mb-2">Tipos de comunicaciones:</h4>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-spanish-yellow font-medium">Newsletter Semanal:</span>
                    <p className="text-slate-400">Contenido cuñao y novedades</p>
                  </div>
                  <div>
                    <span className="text-spanish-yellow font-medium">Promociones:</span>
                    <p className="text-slate-400">Solo para clientes con compras</p>
                  </div>
                  <div>
                    <span className="text-spanish-yellow font-medium">Nuevos Productos:</span>
                    <p className="text-slate-400">Lanzamientos exclusivos</p>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* Promociones y notificaciones de productos */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-spanish-yellow" />
              Promociones y notificaciones de productos
            </h2>

            <div className="bg-slate-700 border border-slate-600 p-6 rounded-lg">
              <h3 className="font-semibold text-spanish-yellow mb-3">Notificaciones semanales y códigos exclusivos</h3>
              <p className="text-slate-300 mb-3">Si das tu consentimiento, podrás recibir dos tipos de comunicaciones por email: 1) un resumen semanal de <strong>novedades</strong> (productos añadidos la última semana) y 2) comunicaciones <strong>promocionales puntuales</strong> con ofertas o códigos exclusivos. Las comunicaciones de novedades se envían de forma recurrente; las promocionales se envían solo cuando lancemos campañas específicas.</p>

              <ul className="list-disc list-inside text-slate-300 text-sm space-y-1">
                <li><strong>Finalidad:</strong> Envío de comunicaciones sobre productos nuevos (novedades) y, cuando proceda, promociones y códigos de descuento exclusivos.</li>
                <li><strong>Frecuencia y hora (novedades):</strong> Semanal, los domingos a las 20:00 (hora de España peninsular). Cuando sea posible, adaptamos la entrega a la zona horaria del usuario.</li>
                <li><strong>Frecuencia (promociones):</strong> Puntual — las comunicaciones promocionales no son recurrentes y se envían únicamente cuando corresponda una campaña u oferta específica.</li>
                <li><strong>Base legal:</strong> Tratamiento basado en tu consentimiento explícito (opt‑in). Puedes retirar tu consentimiento en cualquier momento sin afectar la licitud del tratamiento previo a la retirada.</li>
                <li><strong>Datos tratados:</strong> Dirección de email y, solo si das permiso, datos de interacción (historial de compras o navegación) para personalizar las ofertas y seleccionar códigos relevantes.</li>
                <li><strong>Destinatarios:</strong> Encargados de tratamiento (proveedor de mailing) como SendGrid, Mailchimp u otros. En caso de transferencias fuera de la UE aplicaremos las garantías adecuadas.</li>
                <li><strong>Conservación:</strong> Mantendremos tus datos de marketing mientras exista tu consentimiento. Tras un periodo prolongado de inactividad (p. ej. 3 años) tus datos podrán ser eliminados o anonimizados.</li>
                <li><strong>Baja y gestión de preferencias:</strong> Cada email contiene un enlace para darte de baja o gestionar preferencias. También puedes solicitar baja contactando a {config.EMAILS.privacy}.</li>
                <li><strong>Registro de consentimiento:</strong> Guardamos prueba de tu opt‑in (origen del consentimiento: footer/checkout, timestamp y versión del texto mostrado). Recomendamos implementar doble opt‑in para mayor seguridad probatoria.</li>
                <li><strong>Códigos de descuento exclusivos:</strong> Los códigos enviados por email son exclusivos para la campaña o suscriptores; su uso es regulado por las condiciones comunicadas en cada email y pueden tener limitaciones de tiempo o uso.</li>
              </ul>
            </div>
          </section>

          {/* Protección de datos */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4">
              ¿Cómo Protegemos tus Datos?
            </h2>
            
            <div className="bg-green-900 border border-green-700 rounded-lg p-6">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-slate-300">Cifrado SSL/TLS en todas las conexiones</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-slate-300">Pagos procesados por Stripe (PCI DSS certificado)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-slate-300">Acceso limitado solo a personal autorizado</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-slate-300">Backups seguros y actualizaciones regulares</span>
                </li>
              </ul>
            </div>
            <p className="text-slate-300 mt-4">
              <strong>Cesión de datos:</strong> No cedemos tus datos a terceros salvo obligación legal o a proveedores que actúan en nuestro nombre para procesar pagos/envíos.
            </p>
          </section>

          {/* Menores de edad */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4">Menores de edad</h2>
            <p className="text-slate-300">No aceptamos compras ni suscripciones de menores de 18 años. Si eres menor, pide a tu tutor legal que realice la compra por ti.</p>
          </section>

          {/* Tus derechos */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4">
              Tus Derechos (RGPD)
            </h2>
            
            <p className="text-slate-300 mb-4">
              Como ciudadano europeo, tienes derecho a:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-spanish-red font-bold">→</span>
                  <span className="text-slate-300"><strong>Acceso:</strong> Ver qué datos tenemos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-spanish-red font-bold">→</span>
                  <span className="text-slate-300"><strong>Rectificación:</strong> Corregir datos incorrectos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-spanish-red font-bold">→</span>
                  <span className="text-slate-300"><strong>Supresión:</strong> Eliminar tus datos</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-spanish-red font-bold">→</span>
                  <span className="text-slate-300"><strong>Portabilidad:</strong> Llevarte tus datos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-spanish-red font-bold">→</span>
                  <span className="text-slate-300"><strong>Oposición:</strong> Rechazar ciertos usos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-spanish-red font-bold">→</span>
                  <span className="text-slate-300"><strong>Limitación:</strong> Restringir el procesamiento</span>
                </div>
              </div>
            </div>
          </section>

          {/* Contacto */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-spanish-red" />
              ¿Preguntas sobre Privacidad?
            </h2>
            
            <div className="bg-slate-700 border border-spanish-yellow rounded-lg p-6">
              <p className="text-slate-300 mb-4">
                Si tienes dudas sobre esta política o quieres ejercer tus derechos, contáctanos:
              </p>
              <p className="text-slate-300 mb-4">
                <strong>Responsable del tratamiento:</strong> Sergio Barrios Paz, titular de la web Cuñadismo Ilustrado, NIF [dato eliminado], [dato eliminado], Madrid, España.
              </p>
              <div className="space-y-2">
                <p className="text-slate-300">
                  <strong>Email:</strong> {config.EMAILS.privacy}
                </p>
                <p className="text-slate-300">
                  <strong>Dirección:</strong> España (porque aquí hacemos las cosas bien)
                </p>
              </div>
            </div>
          </section>

          {/* Actualizaciones */}
          <section className="border-t border-slate-600 pt-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-spanish-red" />
              Actualizaciones de esta Política
            </h2>
            <p className="text-slate-300">
              Podemos actualizar esta política ocasionalmente. Te notificaremos los cambios importantes 
              por email o mediante un aviso destacado en la web. La fecha de última actualización aparece 
              al inicio de este documento.
            </p>
          </section>
        </div>

        {/* Frase cuñao final */}
        <div className="bg-slate-800 border border-spanish-yellow rounded-lg p-6 text-center">
          <p className="text-spanish-yellow italic text-lg">
            "En mi pueblo siempre hemos respetado la privacidad del vecino"
          </p>
          <div className="mt-4">
            <button
              onClick={() => navigateTo('/contacto')}
              className="inline-flex items-center px-6 py-3 bg-spanish-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors border-none cursor-pointer"
            >
              <Mail className="w-4 h-4 mr-2" />
              ¿Dudas? Contáctanos
            </button>
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

