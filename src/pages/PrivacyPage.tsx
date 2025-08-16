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
              <strong>Última actualización:</strong> 16 de agosto de 2025
            </p>
            <p className="text-slate-300">
              En <strong>Cuñadismo Ilustrado</strong> respetamos tu privacidad tanto como respetamos las opiniones cuñao. 
              Esta política explica cómo recopilamos, utilizamos y protegemos tu información personal.
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
                  <li>Número de teléfono (opcional)</li>
                </ul>
              </div>

              <div className="bg-slate-700 border border-slate-600 p-4 rounded-lg">
                <h3 className="font-semibold text-spanish-yellow mb-2">Información de Navegación</h3>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                  <li>Dirección IP</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Páginas visitadas y tiempo en la web</li>
                  <li>Preferencias de idioma</li>
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
                <span className="w-2 h-2 bg-spanish-red rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-slate-300">
                  <strong>Procesar pedidos:</strong> Para enviarte tus camisetas cuñao a tiempo
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-spanish-red rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-slate-300">
                  <strong>Comunicación:</strong> Para enviarte confirmaciones de pedido y actualizaciones
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-spanish-red rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-slate-300">
                  <strong>Mejorar la experiencia:</strong> Para personalizar tu experiencia de compra
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-spanish-red rounded-full mt-2 flex-shrink-0"></span>
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
              Utilizamos cookies para mejorar tu experiencia (y no las comestibles, esas no las compartimos):
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-700 border border-spanish-red p-4 rounded-lg">
                <h4 className="font-semibold text-spanish-yellow mb-2">Cookies Necesarias</h4>
                <p className="text-sm text-slate-400">
                  Para que el carrito de compras funcione y puedas hacer pedidos.
                </p>
              </div>
              <div className="bg-slate-700 border border-spanish-red p-4 rounded-lg">
                <h4 className="font-semibold text-spanish-yellow mb-2">Cookies de Análisis</h4>
                <p className="text-sm text-slate-400">
                  Para entender cómo usas la web y mejorarla (anónimas).
                </p>
              </div>
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
              <div className="space-y-2">
                <p className="text-slate-300">
                  <strong>Email:</strong> {config.EMAILS.privacy}
                </p>
                <p className="text-slate-300">
                  <strong>Teléfono:</strong> +34 666 123 456
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
    </div>
  );
};

