import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import { SocialIcon } from 'react-social-icons';
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import BrandLogo from './BrandLogo';
import config from '../config';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export const Footer: React.FC = () => {
  const { navigateTo } = useSmartNavigation();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Dominios temporales/desechables bloqueados
  const blockedDomains = [
    '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org',
    'yopmail.com', 'temp-mail.org', 'throwaway.email', 'getnada.com',
    'maildrop.cc', 'mailnesia.com', 'trashmail.com', '33mail.com',
    'dispostable.com', 'fake-mail.ml', 'mohmal.com', 'emailfake.com'
  ];

  // Lista de dominios conocidos y confiables
  const trustedDomains = [
    // Gmail y Google
    'gmail.com', 'googlemail.com', 'google.com',
    // Microsoft/Outlook
    'outlook.com', 'outlook.es', 'hotmail.com', 'hotmail.es', 'live.com', 'live.es', 'msn.com',
    // Yahoo
    'yahoo.com', 'yahoo.es', 'yahoo.fr', 'yahoo.it', 'yahoo.de', 'yahoo.co.uk',
    // Dominios españoles
    'telefonica.es', 'movistar.es', 'orange.es', 'vodafone.es', 'jazztel.es',
    // Otros proveedores conocidos
    'icloud.com', 'me.com', 'mac.com',
    'aol.com', 'protonmail.com', 'proton.me', 'tutanota.com',
    // Dominios educativos y gubernamentales españoles
    'uma.es', 'ucm.es', 'uam.es', 'upm.es', 'uc3m.es', 'urjc.es', 'uned.es',
    'gov.es', 'junta-andalucia.es', 'madrid.org',
    // Dominios empresariales comunes
    'empresa.com', 'company.com', 'corp.com', 'group.com',
    // Otros dominios internacionales comunes
    'mail.com', 'gmx.com', 'gmx.de', 'web.de', 'freenet.de',
    'libero.it', 'tin.it', 'alice.it',
    'free.fr', 'orange.fr', 'wanadoo.fr', 'laposte.net',
    'btinternet.com', 'sky.com', 'virgin.net', 'tiscali.co.uk'
  ];

  // Validar dominio de email
  const validateEmailDomain = (email: string): { isValid: boolean; suggestion?: string } => {
    const emailParts = email.toLowerCase().split('@');
    
    // Debe tener exactamente un @
    if (emailParts.length !== 2) {
      return { isValid: false };
    }
    
    const [localPart, emailDomain] = emailParts;
    
    // Validar parte local (antes del @)
    if (!localPart || localPart.length < 1 || localPart.length > 64) {
      return { isValid: false };
    }
    
    // Validar dominio (después del @)
    if (!emailDomain || emailDomain.length < 3 || emailDomain.length > 255) {
      return { isValid: false };
    }
    
    // El dominio debe tener al menos un punto y una extensión válida
    const domainParts = emailDomain.split('.');
    if (domainParts.length < 2) {
      return { isValid: false };
    }
    
    // La extensión debe tener al menos 2 caracteres y no más de 6
    const extension = domainParts[domainParts.length - 1];
    if (extension.length < 2 || extension.length > 6) {
      return { isValid: false };
    }

    // Validar que la extensión sea alfabética
    if (!/^[a-zA-Z]+$/.test(extension)) {
      return { isValid: false };
    }

    // Validar que cada parte del dominio tenga contenido válido
    for (const part of domainParts) {
      if (!part || part.length < 1 || !/^[a-zA-Z0-9-]+$/.test(part)) {
        return { isValid: false };
      }
    }
    
    // Verificar si está en la lista de dominios bloqueados
    if (blockedDomains.includes(emailDomain)) {
      return { isValid: false };
    }

    // Verificar si el dominio está en la lista de dominios confiables
    if (!trustedDomains.includes(emailDomain)) {
      // Buscar sugerencias para dominios comunes mal escritos
      const commonDomains: Record<string, string> = {
        'gmial.com': 'gmail.com',
        'gmai.com': 'gmail.com',
        'gmeil.com': 'gmail.com',
        'hotmial.com': 'hotmail.com',
        'hotmeil.com': 'hotmail.com',
        'yahooo.com': 'yahoo.com',
        'yaho.com': 'yahoo.com',
        'outlok.com': 'outlook.com',
        'outlock.com': 'outlook.com',
        'email.xom': 'gmail.com'
      };
      
      if (commonDomains[emailDomain]) {
        return { isValid: false, suggestion: email.replace(emailDomain, commonDomains[emailDomain]) };
      }
      
      // Si no está en dominios confiables y no hay sugerencia, rechazar
      return { isValid: false };
    }
    
    return { isValid: true };
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setEmailError('');
    
    if (!email) {
      setEmailError('Por favor, introduce tu email');
      toast.error('Por favor, introduce tu email');
      return;
    }

    // Validación básica de email - regex más estricto
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!emailRegex.test(email.trim()) || email.length > 100) {
      setEmailError('El formato del email no es válido');
      toast.error('El formato del email no es válido');
      return;
    }

    // Validación adicional: no puede empezar con @ y debe tener contenido antes del @
    const emailParts = email.trim().split('@');
    if (emailParts.length !== 2 || emailParts[0].length < 1 || emailParts[1].length < 3) {
      setEmailError('El formato del email no es válido');
      toast.error('El formato del email no es válido');
      return;
    }

    // Validar dominio
    const domainValidation = validateEmailDomain(email.trim());
    if (!domainValidation.isValid) {
      if (domainValidation.suggestion) {
        setEmailError(`¿Quisiste decir ${domainValidation.suggestion}?`);
        toast.error(`¿Quisiste decir ${domainValidation.suggestion}?`);
      } else {
        setEmailError('Por favor, usa un proveedor de email conocido (Gmail, Outlook, Yahoo, etc.)');
        toast.error('Por favor, usa un proveedor de email conocido (Gmail, Outlook, Yahoo, etc.)');
      }
      return;
    }

    setIsSubscribing(true);
    
    try {
      await apiService.subscribeToNewsletter(email);
      toast.success('¡Te has suscrito correctamente al newsletter!');
      setEmail('');
      setEmailError('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al suscribirse';
      setEmailError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubscribing(false);
    }
  };

  // Limpiar errores cuando el usuario empiece a escribir
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
  };

  return (
    <footer className="footer-dark text-white">
      {/* Barra superior patriótica */}
      <div className="brand-header h-1"></div>
      
  <div className="container mx-auto px-4 py-12 contain-width">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <BrandLogo size="lg" showText={true} className="mb-4" />
            <p className="text-slate-300 mb-6 max-w-md">
              La tienda más patriótica de España. Camisetas con las frases más auténticas 
              del cuñadismo español. Porque siempre hay algo que opinar.
            </p>
            
            {/* Redes sociales */}
            <div className="flex space-x-4">
              <SocialIcon 
                url={config.SOCIAL.instagram}
                style={{ height: 40, width: 40 }}
                className="hover:scale-110 transition-transform"
                target="_blank"
                rel="noopener noreferrer"
                bgColor="#334155"
              />
              <SocialIcon 
                url={config.SOCIAL.x}
                style={{ height: 40, width: 40 }}
                className="hover:scale-110 transition-transform"
                target="_blank"
                rel="noopener noreferrer"
                bgColor="#334155"
              />
              <SocialIcon 
                url={config.SOCIAL.tiktok}
                style={{ height: 40, width: 40 }}
                className="hover:scale-110 transition-transform"
                target="_blank"
                rel="noopener noreferrer"
                bgColor="#334155"
              />
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => navigateTo('/')}
                  className="nav-link hover:text-spanish-yellow hover:translate-x-1 transition-all duration-300 bg-transparent border-none text-left p-0"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('/productos')}
                  className="nav-link hover:text-spanish-yellow hover:translate-x-1 transition-all duration-300 bg-transparent border-none text-left p-0"
                >
                  Productos
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('/destacados')}
                  className="nav-link hover:text-spanish-yellow hover:translate-x-1 transition-all duration-300 bg-transparent border-none text-left p-0"
                >
                  Destacados
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('/sobre-nosotros')}
                  className="nav-link hover:text-spanish-yellow hover:translate-x-1 transition-all duration-300 bg-transparent border-none text-left p-0"
                >
                  Sobre Nosotros
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigateTo('/contacto')}
                  className="nav-link hover:text-spanish-yellow hover:translate-x-1 transition-all duration-300 bg-transparent border-none text-left p-0"
                >
                  Contacto
                </button>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contacto</h4>
              <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail size={16} className="text-spanish-yellow w-4 h-4 shrink-0 mt-1" />
                <a 
                  href={`mailto:${config.EMAILS.main}`}
                  className="text-slate-300 hover:text-spanish-yellow transition-colors duration-300 hover:underline max-w-full break-words"
                >
                  {config.EMAILS.main}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-spanish-yellow" />
                <span className="text-slate-300">España</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h5 className="font-semibold mb-2 text-white">Newsletter Cuñao</h5>
              <p className="text-sm text-slate-400 mb-3">
                Recibe las últimas frases cuñao
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="flex flex-col lg:flex-row w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="tu@email.com"
                    className={`flex-1 min-w-0 w-full lg:w-auto px-3 py-2 bg-slate-700 border text-white placeholder-slate-400 rounded-md lg:rounded-l-md lg:rounded-r-none focus:outline-none transition-colors ${
                      emailError 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-slate-600 focus:ring-spanish-yellow focus:border-spanish-yellow'
                    }`}
                    disabled={isSubscribing}
                  />
                  <button 
                    type="submit"
                    disabled={isSubscribing}
                    className="px-4 py-2 bg-spanish-yellow text-slate-900 font-semibold hover:bg-yellow-400 transition-colors rounded-md lg:rounded-l-none lg:rounded-r-md lg:-ml-px w-full lg:w-auto mt-3 lg:mt-0 shrink-0 border-l-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{minWidth: 0}}
                  >
                    {isSubscribing ? 'Suscribiendo...' : 'Suscribirse'}
                  </button>
                </div>
                {emailError && (
                  <p className="text-red-400 text-xs mt-1">{emailError}</p>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-slate-400 mb-4 md:mb-0">
              © 2026 Cuñadismo Ilustrado. Todos los derechos reservados.
            </div>
            
            <div className="flex space-x-6 text-sm">
              <button 
                onClick={() => navigateTo('/privacidad')}
                className="nav-link hover:text-spanish-yellow hover:underline transition-all duration-300 bg-transparent border-none p-0"
              >
                Política de Privacidad
              </button>
              <button 
                onClick={() => navigateTo('/terminos')}
                className="nav-link hover:text-spanish-yellow hover:underline transition-all duration-300 bg-transparent border-none p-0"
              >
                Términos y Condiciones
              </button>
              <button 
                onClick={() => navigateTo('/envios')}
                className="nav-link hover:text-spanish-yellow hover:underline transition-all duration-300 bg-transparent border-none p-0"
              >
                Envíos y Devoluciones
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Frase final cuñao */}
      <div className="bg-gradient-to-r from-spanish-red to-spanish-yellow py-3">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm font-serif italic text-shadow text-white">
            "En mi pueblo hacemos las camisetas mejor" - Tu cuñado favorito
          </p>
        </div>
      </div>
    </footer>
  );
};
