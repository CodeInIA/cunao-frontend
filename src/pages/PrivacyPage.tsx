import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Eye, Clock, Lock } from 'lucide-react';
import config from '../config';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-viking-600 via-viking-500 to-viking-400 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Shield className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Política de Privacidad
          </h1>
          <p className="text-xl md:text-2xl font-vikingo max-w-3xl mx-auto">
            "En mi pueblo respetamos la privacidad como se debe"
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="mb-8">
            <p className="text-gray-600 mb-4">
              <strong>Última actualización:</strong> 14 de agosto de 2025
            </p>
            <p className="text-gray-700">
              En <strong>Cuñadismo Ilustrado</strong> respetamos tu privacidad tanto como respetamos las opiniones vikingo. 
              Esta política explica cómo recopilamos, utilizamos y protegemos tu información personal.
            </p>
          </div>

          {/* Qué información recopilamos */}
          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-viking-600" />
              ¿Qué información recopilamos?
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-viking-600 mb-2">Información Personal</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Nombre y apellidos</li>
                  <li>Dirección de email</li>
                  <li>Dirección postal para envíos</li>
                  <li>Número de teléfono (opcional)</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-viking-600 mb-2">Información de Navegación</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Dirección IP</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Páginas visitadas y tiempo en la web</li>
                  <li>Preferencias de idioma</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-viking-600 mb-2">Información de Compra</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Historial de pedidos</li>
                  <li>Preferencias de productos</li>
                  <li>Información de pago (procesada por Stripe)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cómo utilizamos la información */}
          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-viking-600" />
              ¿Cómo utilizamos tu información?
            </h2>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-viking-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700">
                  <strong>Procesar pedidos:</strong> Para enviarte tus camisetas vikingo a tiempo
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-viking-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700">
                  <strong>Comunicación:</strong> Para enviarte confirmaciones de pedido y actualizaciones
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-viking-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700">
                  <strong>Mejorar la experiencia:</strong> Para personalizar tu experiencia de compra
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-viking-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700">
                  <strong>Newsletter:</strong> Solo si te suscribes voluntariamente
                </span>
              </li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
              Cookies y Tecnologías Similares
            </h2>
            
            <p className="text-gray-700 mb-4">
              Utilizamos cookies para mejorar tu experiencia (y no las comestibles, esas no las compartimos):
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-viking-50 p-4 rounded-lg">
                <h4 className="font-semibold text-viking-700 mb-2">Cookies Necesarias</h4>
                <p className="text-sm text-gray-600">
                  Para que el carrito de compras funcione y puedas hacer pedidos.
                </p>
              </div>
              <div className="bg-viking-50 p-4 rounded-lg">
                <h4 className="font-semibold text-viking-700 mb-2">Cookies de Análisis</h4>
                <p className="text-sm text-gray-600">
                  Para entender cómo usas la web y mejorarla (anónimas).
                </p>
              </div>
            </div>
          </section>

          {/* Protección de datos */}
          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
              ¿Cómo Protegemos tus Datos?
            </h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Cifrado SSL/TLS en todas las conexiones</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Pagos procesados por Stripe (PCI DSS certificado)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Acceso limitado solo a personal autorizado</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-gray-700">Backups seguros y actualizaciones regulares</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Tus derechos */}
          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">
              Tus Derechos (RGPD)
            </h2>
            
            <p className="text-gray-700 mb-4">
              Como ciudadano europeo, tienes derecho a:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-viking-600 font-bold">→</span>
                  <span className="text-gray-700"><strong>Acceso:</strong> Ver qué datos tenemos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-viking-600 font-bold">→</span>
                  <span className="text-gray-700"><strong>Rectificación:</strong> Corregir datos incorrectos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-viking-600 font-bold">→</span>
                  <span className="text-gray-700"><strong>Supresión:</strong> Eliminar tus datos</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-viking-600 font-bold">→</span>
                  <span className="text-gray-700"><strong>Portabilidad:</strong> Llevarte tus datos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-viking-600 font-bold">→</span>
                  <span className="text-gray-700"><strong>Oposición:</strong> Rechazar ciertos usos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-viking-600 font-bold">→</span>
                  <span className="text-gray-700"><strong>Limitación:</strong> Restringir el procesamiento</span>
                </div>
              </div>
            </div>
          </section>

          {/* Contacto */}
          <section className="mb-8">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-viking-600" />
              ¿Preguntas sobre Privacidad?
            </h2>
            
            <div className="bg-viking-50 border border-viking-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                Si tienes dudas sobre esta política o quieres ejercer tus derechos, contáctanos:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Email:</strong> {config.EMAILS.privacy}
                </p>
                <p className="text-gray-700">
                  <strong>Teléfono:</strong> +34 666 123 456
                </p>
                <p className="text-gray-700">
                  <strong>Dirección:</strong> España (porque aquí hacemos las cosas bien)
                </p>
              </div>
            </div>
          </section>

          {/* Actualizaciones */}
          <section className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-viking-600" />
              Actualizaciones de esta Política
            </h2>
            <p className="text-gray-700">
              Podemos actualizar esta política ocasionalmente. Te notificaremos los cambios importantes 
              por email o mediante un aviso destacado en la web. La fecha de última actualización aparece 
              al inicio de este documento.
            </p>
          </section>
        </div>

        {/* Frase vikingo final */}
        <div className="bg-viking-50 border border-viking-200 rounded-lg p-6 text-center">
          <p className="text-viking-700 font-vikingo italic text-lg">
            "En mi pueblo siempre hemos respetado la privacidad del vecino"
          </p>
          <div className="mt-4">
            <Link
              to="/contacto"
              className="inline-flex items-center px-6 py-3 bg-viking-600 text-white font-semibold rounded-lg hover:bg-viking-700 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              ¿Dudas? Contáctanos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

