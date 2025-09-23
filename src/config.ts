export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'https://backend.cunadismoilustrado.me/api',
  STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  PRINTIFY_API_URL: 'https://api.printify.com/v1',
  DOMAIN: import.meta.env.VITE_APP_URL || 'https://www.cunadismoilustrado.me/',
  // Valores añadidos desde src/config/index.ts
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Cuñadismo Ilustrado',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'La tienda más patriótica de España - Camisetas con frases auténticas',
  CURRENCY: import.meta.env.VITE_CURRENCY || 'EUR',
  KEYWORDS: import.meta.env.VITE_APP_KEYWORDS || 'camisetas españa, humor español, cuñadismo, patriótico, frases españolas',
  AUTHOR: import.meta.env.VITE_APP_AUTHOR || 'Cuñadismo Ilustrado',
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  SHOW_LOGS: import.meta.env.VITE_SHOW_LOGS === 'true',
  SOCIAL: {
    instagram: import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/cunadismo_ilustrado',
    x: import.meta.env.VITE_TWITTER_URL || 'https://x.com/cunadismo_ilustrado',
    tiktok: import.meta.env.VITE_TIKTOK_URL || 'https://www.tiktok.com/@cunadismo_ilustrado',
  },
  COMPANY: {
    name: import.meta.env.VITE_APP_NAME || 'Cuñadismo Ilustrado',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'La tienda más patriótica de España - Camisetas con frases auténticas',
    email: `info@${import.meta.env.VITE_DOMAIN || 'cunadismoilustrado.me'}`,
  },
  EMAILS: {
    main: `info@${import.meta.env.VITE_EMAIL_DOMAIN || 'cunadismoilustrado.me'}`,
    privacy: `privacidad@${import.meta.env.VITE_EMAIL_DOMAIN || 'cunadismoilustrado.me'}`,
    shipping: `envios@${import.meta.env.VITE_EMAIL_DOMAIN || 'cunadismoilustrado.me'}`,
    returns: `devoluciones@${import.meta.env.VITE_EMAIL_DOMAIN || 'cunadismoilustrado.me'}`,
    legal: `legal@${import.meta.env.VITE_EMAIL_DOMAIN || 'cunadismoilustrado.me'}`,
    noreply: `noreply@${import.meta.env.VITE_EMAIL_DOMAIN || 'cunadismoilustrado.me'}`,
  },
  EMAIL_INFO_TEXT: 'Los correos informativos y automáticos se envían desde la dirección noreply@' + (import.meta.env.VITE_EMAIL_DOMAIN || 'cunadismoilustrado.me') + '. Por favor, no respondas a estos mensajes.'
};

// Export default para compatibilidad
export default config;
