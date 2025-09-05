import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, Clock, CheckCircle } from 'lucide-react';
import config from '../config';
import toast from 'react-hot-toast';
import { apiService } from '../services/api';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Validación básica
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiService.sendContactForm(formData);
      toast.success('¡Mensaje enviado! Te responderemos pronto, cuñao.', {
        duration: 4000,
        icon: '🇪🇸',
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      console.error('Error enviando mensaje:', error);
      toast.error(error.message || 'Error al enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-spanish-red via-slate-800 to-slate-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-patriot font-bold mb-6">
            📞 Contacto
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-slate-200">
            "¿Tienes algo que decir? Aquí escuchamos todas las opiniones"
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Información de contacto */}
          <div>
            <h2 className="text-3xl font-patriot font-bold text-white mb-8">
              Háblanos, cuñao
            </h2>
            
            <p className="text-slate-300 mb-8">
              ¿Tienes una frase cuñao que debería estar en una camiseta? ¿Alguna 
              sugerencia? ¿O simplemente quieres contarnos tu opinión sobre algo? 
              Estamos aquí para escucharte.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-spanish-red rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-spanish-yellow mb-1">
                    Email
                  </h3>
                  <p className="text-slate-300">{config.EMAILS.main}</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Respondemos en menos de 24 horas
                  </p>
                </div>
              </div>


              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-spanish-red rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-spanish-yellow mb-1">
                    Ubicación
                  </h3>
                  <p className="text-slate-300">España</p>
                  <p className="text-sm text-slate-400 mt-1">
                    "En el mejor país del mundo"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-spanish-red rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-spanish-yellow mb-1">
                    Horario de Atención
                  </h3>
                  <p className="text-slate-300">Lunes - Viernes: 9:00 - 18:00</p>
                  <p className="text-slate-300">Sábados: 10:00 - 14:00</p>
                  <p className="text-sm text-slate-400 mt-1">
                    Domingos descansamos (como manda la tradición)
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ rápido */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-white mb-4">
                Preguntas Frecuentes (muy cuñao)
              </h3>
              <div className="space-y-4">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <h4 className="font-semibold text-spanish-yellow mb-2">
                    "¿Podéis hacer camisetas personalizadas?"
                  </h4>
                  <p className="text-slate-300 text-sm">
                    ¡Por supuesto! Mándanos tu frase cuñao favorita y la convertiremos en realidad.
                  </p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <h4 className="font-semibold text-spanish-yellow mb-2">
                    "¿Cuánto tardan los envíos?"
                  </h4>
                  <p className="text-slate-300 text-sm">
                    Entre 3-5 días laborables. Más rápido que tu cuñado dando opiniones.
                  </p>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                  <h4 className="font-semibold text-spanish-yellow mb-2">
                    "¿Hacéis envíos internacionales?"
                  </h4>
                  <p className="text-slate-300 text-sm">
                    Sí, porque el cuñadismo no tiene fronteras. Exportamos sabiduría española al mundo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-patriot font-bold text-white mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-spanish-red" />
                Envíanos un mensaje
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                    Tu nombre *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 
                             focus:ring-2 focus:ring-spanish-red focus:border-spanish-red focus:outline-none
                             transition-all duration-200 ease-in-out
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Escribe tu nombre"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 
                             focus:ring-2 focus:ring-spanish-red focus:border-spanish-red focus:outline-none
                             transition-all duration-200 ease-in-out
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 
                             focus:ring-2 focus:ring-spanish-red focus:border-spanish-red focus:outline-none
                             transition-all duration-200 ease-in-out
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="¿De qué quieres hablarnos?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 
                             focus:ring-2 focus:ring-spanish-red focus:border-spanish-red focus:outline-none
                             transition-all duration-200 ease-in-out resize-none
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Cuéntanos tu historia, sugerencia o la frase cuñao que se te haya ocurrido..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-spanish-red text-white py-3 px-6 rounded-lg font-semibold 
                           hover:bg-red-700 hover:shadow-xl hover:shadow-red-500/25 
                           active:scale-95 transition-all duration-200 ease-in-out transform hover:scale-105
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
                           flex items-center justify-center gap-2 relative overflow-hidden
                           before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent
                           before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Enviar Mensaje
                    </>
                  )}
                </button>
              </form>

              <p className="text-sm text-slate-400 mt-4 text-center">
                * Campos obligatorios. Te responderemos lo antes posible.
              </p>
            </div>

            {/* Frase cuñao */}
            <div className="mt-6 bg-slate-800 border border-spanish-yellow rounded-lg p-4 text-center">
              <p className="text-spanish-yellow italic">
                "En mi pueblo respondemos los emails más rápido"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

