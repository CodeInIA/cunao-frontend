import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin } from 'lucide-react';
import { SocialIcon } from 'react-social-icons';
import BrandLogo from './BrandLogo';
import config from '../config';

export const Footer: React.FC = () => {
  return (
    <footer className="footer-dark text-white">
      {/* Barra superior patriótica */}
      <div className="brand-header h-1"></div>
      
      <div className="container mx-auto px-4 py-12">
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
                <Link to="/" className="nav-link hover:text-spanish-yellow hover:translate-x-1 transition-all duration-300">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/productos" className="nav-link hover:text-spanish-yellow hover:translate-x-1 transition-all duration-300">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/destacados" className="nav-link hover:text-spanish-yellow hover:translate-x-1 transition-all duration-300">
                  Destacados
                </Link>
              </li>
              <li>
                <Link to="/sobre-nosotros" className="nav-link hover:text-spanish-yellow hover:translate-x-1 transition-all duration-300">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="nav-link hover:text-spanish-yellow hover:translate-x-1 transition-all duration-300">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-spanish-yellow" />
                <a 
                  href={`mailto:${config.EMAILS.main}`}
                  className="text-slate-300 hover:text-spanish-yellow transition-colors duration-300 hover:underline"
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
              <div className="flex">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-l-md focus:outline-none focus:ring-2 focus:ring-spanish-yellow focus:border-spanish-yellow"
                />
                <button className="px-4 py-2 bg-spanish-yellow text-slate-900 font-semibold hover:bg-yellow-400 transition-colors rounded-r-md">
                  Suscribirse
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-slate-400 mb-4 md:mb-0">
              © 2025 Cuñadismo Ilustrado. Todos los derechos reservados.
            </div>
            
            <div className="flex space-x-6 text-sm">
              <Link to="/privacidad" className="nav-link hover:text-spanish-yellow hover:underline transition-all duration-300">
                Política de Privacidad
              </Link>
              <Link to="/terminos" className="nav-link hover:text-spanish-yellow hover:underline transition-all duration-300">
                Términos y Condiciones
              </Link>
              <Link to="/envios" className="nav-link hover:text-spanish-yellow hover:underline transition-all duration-300">
                Envíos y Devoluciones
              </Link>
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
