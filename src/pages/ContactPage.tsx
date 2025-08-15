import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, Clock } from 'lucide-react';
import config from '../config';
import toast from 'react-hot-toast';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario
    toast.success('¡Mensaje enviado! Te responderemos pronto, vikingo.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-viking-600 via-viking-500 to-viking-400 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
            📞 Contacto
          </h1>
          <p className="text-xl md:text-2xl font-vikingo max-w-3xl mx-auto">
            "¿Tienes algo que decir? Aquí escuchamos todas las opiniones"
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Información de contacto */}
          <div>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-8">
              Háblanos, vikingo
            </h2>
            
            <p className="text-gray-700 mb-8">
              ¿Tienes una frase vikingo que debería estar en una camiseta? ¿Alguna 
              sugerencia? ¿O simplemente quieres contarnos tu opinión sobre algo? 
              Estamos aquí para escucharte.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-viking-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-viking-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Email
                  </h3>
                  <p className="text-gray-600">{config.EMAILS.main}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Respondemos en menos de 24 horas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-viking-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-viking-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Teléfono
                  </h3>
                  <p className="text-gray-600">+34 666 123 456</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Lunes a Viernes, 9:00 - 18:00
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-viking-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-viking-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Ubicación
                  </h3>
                  <p className="text-gray-600">España</p>
                  <p className="text-sm text-gray-500 mt-1">
                    "En el mejor país del mundo"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-viking-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-viking-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Horario de Atención
                  </h3>
                  <p className="text-gray-600">Lunes - Viernes: 9:00 - 18:00</p>
                  <p className="text-gray-600">Sábados: 10:00 - 14:00</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Domingos descansamos (como manda la tradición)
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ rápido */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Preguntas Frecuentes (muy vikingo)
              </h3>
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-viking-600 mb-2">
                    "¿Podéis hacer camisetas personalizadas?"
                  </h4>
                  <p className="text-gray-600 text-sm">
                    ¡Por supuesto! Mándanos tu frase vikingo favorita y la convertiremos en realidad.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-viking-600 mb-2">
                    "¿Cuánto tardan los envíos?"
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Entre 3-5 días laborables. Más rápido que tu cuñado dando opiniones.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-viking-600 mb-2">
                    "¿Hacéis envíos internacionales?"
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Sí, porque el cuñadismo no tiene fronteras. Exportamos sabiduría española al mundo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-viking-600" />
                Envíanos un mensaje
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Tu nombre *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-viking-500 focus:border-transparent"
                    placeholder="Escribe tu nombre"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-viking-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-viking-500 focus:border-transparent"
                    placeholder="¿De qué quieres hablarnos?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-viking-500 focus:border-transparent resize-none"
                    placeholder="Cuéntanos tu historia, sugerencia o la frase vikingo que se te haya ocurrido..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-viking-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-viking-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Enviar Mensaje
                </button>
              </form>

              <p className="text-sm text-gray-500 mt-4 text-center">
                * Campos obligatorios. Te responderemos lo antes posible.
              </p>
            </div>

            {/* Frase vikingo */}
            <div className="mt-6 bg-viking-50 border border-viking-200 rounded-lg p-4 text-center">
              <p className="text-viking-700 font-vikingo italic">
                "En mi pueblo respondemos los emails más rápido"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

