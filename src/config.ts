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
    main: `info@${import.meta.env.VITE_EMAIL_DOMAIN || 'cunadismoilustrado.me'}`,
    privacy: `privacidad@${import.meta.env.VITE_EMAIL_DOMAIN || 'cunadismoilustrado.me'}`,
    pedidos: `pedidos@${import.meta.env.VITE_EMAIL_DOMAIN || 'cunadismoilustrado.me'}`,
    legal: `legal@${import.meta.env.VITE_EMAIL_DOMAIN || 'cunadismoilustrado.me'}`,
  }
};

// Export default para compatibilidad
export default config;
