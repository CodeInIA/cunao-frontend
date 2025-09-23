export const config = {
  // URLs de API
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
  // Stripe
  STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  
  // Configuraciones de la app
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Cuñadismo Ilustrado',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || 'La tienda más patriótica de España - Camisetas con frases auténticas',
  APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  DOMAIN: import.meta.env.VITE_DOMAIN || 'cunadismoilustrado.com',
  
  // Moneda y costos
  CURRENCY: import.meta.env.VITE_CURRENCY || 'EUR',
  DEFAULT_SHIPPING_COST: Number(import.meta.env.VITE_DEFAULT_SHIPPING_COST) || 5.99,
  
  // SEO
  KEYWORDS: import.meta.env.VITE_APP_KEYWORDS || 'camisetas españa, humor español, cuñadismo, patriótico, frases españolas',
  AUTHOR: import.meta.env.VITE_APP_AUTHOR || 'Cuñadismo Ilustrado',
  
  // Desarrollo
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  SHOW_LOGS: import.meta.env.VITE_SHOW_LOGS === 'true',
  
  // Información de la empresa
  COMPANY: {
    name: import.meta.env.VITE_APP_NAME || 'Cuñadismo Ilustrado',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'La tienda más patriótica de España - Camisetas con frases auténticas',
    email: `info@${import.meta.env.VITE_DOMAIN || 'cunadismoilustrado.me'}`,
  },

  EMAILS: {
    main: `info@${import.meta.env.VITE_DOMAIN || 'cunadismoilustrado.me'}`,
    legal: `legal@${import.meta.env.VITE_DOMAIN || 'cunadismoilustrado.me'}`,
    privacy: `privacidad@${import.meta.env.VITE_DOMAIN || 'cunadismoilustrado.me'}`,
    shipping: `envios@${import.meta.env.VITE_DOMAIN || 'cunadismoilustrado.me'}`,
    returns: `devoluciones@${import.meta.env.VITE_DOMAIN || 'cunadismoilustrado.me'}`
  },
  
  // Redes sociales
  SOCIAL: {
    instagram: import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/cunadismo_ilustrado',
    x: import.meta.env.VITE_X_URL || 'https://x.com/cunadismo_ilustrado',
    tiktok: import.meta.env.VITE_TIKTOK_URL || 'https://tiktok.com/@cunadismo_ilustrado'
  }
} as const;

export default config;

