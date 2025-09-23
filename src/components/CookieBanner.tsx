import React, { useState, useEffect } from 'react';
import { getConsent, saveConsent } from '../utils/consent';

export const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const c = getConsent();
    if (!c) setVisible(true);
  }, []);

  function acceptAll() {
    saveConsent({ analytics: true, marketing: true });
    setVisible(false);
    window.dispatchEvent(new CustomEvent('cunao.consent.changed'));
  }

  function acceptNecessary() {
    saveConsent({ analytics: false, marketing: false });
    setVisible(false);
    window.dispatchEvent(new CustomEvent('cunao.consent.changed'));
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:bottom-8 z-50">
      <div className="bg-white text-slate-800 p-4 md:p-6 rounded-lg shadow-lg flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 text-sm">
          Usamos analítica para mejorar la web. Puedes aceptar todas las cookies o solo las necesarias.
        </div>
        <div className="flex gap-2">
          <button onClick={acceptNecessary} className="px-4 py-2 border rounded">Solo necesarias</button>
          <button onClick={acceptAll} className="px-4 py-2 bg-spanish-red text-white rounded">Aceptar todo</button>
          <a href="/privacidad" className="px-3 py-2 text-sm underline">Política</a>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
