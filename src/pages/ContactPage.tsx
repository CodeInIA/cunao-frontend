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
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'El nombre es obligatorio';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (value.trim().length > 50) return 'El nombre no puede tener más de 50 caracteres';
        if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]+$/.test(value.trim())) {
          return 'El nombre solo puede contener letras y espacios';
        }
        break;
      
      case 'email':
        if (!value.trim()) return 'El email es obligatorio';
        if (value.length > 100) return 'El email es demasiado largo';
        
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(value.trim())) {
          return 'Por favor, introduce un email válido';
        }

        // Validar dominio real
        const emailParts = value.trim().toLowerCase().split('@');
        if (emailParts.length !== 2) return 'Formato de email inválido';
        
        const domain = emailParts[1];
        
        // Dominios bloqueados (temporales/desechables)
        const blockedDomains = [
          '10minutemail.com', '10minutemail.net', 'tempmail.org', 'guerrillamail.com',
          'mailinator.com', 'maildrop.cc', 'yopmail.com', 'temp-mail.org',
          'throwaway.email', 'getnada.com', 'mohmal.com', 'sharklasers.com',
          'trashmail.com', 'armyspy.com', 'cuvox.de', 'dayrep.com', 'einrot.com',
          'fleckens.hu', 'gustr.com', 'jourrapide.com', 'mailcat.biz', 'superrito.com',
          'teleworm.us', 'rhyta.com', 'emltmp.com', 'tempr.email', 'dropmail.me',
          'example.com', 'test.com', 'fake.com', 'invalid.com', 'localhost.com',
          'noexiste.com', 'falso.com', 'prueba.com', 'testing.com'
        ];

        if (blockedDomains.includes(domain)) {
          return 'No se permiten emails temporales. Usa tu email personal.';
        }

        // Verificar extensiones válidas
        const validTlds = [
          'com', 'org', 'net', 'edu', 'gov', 'mil', 'es', 'eu', 'uk', 'de', 'fr', 'it',
          'pt', 'br', 'ar', 'mx', 'co', 'info', 'biz', 'name', 'pro', 'cat', 'tel',
          'travel', 'jobs', 'mobi', 'asia', 'post', 'xxx', 'aero', 'coop', 'museum',
          'int', 'arpa', 'io', 'ai', 'app', 'dev', 'tech', 'online', 'site', 'store',
          'blog', 'news', 'media', 'email', 'cloud', 'digital', 'global', 'world'
        ];

        const domainParts = domain.split('.');
        if (domainParts.length < 2) {
          return 'El dominio del email debe ser válido';
        }

        const tld = domainParts[domainParts.length - 1];
        if (!validTlds.includes(tld)) {
          return 'Extensión de dominio no válida';
        }

        // Verificar que el dominio principal tenga al menos 2 caracteres
        if (domainParts[domainParts.length - 2].length < 2) {
          return 'El dominio del email debe ser válido';
        }

        // Verificar dominios conocidos populares para sugerir correcciones
        const popularDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com', 'msn.com'];
        const suggestions: { [key: string]: string } = {
          'gmai.com': 'gmail.com',
          'gmial.com': 'gmail.com',
          'gmail.co': 'gmail.com',
          'yahoo.co': 'yahoo.com',
          'hotmial.com': 'hotmail.com',
          'hotmai.com': 'hotmail.com',
          'outlok.com': 'outlook.com'
        };

        if (suggestions[domain]) {
          return `¿Quisiste decir ${suggestions[domain]}?`;
        }

        break;
      
      case 'subject':
        if (!value.trim()) return 'El asunto es obligatorio';
        if (value.trim().length < 5) return 'El asunto debe tener al menos 5 caracteres';
        if (value.trim().length > 100) return 'El asunto no puede tener más de 100 caracteres';
        break;
      
      case 'message':
        if (!value.trim()) return 'El mensaje es obligatorio';
        if (value.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres';
        if (value.trim().length > 1000) return 'El mensaje no puede tener más de 1000 caracteres';
        
        // Detectar múltiples enlaces (posible spam)
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urls = value.match(urlRegex) || [];
        if (urls.length > 2) {
          return 'El mensaje no puede contener más de 2 enlaces';
        }
        break;
    }
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Actualizar el valor
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar el campo en tiempo real
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    // Validar todos los campos
    const newErrors = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      subject: validateField('subject', formData.subject),
      message: validateField('message', formData.message)
    };

    setErrors(newErrors);

    // Verificar si hay errores
    const hasErrors = Object.values(newErrors).some(error => error !== '');
    if (hasErrors) {
      toast.error('Por favor, corrige los errores en el formulario');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiService.sendContactForm({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      });
      
      toast.success('¡Mensaje enviado! Te responderemos pronto, cuñao.', {
        duration: 4000,
        icon: '🇪🇸',
      });
      
      // Limpiar formulario y errores
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({ name: '', email: '', subject: '', message: '' });
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
      <section className="relative text-white py-20 bg-[url('/contact-wallpaper.webp')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50 pointer-events-none"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-block bg-black/40 backdrop-blur-[1px] px-6 py-4 rounded-xl">
            <h1 className="text-4xl md:text-6xl font-patriot font-bold mb-4 flex items-center justify-center gap-4">
              <Phone className="w-12 h-12 text-spanish-red" />
              Contacto
            </h1>
            <p className="text-xl md:text-2xl font-bold max-w-3xl mx-auto">
              "¿Tienes algo que decir? Aquí escuchamos todas las opiniones"
            </p>
          </div>
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
                    className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 
                             focus:ring-2 focus:ring-spanish-red focus:border-spanish-red focus:outline-none
                             transition-all duration-200 ease-in-out
                             disabled:opacity-50 disabled:cursor-not-allowed
                             ${errors.name ? 'border-red-500' : 'border-slate-600'}`}
                    placeholder="Escribe tu nombre"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                  )}
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
                    className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 
                             focus:ring-2 focus:ring-spanish-red focus:border-spanish-red focus:outline-none
                             transition-all duration-200 ease-in-out
                             disabled:opacity-50 disabled:cursor-not-allowed
                             ${errors.email ? 'border-red-500' : 'border-slate-600'}`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
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
                    className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 
                             focus:ring-2 focus:ring-spanish-red focus:border-spanish-red focus:outline-none
                             transition-all duration-200 ease-in-out
                             disabled:opacity-50 disabled:cursor-not-allowed
                             ${errors.subject ? 'border-red-500' : 'border-slate-600'}`}
                    placeholder="¿De qué quieres hablarnos?"
                  />
                  {errors.subject && (
                    <p className="text-red-400 text-sm mt-1">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                    Mensaje * <span className="text-slate-400 text-xs">({formData.message.length}/1000)</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 
                             focus:ring-2 focus:ring-spanish-red focus:border-spanish-red focus:outline-none
                             transition-all duration-200 ease-in-out resize-none
                             disabled:opacity-50 disabled:cursor-not-allowed
                             ${errors.message ? 'border-red-500' : 'border-slate-600'}`}
                    placeholder="Cuéntanos tu historia, sugerencia o la frase cuñao que se te haya ocurrido..."
                  />
                  {errors.message && (
                    <p className="text-red-400 text-sm mt-1">{errors.message}</p>
                  )}
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

