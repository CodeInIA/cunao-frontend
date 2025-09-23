import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Scale, ShoppingCart, Truck, AlertTriangle, Mail } from 'lucide-react';
import config from '../config';
import { useSmartNavigation } from '../hooks/useSmartNavigation';

export const TermsPage: React.FC = () => {
  const { navigateTo } = useSmartNavigation();
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-spanish-red via-slate-800 to-slate-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Scale className="w-16 h-16 mx-auto mb-6 text-spanish-yellow" />
          <h1 className="text-4xl md:text-6xl font-patriot font-bold mb-6">
            Términos y Condiciones
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-slate-200">
            "En mi pueblo las reglas están claras desde el principio"
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-8 mb-8">
          
          {/* Información general */}
          <div className="mb-8">
            <p className="text-slate-400 mb-4">
              <strong>Última actualización:</strong> 24 de septiembre de 2025
            </p>
            <p className="text-slate-300">
              Bienvenido a <strong>Cuñadismo Ilustrado</strong>. Al utilizar nuestro sitio web y servicios, 
              aceptas estos términos y condiciones. Si no estás de acuerdo, pues "en tu pueblo será diferente", 
              pero aquí funcionamos así.
            </p>
          </div>

          {/* Información de la empresa */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-spanish-red" />
              Información de la Empresa
            </h2>
            
            <div className="bg-slate-700 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-300"><strong>Nombre:</strong> Cuñadismo Ilustrado</p>
                  <p className="text-slate-300"><strong>Email:</strong> {config.EMAILS.main}</p>
                  <p className="text-slate-300"><strong>Dirección:</strong> [dato eliminado], Madrid, España</p>
                  <p className="text-slate-300"><strong>Titular:</strong> Sergio Barrios Paz</p>
                  <p className="text-slate-300"><strong>NIF:</strong> [dato eliminado]</p>
                </div>
                <div>
                  <p className="text-slate-300"><strong>Actividad:</strong> Venta de camisetas temáticas</p>
                  <p className="text-slate-300"><strong>Web:</strong> {config.DOMAIN}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Uso del sitio web */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4">
              Uso del Sitio Web
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-spanish-red rounded-full mt-2 flex-shrink-0"></span>
                <p className="text-slate-300">
                  <strong>Uso autorizado:</strong> Puedes navegar, comprar productos y compartir contenido de forma personal y no comercial.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-spanish-red rounded-full mt-2 flex-shrink-0"></span>
                <p className="text-slate-300">
                  <strong>Edad mínima:</strong> Debes ser mayor de 18 años. Información adicional sobre menores y consentimiento disponible en nuestra <Link to="/privacidad" className="underline text-spanish-yellow">Política de Privacidad</Link>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-2 h-2 bg-spanish-red rounded-full mt-2 flex-shrink-0"></span>
                <p className="text-slate-300">
                  <strong>Cuenta responsable:</strong> Eres responsable de mantener segura tu información de acceso.
                </p>
              </div>
            </div>

            <div className="mt-6 bg-red-900 border border-red-700 rounded-lg p-4">
              <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Usos Prohibidos
              </h3>
              <ul className="text-red-300 text-sm space-y-1">
                <li>• Usar el sitio para actividades ilegales o fraudulentas</li>
                <li>• Intentar acceder a áreas restringidas o dañar el sistema</li>
                <li>• Copiar o reproducir contenido sin autorización</li>
                <li>• Hacer ingeniería inversa de nuestro código</li>
                <li>• Enviar spam o contenido malicioso</li>
              </ul>
            </div>
          </section>

          {/* Productos y pedidos */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-spanish-red" />
              Productos y Pedidos
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-spanish-red">Productos</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>• Todas las camisetas son de alta calidad y diseño original</li>
                  <li>• Las imágenes son representativas, puede haber ligeras variaciones</li>
                  <li>• Los precios incluyen IVA y están en euros (€)</li>
                  <li>• Nos reservamos el derecho a modificar precios sin previo aviso</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-spanish-red">Pedidos</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>• Confirmación automática por email tras el pago</li>
                  <li>• Procesamiento en 1-2 días laborables</li>
                  <li>• Derecho a cancelar antes del envío</li>
                  <li>• Todos los pedidos están sujetos a disponibilidad</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Precios y pagos */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4">
              Precios y Pagos
            </h2>
            
            <div className="bg-slate-700 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-spanish-yellow mb-3">Métodos de Pago</h3>
                  <ul className="space-y-1 text-slate-300">
                    <li>✓ Tarjetas de crédito/débito (Visa, Mastercard)</li>
                    <li>✓ PayPal</li>
                    <li>✓ Apple Pay / Google Pay</li>
                    <li>✓ Transferencia bancaria (solo empresas)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-spanish-yellow mb-3">Política de Precios</h3>
                  <ul className="space-y-1 text-slate-300">
                    <li>• Precios finales con IVA incluido</li>
                    <li>• Gastos de envío calculados al finalizar</li>
                    <li>• Sin cargos ocultos ni sorpresas</li>
                    <li>• Pago seguro procesado por Stripe</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Envíos (resumen con enlace) */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4 flex items-center gap-2">
              <Truck className="w-6 h-6 text-spanish-red" />
              Envíos
            </h2>
            <div className="bg-slate-700 p-6 rounded-lg">
              <p className="text-slate-300 mb-3">La información detallada sobre plazos, costes y condiciones de envío está disponible en nuestra página de <Link to="/envios" className="underline text-spanish-yellow">Envíos y Devoluciones</Link>. Consulta allí los plazos por zona, tarifas actualizadas y la política de envío gratuito.</p>
              <div className="mt-4">
                <button onClick={() => navigateTo('/envios')} className="px-5 py-3 bg-spanish-red text-white rounded-lg">Ver información de envíos</button>
              </div>
            </div>
          </section>

          {/* Devoluciones (resumen y enlace) */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4">Devoluciones y Derecho de Desistimiento</h2>
            <div className="bg-slate-700 p-6 rounded-lg">
              <p className="text-slate-300 mb-3">Algunos de nuestros productos se fabrican bajo demanda y pueden estar excluidos del derecho de desistimiento según la normativa aplicable. Para conocer los plazos, condiciones, requisitos de reclamación (incluido el vídeo de unboxing) y los supuestos en los que cubrimos gastos de devolución, consulta nuestra página de <Link to="/envios" className="underline text-spanish-yellow">Envíos y Devoluciones</Link>.</p>
            </div>
          </section>

          {/* Propiedad intelectual */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4">
              Propiedad Intelectual
            </h2>
            
            <div className="space-y-4">
              <p className="text-slate-300">
                Todos los diseños, textos, logotipos y contenido de esta web son propiedad de 
                <strong> Cuñadismo Ilustrado</strong> o de sus colaboradores, y están protegidos 
                por derechos de autor y propiedad intelectual.
              </p>
              
              <div className="bg-slate-700 p-4 rounded-lg">
                <h3 className="font-semibold text-spanish-yellow mb-2">Lo que NO puedes hacer:</h3>
                <ul className="text-slate-300 text-sm space-y-1">
                  <li>• Copiar nuestros diseños para uso comercial</li>
                  <li>• Reproducir las frases vikingo sin autorización</li>
                  <li>• Usar nuestro logo o marca en otros productos</li>
                  <li>• Hacer ingeniería inversa del código de la web</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Limitación de responsabilidad */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4">
              Limitación de Responsabilidad
            </h2>
            
            <div className="bg-slate-700 border border-slate-600 rounded-lg p-6">
              <p className="text-white font-medium mb-4">
                Aunque ponemos todo nuestro empeño cuñao en ofrecer el mejor servicio:
              </p>
              
              <ul className="space-y-2 text-white font-medium text-sm">
                <li>• No garantizamos disponibilidad 24/7 del sitio web</li>
                <li>• No somos responsables de retrasos por causas de fuerza mayor</li>
                <li>• No respondemos por daños indirectos o lucro cesante</li>
                <li>• La responsabilidad máxima se limita al valor del pedido</li>
                <li>• Las opiniones de terceros no representan nuestra posición</li>
              </ul>
            </div>
          </section>

          {/* Ley aplicable */}
          <section className="mb-8">
            <h2 className="text-2xl font-patriot font-bold text-white mb-4">
              Ley Aplicable y Jurisdicción
            </h2>
            
            <p className="text-slate-300">
              Estos términos se rigen por la <strong>legislación española</strong>. 
              Para cualquier disputa, las partes se someten a los Juzgados y Tribunales 
              de España, renunciando expresamente a cualquier otro fuero que pudiera corresponder.
            </p>
          </section>

          {/* Contacto */}
          <section className="border-t pt-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-spanish-red" />
              ¿Dudas sobre estos Términos?
            </h2>
            
            <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
              <p className="text-slate-300 mb-3">
                Si tienes preguntas sobre estos términos y condiciones, no dudes en contactarnos:
              </p>
                <p className="text-slate-300">
                <strong>Email:</strong> {config.EMAILS.legal}
              </p>
            </div>
          </section>

          {/* Newsletter (RGPD) */}
          <section className="mt-6">
            <h2 className="text-xl font-semibold text-white mb-3">Newsletter</h2>
            <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
              <p className="text-slate-300 mb-2">La suscripción a nuestra newsletter es totalmente voluntaria. Tratamos los datos personales facilitados únicamente para enviar comunicaciones comerciales relacionadas con nuestros productos y ofertas.</p>
              <p className="text-slate-300">Puedes darte de baja en cualquier momento mediante el enlace de baja incluido en cada correo o solicitándolo por email a {config.EMAILS.legal}. El tratamiento de datos se realiza conforme al RGPD y nuestra <Link to="/privacidad" className="underline text-spanish-yellow">Política de Privacidad</Link>.</p>
            </div>
          </section>
        </div>

        {/* Frase cuñao final */}
        <div className="bg-slate-800 border border-spanish-yellow rounded-lg p-6 text-center">
          <p className="text-spanish-yellow italic text-lg">
            "En mi pueblo siempre cumplimos lo que prometemos"
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigateTo('/privacidad')}
              className="inline-flex items-center px-6 py-3 bg-slate-700 text-spanish-yellow border-2 border-spanish-red font-semibold rounded-lg hover:bg-spanish-red hover:text-white transition-colors border-none cursor-pointer"
            >
              Ver Política de Privacidad
            </button>
            <button
              onClick={() => navigateTo('/envios')}
              className="inline-flex items-center px-6 py-3 bg-spanish-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors border-none cursor-pointer"
            >
              <Truck className="w-4 h-4 mr-2" />
              Info de Envíos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

