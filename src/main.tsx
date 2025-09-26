import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './suppress-warnings'
import './index.css'
import './swRegister'
import App from './App.tsx'
import CookieBanner from './components/CookieBanner'
import { getConsent } from './utils/consent'
import { useGtag, trackPageview } from './hooks/useGtag'

function Root() {
  const [consent, setConsent] = useState(() => getConsent());

  useEffect(() => {
    function onChange() { setConsent(getConsent()); }
    window.addEventListener('cunao.consent.changed', onChange as EventListener);
    return () => window.removeEventListener('cunao.consent.changed', onChange as EventListener);
  }, []);

  const analyticsEnabled = !!consent?.analytics;
  useGtag(analyticsEnabled);

  // Al montar la app en el navegador, forzar scroll al top y desactivar
  // el comportamiento por defecto de restauración de scroll del navegador.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if ('scrollRestoration' in history) {
        // Evitar que el navegador intente restaurar la posición previa (por ejemplo footer)
        (history as any).scrollRestoration = 'manual';
      }
    } catch (e) {
      // ignore
    }
    // Forzar el scroll al top en la carga inicial (incluye recargas)
    try { window.scrollTo({ top: 0, left: 0 }); } catch (e) {}
  }, []);

  // Si el consentimiento se activa después de cargar la página, forzar un pageview
  useEffect(() => {
    if (analyticsEnabled) {
      try {
        console.info('[consent] analytics enabled, sending initial pageview');
        trackPageview(window.location.pathname + window.location.search);
      } catch (e) {
        console.warn('Failed to send initial pageview', e);
      }
    }
  }, [analyticsEnabled]);

  return (
    <StrictMode>
      <App />
      <CookieBanner />
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(
  <Root />,
)

