import React from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import BrandLogo from './BrandLogo';

export const Header: React.FC = () => {
  const { openCart, getTotalItems } = useCartStore();
  const cartShake = useCartStore(state => state.cartShake); // <-- OBTENER ESTADO DE ANIMACIÓN
  const location = useLocation();
  const { navigateTo } = useSmartNavigation();
  const totalItems = getTotalItems();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);

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

  const performMobileSearch = () => {
    if (searchQuery.trim()) {
      setIsMobileSearchOpen(false);
      navigateTo(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  React.useEffect(() => {
    // Disable body scroll when mobile menu or search modal is open
    if (isMobileMenuOpen || isMobileSearchOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev || '';
      };
    }
    return;
  }, [isMobileMenuOpen, isMobileSearchOpen]);
  return (
    <header className="bg-slate-900 shadow-dark-lg sticky top-0 z-50 border-b border-slate-700 relative">
      {/* Barra superior patriótica */}
      <div className="brand-header h-1"></div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18 py-3 gap-y-2">
          {/* Left: mobile menu button (only mobile) */}
          <div className="flex items-center min-w-[44px]">
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-slate-400 hover:text-spanish-yellow transition-colors duration-200 rounded-lg hover:bg-slate-800"
              aria-label="Menú"
            >
              {isMobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
            </button>
          </div>

          {/* Center: Brand logo - centered on mobile, left on desktop */}
          <div className="flex-1 flex justify-center md:justify-start items-center">
            <div className="flex items-center">
              <BrandLogo size="md" showText={true} onClick={() => handleNavClick('/')} />
            </div>
          </div>

          {/* Right: actions - search (mobile icon + desktop input) and cart */}
          <div className="flex items-center space-x-3 min-w-[120px] justify-end">
            {/* Mobile search button */}
            {location.pathname !== '/productos' && (
              <button
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden p-2 text-slate-400 hover:text-spanish-yellow transition-colors duration-200 rounded-lg hover:bg-slate-800"
                aria-label="Buscar"
              >
                <Search size={22} />
              </button>
            )}

            {/* Desktop search input */}
            {location.pathname !== '/productos' && (
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    navigateTo(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery('');
                  }
                }}
                className="hidden md:flex w-80 xl:w-96 justify-end"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-48 md:w-56 pl-10 pr-4 py-2 bg-slate-700/80 border border-slate-600 text-white placeholder-slate-400 rounded-lg transition-all duration-300 ease-out focus:outline-none focus:border-spanish-yellow focus:w-80 xl:focus:w-96 focus:placeholder-slate-300"
                  />
                  <Search size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </form>
            )}

            {/* Cart */}
            <button
              onClick={openCart}
              className={`relative p-2 text-slate-400 hover:text-spanish-yellow transition-colors duration-200 rounded-lg hover:bg-slate-800 hover:shadow-lg ${
                cartShake ? 'animate-cart-shake' : ''
              }`}
              aria-label="Carrito de compras"
            >
              <ShoppingCart size={25} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-spanish-red text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navegación móvil */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay de fondo */}
            <div
              className="fixed inset-0 bg-black/30 z-[9000]"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            {/* Menú móvil: panel desplegable desde el header (no oculta el header) */}
            <div className="absolute top-full left-0 right-0 z-50">
              <div className="w-full px-0">
                <div className="relative pointer-events-none">
                  <div
                    onClick={e => e.stopPropagation()}
                    className="pointer-events-auto w-full bg-gradient-to-b from-slate-900/95 to-slate-800/90 ring-1 ring-slate-700/40 rounded-b-2xl shadow-2xl p-4 pt-3 backdrop-blur-sm"
                  >
                    <nav className="mt-1 flex flex-col divide-y divide-slate-700/40">
                      <button onClick={() => handleMobileNavClick('/')} className="w-full text-left py-4 px-4 text-lg text-slate-200 hover:text-spanish-yellow transition-colors">Inicio</button>
                      <button onClick={() => handleMobileNavClick('/productos')} className="w-full text-left py-4 px-4 text-lg text-slate-200 hover:text-spanish-yellow transition-colors">Productos</button>
                      <button onClick={() => handleMobileNavClick('/destacados')} className="w-full text-left py-4 px-4 text-lg text-slate-200 hover:text-spanish-yellow transition-colors">Destacados</button>
                      <button onClick={() => handleMobileNavClick('/sobre-nosotros')} className="w-full text-left py-4 px-4 text-lg text-slate-200 hover:text-spanish-yellow transition-colors">Sobre Nosotros</button>
                      <button onClick={() => handleMobileNavClick('/contacto')} className="w-full text-left py-4 px-4 text-lg text-slate-200 hover:text-spanish-yellow transition-colors">Contacto</button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {/* Mobile search modal (renderizado en portal para cubrir todo el DOM) */}
        {isMobileSearchOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[99999] flex items-start justify-center" role="dialog" aria-modal="true">
            {/* Overlay negro semitransparente que evita scroll visual y captura clicks */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] pointer-events-auto"
              onClick={() => setIsMobileSearchOpen(false)}
            />

            <div className="w-full container mx-auto px-4 pointer-events-none">
              <div onClick={e => e.stopPropagation()} className="pointer-events-auto fixed top-0 left-0 right-0 mx-auto w-full bg-slate-800/60 ring-1 ring-slate-700/40 rounded-b-2xl shadow-md p-3 max-w-[1200px] z-[100000]">
                <div className="flex items-center space-x-3">
                  <button type="button" onClick={() => setIsMobileSearchOpen(false)} aria-label="Cerrar búsqueda" className="p-2 text-slate-400 hover:text-white rounded-lg">
                    <X size={20} />
                  </button>
                  <form className="flex-1" onSubmit={e => {
                    e.preventDefault();
                    performMobileSearch();
                  }}>
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar productos, categorías..."
                      className="w-full bg-white/5 text-white placeholder-slate-400 rounded-md px-3 py-2 focus:outline-none ring-0"
                    />
                  </form>
                  <button type="button" onClick={performMobileSearch} className="p-2 bg-slate-700/50 rounded-lg text-slate-300 hover:text-white" aria-label="Realizar búsqueda">
                    <Search size={20} />
                  </button>
                </div>
                <div className="mt-2 text-slate-400 text-sm text-center">Presiona Enter para buscar o toca para cerrar.</div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </header>
  );
};
 
