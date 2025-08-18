export const config = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  STRIPE_PUBLIC_KEY: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
  PRINTIFY_API_URL: 'https://api.printify.com/v1',
  DOMAIN: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  SOCIAL: {
    instagram: import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/cunadismo_ilustrado',
    x: import.meta.env.VITE_TWITTER_URL || 'https://x.com/cunadismo_ilustrado',
    tiktok: import.meta.env.VITE_FACEBOOK_URL || 'https://tiktok.com/cunadismo.ilustrado',
  },
  EMAILS: {
    main: 'info@cunadismo-ilustrado.com',
    privacy: 'privacidad@cunadismo-ilustrado.com',
    returns: 'devoluciones@cunadismo-ilustrado.com',
    shipping: 'envios@cunadismo-ilustrado.com',
    legal: 'legal@cunadismo-ilustrado.com',
  }
};

// Export default para compatibilidad
export default config;
