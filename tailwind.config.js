/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tema oscuro con acentos patrióticos españoles
        dark: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#16181b',
          950: '#0d0f11',
        },
        // Acentos patrióticos españoles
        'spanish-red': '#AA151B',
        'spanish-darkred': '#8B1117', 
        'spanish-yellow': '#F1BF00',
        'spanish-gold': '#D1A000',
        'spanish-cream': '#FFF8DC',
        // Colores neutros para el tema oscuro
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'serif': ['Merriweather', 'serif'],
        'display': ['Playfair Display', 'serif'],
        'patriot': ['Merriweather', 'serif'],
      },
      backgroundImage: {
        'spain-flag': 'linear-gradient(to bottom, #AA151B 0%, #AA151B 25%, #F1BF00 25%, #F1BF00 75%, #AA151B 75%, #AA151B 100%)',
        'patriot-gradient': 'linear-gradient(135deg, #AA151B 0%, #F1BF00 50%, #AA151B 100%)',
        'dark-pattern': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
      },
      boxShadow: {
        'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
}
