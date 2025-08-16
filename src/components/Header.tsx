import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import BrandLogo from './BrandLogo';

interface HeaderProps {
  onSearchClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { getTotalItems, openCart } = useCartStore();
  const { navigateTo } = useSmartNavigation();
  const totalItems = getTotalItems();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (path: string) => {
    navigateTo(path);
  };

  const handleMobileNavClick = (path: string) => {
    setIsMobileMenuOpen(false);
    navigateTo(path);
  };

  return (
    <header className="bg-slate-900 shadow-dark-lg sticky top-0 z-50 border-b border-slate-700 relative">
      {/* Barra superior patriótica */}
      <div className="brand-header h-1"></div>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18 py-3">
          {/* Logo de marca */}
          <BrandLogo size="md" showText={true} onClick={() => handleNavClick('/')} />

          {/* Navegación desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => handleNavClick('/')}
              className="nav-link font-semibold transition-all duration-300 hover:text-spanish-yellow hover:scale-105 relative group bg-transparent border-none cursor-pointer"
            >
              Inicio
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-spanish-yellow transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button 
              onClick={() => handleNavClick('/productos')}
              className="nav-link font-semibold transition-all duration-300 hover:text-spanish-yellow hover:scale-105 relative group bg-transparent border-none cursor-pointer"
            >
              Productos
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-spanish-yellow transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button 
              onClick={() => handleNavClick('/destacados')}
              className="nav-link font-semibold transition-all duration-300 hover:text-spanish-yellow hover:scale-105 relative group bg-transparent border-none cursor-pointer"
            >
              Destacados
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-spanish-yellow transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button 
              onClick={() => handleNavClick('/sobre-nosotros')}
              className="nav-link font-semibold transition-all duration-300 hover:text-spanish-yellow hover:scale-105 relative group bg-transparent border-none cursor-pointer"
            >
              Sobre Nosotros
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-spanish-yellow transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button 
              onClick={() => handleNavClick('/contacto')}
              className="nav-link font-semibold transition-all duration-300 hover:text-spanish-yellow hover:scale-105 relative group bg-transparent border-none cursor-pointer"
            >
              Contacto
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-spanish-yellow transition-all duration-300 group-hover:w-full"></span>
            </button>
          </nav>

          {/* Acciones */}
          <div className="flex items-center space-x-4">
            {/* Búsqueda */}
            <button
              onClick={onSearchClick}
              className="p-2 text-slate-400 hover:text-spanish-yellow transition-all duration-300 rounded-lg hover:bg-slate-800 hover:scale-110 hover:shadow-lg"
              aria-label="Buscar"
            >
              <Search size={20} />
            </button>

            {/* Carrito */}
            <button
              onClick={openCart}
              className="relative p-2 text-slate-400 hover:text-spanish-yellow transition-all duration-300 rounded-lg hover:bg-slate-800 hover:scale-110 hover:shadow-lg"
              aria-label="Carrito de compras"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-spanish-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Menú móvil toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-slate-400 hover:text-spanish-yellow transition-all duration-300 rounded-lg hover:bg-slate-800 hover:scale-110"
              aria-label="Menú"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Navegación móvil */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay de fondo */}
            <div 
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            
            {/* Menú móvil */}
            <div className="md:hidden absolute top-full left-0 right-0 bg-slate-800 border-t border-slate-700 shadow-xl z-40">
              <nav className="flex flex-col py-2">
                <button 
                  onClick={() => handleMobileNavClick('/')}
                  className="px-6 py-4 text-slate-300 hover:text-spanish-yellow hover:bg-slate-700 transition-all duration-300 font-semibold hover:translate-x-2 border-b border-slate-700 text-left bg-transparent border-none w-full"
                >
                  Inicio
                </button>
                <button 
                  onClick={() => handleMobileNavClick('/productos')}
                  className="px-6 py-4 text-slate-300 hover:text-spanish-yellow hover:bg-slate-700 transition-all duration-300 font-semibold hover:translate-x-2 border-b border-slate-700 text-left bg-transparent border-none w-full"
                >
                  Productos
                </button>
                <button 
                  onClick={() => handleMobileNavClick('/destacados')}
                  className="px-6 py-4 text-slate-300 hover:text-spanish-yellow hover:bg-slate-700 transition-all duration-300 font-semibold hover:translate-x-2 border-b border-slate-700 text-left bg-transparent border-none w-full"
                >
                  Destacados
                </button>
                <button 
                  onClick={() => handleMobileNavClick('/sobre-nosotros')}
                  className="px-6 py-4 text-slate-300 hover:text-spanish-yellow hover:bg-slate-700 transition-all duration-300 font-semibold hover:translate-x-2 border-b border-slate-700 text-left bg-transparent border-none w-full"
                >
                  Sobre Nosotros
                </button>
                <button 
                  onClick={() => handleMobileNavClick('/contacto')}
                  className="px-6 py-4 text-slate-300 hover:text-spanish-yellow hover:bg-slate-700 transition-all duration-300 font-semibold hover:translate-x-2 text-left bg-transparent border-none w-full"
                >
                  Contacto
                </button>
              </nav>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
