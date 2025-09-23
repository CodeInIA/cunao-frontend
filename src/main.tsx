import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './suppress-warnings'
import './index.css'
import './swRegister'
import App from './App.tsx'
import CookieBanner from './components/CookieBanner'
import { getConsent } from './utils/consent'
import { useGtag } from './hooks/useGtag'

function Root() {
  const [consent, setConsent] = useState(() => getConsent());

  useEffect(() => {
    function onChange() { setConsent(getConsent()); }
    window.addEventListener('cunao.consent.changed', onChange as EventListener);
    return () => window.removeEventListener('cunao.consent.changed', onChange as EventListener);
  }, []);

  const analyticsEnabled = !!consent?.analytics;
  useGtag(analyticsEnabled);

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

