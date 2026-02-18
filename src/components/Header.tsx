import React from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X } from 'lucide-react';
import { useShippingConfig } from '../hooks/useShippingConfig';
import config, { MARQUEE_ITEMS } from '../config';
import { useCartStore } from '../stores/cartStore';
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import BrandLogo from './BrandLogo';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export const Header: React.FC = () => {
  const { openCart, getTotalItems } = useCartStore();
  const cartShake = useCartStore(state => state.cartShake); // <-- OBTENER ESTADO DE ANIMACIÓN
  const location = useLocation();
  const { navigateTo } = useSmartNavigation();
  const totalItems = getTotalItems();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  const [newsletterModalOpen, setNewsletterModalOpen] = React.useState(false);
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [isSubscribingNewsletter, setIsSubscribingNewsletter] = React.useState(false);
  const [newsletterEmailError, setNewsletterEmailError] = React.useState('');
  const headerRef = React.useRef<HTMLElement | null>(null);
  const bannerRef = React.useRef<HTMLDivElement | null>(null);
  const marqueeContentRef = React.useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = React.useState<number>(72);
  const [showBanner, setShowBanner] = React.useState<boolean>(true);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMenuThen = (action: () => void) => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      // Esperar la animación de cierre para mejor UX antes de ejecutar la acción
      setTimeout(action, 150);
    } else {
      action();
    }
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
    // Disable body scroll when mobile menu, search modal or newsletter modal is open
    if (isMobileMenuOpen || isMobileSearchOpen || newsletterModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev || '';
      };
    }
    return;
  }, [isMobileMenuOpen, isMobileSearchOpen, newsletterModalOpen]);

  React.useLayoutEffect(() => {
    const updateHeaderHeight = () => {
      const rect = headerRef.current ? headerRef.current.getBoundingClientRect() : { height: 72, bottom: 72 };
      setHeaderHeight(Math.round(rect.height));
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);
  React.useEffect(() => {
    // Update header height whenever banner visibility changes (so overlays position correctly)
    const update = () => {
      const rect = headerRef.current ? headerRef.current.getBoundingClientRect() : { height: 72 };
      setHeaderHeight(Math.round(rect.height));
    };
    update();
    const el = bannerRef.current;
    const onTransitionEnd = () => update();
    if (el) el.addEventListener('transitionend', onTransitionEnd as EventListener);
    // fallback: ensure headerHeight is correct after transition duration
    const timer = setTimeout(update, 350);
    return () => {
      if (el) el.removeEventListener('transitionend', onTransitionEnd as EventListener);
      clearTimeout(timer);
    };
  }, [showBanner]);

  React.useEffect(() => {
    // Hide banner as soon as the user scrolls down; show only when at top
    const onScroll = () => {
      setShowBanner(window.scrollY === 0);
    };
    // run once to set initial state (in case page loaded scrolled)
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Newsletter modal: show 5s after initial page load (not on SPA route changes)
  React.useEffect(() => {
    const key = 'newsletter_shown_v1';
    // If already shown, do nothing
    if (typeof window === 'undefined') return;
    try {
      if (localStorage.getItem(key)) return;
    } catch (e) {
      // ignore localStorage errors
    }

    let timer: number | undefined;
    // show only when at top-level document (not during server render)
    timer = window.setTimeout(() => {
      setNewsletterModalOpen(true);
    }, 5000);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const closeNewsletter = (persist = false) => {
    const key = 'newsletter_shown_v1';
    if (persist) {
      try {
        localStorage.setItem(key, '1');
      } catch (e) {
        // ignore
      }
    }
    setNewsletterModalOpen(false);
  };

  const submitNewsletter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Limpiar errores previos
    setNewsletterEmailError('');

    if (!newsletterEmail) {
      setNewsletterEmailError('Por favor, introduce tu email');
      toast.error('Por favor, introduce tu email');
      return;
    }

    // Validación básica de email - regex más estricto
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!emailRegex.test(newsletterEmail.trim()) || newsletterEmail.length > 100) {
      setNewsletterEmailError('El formato del email no es válido');
      toast.error('El formato del email no es válido');
      return;
    }

    const emailParts = newsletterEmail.trim().split('@');
    if (emailParts.length !== 2 || emailParts[0].length < 1 || emailParts[1].length < 3) {
      setNewsletterEmailError('El formato del email no es válido');
      toast.error('El formato del email no es válido');
      return;
    }

    // Validación del dominio (usamos la misma lógica que el Footer)
    const validateEmailDomain = (emailToCheck: string): { isValid: boolean; suggestion?: string } => {
      const blockedDomains = [
        '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org',
        'yopmail.com', 'temp-mail.org', 'throwaway.email', 'getnada.com',
        'maildrop.cc', 'mailnesia.com', 'trashmail.com', '33mail.com',
        'dispostable.com', 'fake-mail.ml', 'mohmal.com', 'emailfake.com'
      ];

      const trustedDomains = [
        'gmail.com', 'googlemail.com', 'google.com',
        'outlook.com', 'outlook.es', 'hotmail.com', 'hotmail.es', 'live.com', 'live.es', 'msn.com',
        'yahoo.com', 'yahoo.es', 'yahoo.fr', 'yahoo.it', 'yahoo.de', 'yahoo.co.uk',
        'telefonica.es', 'movistar.es', 'orange.es', 'vodafone.es', 'jazztel.es',
        'icloud.com', 'me.com', 'mac.com',
        'aol.com', 'protonmail.com', 'proton.me', 'tutanota.com',
        'uma.es', 'ucm.es', 'uam.es', 'upm.es', 'uc3m.es', 'urjc.es', 'uned.es',
        'gov.es', 'junta-andalucia.es', 'madrid.org',
        'empresa.com', 'company.com', 'corp.com', 'group.com',
        'mail.com', 'gmx.com', 'gmx.de', 'web.de', 'freenet.de',
        'libero.it', 'tin.it', 'alice.it',
        'free.fr', 'orange.fr', 'wanadoo.fr', 'laposte.net',
        'btinternet.com', 'sky.com', 'virgin.net', 'tiscali.co.uk'
      ];

      const emailPartsLocal = emailToCheck.toLowerCase().split('@');
      if (emailPartsLocal.length !== 2) return { isValid: false };
      const emailDomain = emailPartsLocal[1];

      // Validaciones de formato
      if (!emailDomain || emailDomain.length < 3 || emailDomain.length > 255) return { isValid: false };
      const domainParts = emailDomain.split('.');
      if (domainParts.length < 2) return { isValid: false };
      const extension = domainParts[domainParts.length - 1];
      if (extension.length < 2 || extension.length > 6) return { isValid: false };
      if (!/^[a-zA-Z]+$/.test(extension)) return { isValid: false };
      for (const part of domainParts) {
        if (!part || part.length < 1 || !/^[a-zA-Z0-9-]+$/.test(part)) return { isValid: false };
      }

      if (blockedDomains.includes(emailDomain)) return { isValid: false };

      if (!trustedDomains.includes(emailDomain)) {
        const commonDomains: Record<string, string> = {
          'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmeil.com': 'gmail.com',
          'hotmial.com': 'hotmail.com', 'hotmeil.com': 'hotmail.com',
          'yahooo.com': 'yahoo.com', 'yaho.com': 'yahoo.com',
          'outlok.com': 'outlook.com', 'outlock.com': 'outlook.com', 'email.xom': 'gmail.com'
        };
        if (commonDomains[emailDomain]) return { isValid: false, suggestion: emailToCheck.replace(emailDomain, commonDomains[emailDomain]) };
        return { isValid: false };
      }

      return { isValid: true };
    };

    const domainValidation = validateEmailDomain(newsletterEmail.trim());
    if (!domainValidation.isValid) {
      if (domainValidation.suggestion) {
        setNewsletterEmailError(`¿Quisiste decir ${domainValidation.suggestion}?`);
        toast.error(`¿Quisiste decir ${domainValidation.suggestion}?`);
      } else {
        setNewsletterEmailError('Por favor, usa un proveedor de email conocido (Gmail, Outlook, Yahoo, etc.)');
        toast.error('Por favor, usa un proveedor de email conocido (Gmail, Outlook, Yahoo, etc.)');
      }
      return;
    }

    setIsSubscribingNewsletter(true);
    (async () => {
      try {
        await apiService.subscribeToNewsletter(newsletterEmail.trim());
        toast.success('¡Te has suscrito correctamente al newsletter!');
        setNewsletterEmail('');
        setNewsletterEmailError('');
        closeNewsletter(true);
      } catch (err: any) {
        const errorMessage = err.response?.data?.error || 'Error al suscribirse';
        setNewsletterEmailError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsSubscribingNewsletter(false);
      }
    })();
  };

  React.useEffect(() => {
    // Adjust marquee duration to keep constant px/s across screen sizes
    const updateMarqueeDuration = () => {
      try {
        const content = marqueeContentRef.current;
        const track = bannerRef.current;
        if (!content || !track) return;
        const contentWidth = content.getBoundingClientRect().width;
        const trackWidth = track.getBoundingClientRect().width || window.innerWidth;
        // Distance to travel equals contentWidth/2 (animation translates -50%) + trackWidth
        const distance = Math.max(contentWidth / 2 + trackWidth, 300);
        const pxPerSecond = 120; // adjust speed here (px per second)
        const seconds = Math.max(distance / pxPerSecond, 6); // minimum 6s for readability
        const root = document.documentElement;
        root.style.setProperty('--marquee-duration', `${seconds}s`);
      } catch (e) {
        // noop
      }
    };
    updateMarqueeDuration();
    window.addEventListener('resize', updateMarqueeDuration);
    return () => window.removeEventListener('resize', updateMarqueeDuration);
  }, []);
  const shippingConfig = useShippingConfig(import.meta.env.VITE_API_URL || config.API_URL);
  const FREE_SHIPPING_THRESHOLD = shippingConfig.freeShippingThreshold || 55;

  return (
  <header ref={headerRef} className="bg-slate-900 shadow-dark-lg sticky top-0 z-50 border-b border-slate-700 relative">
      {/* Barra superior de beneficios (presente en DOM, se oculta con transición) */}
      <div
        ref={bannerRef}
        className={`w-full bg-gradient-to-r from-spanish-red to-orange-600 text-white overflow-hidden transition-[height,opacity] duration-300 ease-in-out ${showBanner ? 'h-10 opacity-100' : 'h-0 opacity-0'}`}>
          <div className="marquee-track h-10 w-full">
            <div ref={marqueeContentRef} className="marquee-content animate-marquee text-sm lg:text-base">
              {Array.from({ length: 4 }).map((_, groupIdx) => (
                <div className="marquee-group flex items-center mr-12 lg:mr-16" key={`marquee-${groupIdx}`}>
                  {MARQUEE_ITEMS.map((t, i) => (
                    <React.Fragment key={`m${groupIdx}-${i}`}>
                      <span className="marquee-item">{t.replace('{FREE_SHIPPING_THRESHOLD}', String(FREE_SHIPPING_THRESHOLD))}</span>
                      {i < MARQUEE_ITEMS.length - 1 && <span className="marquee-sep">|</span>}
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
          </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18 py-3 gap-y-2">
          {/* Left: mobile menu button (only mobile) */}
          <div className="flex items-center min-w-[44px]">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-slate-400 hover:text-spanish-yellow transition-colors duration-200 rounded-lg hover:bg-slate-800"
              aria-label="Menú"
            >
              {isMobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
            </button>
          </div>

          {/* Logo: left on desktop, centered on mobile */}
          <div className="flex items-center shrink-0 min-w-[180px]">
            <BrandLogo size="md" showText={true} onClick={() => closeMenuThen(() => handleNavClick('/'))} />
          </div>

          {/* Navegación desktop centrada y adaptable */}
          <div className="hidden lg:flex flex-1 justify-center min-w-[220px]">
            {/* Ajuste: envolver nav para desplazarlo ligeramente a la derecha en pantallas anchas
                para evitar solapamiento con el logo a la izquierda y la lupa a la derecha. */}
            <div className="nav-shift w-full max-w-[780px] flex justify-center">
              <nav className="flex items-center space-x-4 ml-6 lg:ml-12 xl:ml-16">
              <button onClick={() => handleNavClick('/')} className="nav-link font-semibold transition-colors duration-200 hover:text-spanish-yellow relative group bg-transparent border-none cursor-pointer">Inicio<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-spanish-yellow transition-all duration-300 group-hover:w-full"></span></button>
              <button onClick={() => handleNavClick('/productos')} className="nav-link font-semibold transition-colors duration-200 hover:text-spanish-yellow relative group bg-transparent border-none cursor-pointer">Productos<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-spanish-yellow transition-all duration-300 group-hover:w-full"></span></button>
              <button onClick={() => handleNavClick('/destacados')} className="nav-link font-semibold transition-colors duration-200 hover:text-spanish-yellow relative group bg-transparent border-none cursor-pointer">Destacados<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-spanish-yellow transition-all duration-300 group-hover:w-full"></span></button>
              <button onClick={() => handleNavClick('/sobre-nosotros')} className="nav-link font-semibold transition-colors duration-200 hover:text-spanish-yellow relative group bg-transparent border-none cursor-pointer">Sobre Nosotros<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-spanish-yellow transition-all duration-300 group-hover:w-full"></span></button>
              <button onClick={() => handleNavClick('/contacto')} className="nav-link font-semibold transition-colors duration-200 hover:text-spanish-yellow relative group bg-transparent border-none cursor-pointer">Contacto<span className="absolute bottom-0 left-0 w-0 h-0.5 bg-spanish-yellow transition-all duration-300 group-hover:w-full"></span></button>
              </nav>
            </div>
          </div>

          {/* Right: actions - search (mobile icon + desktop input) and cart */}
          <div className="flex items-center space-x-3 min-w-[120px] justify-end">
            {/* Mobile search button */}
            {location.pathname !== '/productos' && (
              <button
                onClick={() => closeMenuThen(() => setIsMobileSearchOpen(true))}
                className="lg:hidden p-2 text-slate-400 hover:text-spanish-yellow transition-colors duration-200 rounded-lg hover:bg-slate-800"
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
                className="hidden lg:flex w-80 xl:w-96 justify-end"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-48 lg:w-56 pl-10 pr-4 py-2 bg-slate-700/80 border border-slate-600 text-white placeholder-slate-400 rounded-lg transition-all duration-300 ease-out focus:outline-none focus:border-spanish-yellow focus:w-60 xl:focus:w-96 focus:placeholder-slate-300"
                  />
                  <Search size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </form>
            )}

            {/* Cart */}
            <button
              onClick={() => closeMenuThen(openCart)}
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
            {/* Overlay de fondo: empieza justo debajo del header para no ocultarlo */}
            <div
              className="fixed left-0 right-0 bottom-0 bg-black/70 backdrop-blur-sm z-50] pointer-events-auto"
              style={{ top: `${headerHeight}px` }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
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
        {/* Newsletter modal (aparece 5s después de entrar por primera vez) */}
        {newsletterModalOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[100000] flex items-center justify-center" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[100000]" onClick={() => closeNewsletter(false)} />

            <div className="pointer-events-none w-full max-w-full px-4 flex items-center justify-center">
              <div
                onClick={e => e.stopPropagation()}
                className="pointer-events-auto relative w-full max-w-md text-white rounded-lg shadow-2xl p-6 z-[100001]"
                style={{
                  backgroundImage: `linear-gradient(rgba(15,23,42,0.65), rgba(15,23,42,0.65)), url('/newsletter-modal.webp')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <button aria-label="Cerrar" onClick={() => closeNewsletter(false)} className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X size={18} />
                </button>
                <h3 className="text-lg font-semibold mb-2 text-center pr-5">Dame tu mail y te mando las mejores perlas del cuñadismo</h3>
                <p className="text-sm text-slate-300 mb-4 text-center">Es para las frases de cuñao semanales: te enviamos consejos, trucos y perlas para ser el mejor cuñao de España. Nada de spam.</p>
                <form onSubmit={submitNewsletter} className="space-y-3">
                  <div className="w-full">
                    <input
                      type="email"
                      value={newsletterEmail}
                      onChange={e => {
                        setNewsletterEmail(e.target.value);
                        if (newsletterEmailError) setNewsletterEmailError('');
                      }}
                      placeholder="Escribe tu correo"
                      required
                      className={`w-full px-3 py-2 bg-slate-700 border text-white placeholder-slate-400 rounded-md focus:outline-none transition-colors border-slate-600 focus:ring-spanish-yellow focus:border-spanish-yellow ${newsletterEmailError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                    />
                    {newsletterEmailError && <div className="mt-2 text-sm text-red-400">{newsletterEmailError}</div>}
                  </div>
                  <div className="w-full">
                    <button
                      type="submit"
                      disabled={isSubscribingNewsletter}
                      className={`w-full px-4 py-2 bg-spanish-yellow text-slate-900 font-semibold hover:bg-yellow-400 transition-colors rounded-md ${isSubscribingNewsletter ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {isSubscribingNewsletter ? 'Enviando...' : 'Quiero ser un supercuñao'}
                    </button>
                  </div>
                </form>
                <div className="mt-3 text-center">
                  <button onClick={() => closeNewsletter(true)} className="text-sm text-slate-300 hover:text-slate-100">Paso, gracias</button>
                </div>
              </div>
            </div>
          </div>,
          document.body
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
 
