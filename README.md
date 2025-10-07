# 🛍️ Cuñadismo Ilustrado - Frontend

<div align="center">

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Integrated-008CDD?style=for-the-badge&logo=stripe&logoColor=white)

Frontend moderno para la tienda online "Cuñadismo Ilustrado" - Una experiencia de e-commerce completa con React 19, diseño español auténtico y rendimiento optimizado.

[Características](#-características-principales) •
[Demo](#-demo) •
[Instalación](#-instalación) •
[Documentación](#-documentación)

</div>

---

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Tecnologías](#️-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Componentes Principales](#️-componentes-principales)
- [Testing](#-testing)
- [Optimización y Rendimiento](#-optimización-y-rendimiento)
- [Despliegue](#-despliegue)
- [SEO](#-seo)
- [Accesibilidad](#♿-accesibilidad)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## 🎨 Características Principales

### 🛒 E-commerce Completo
- **Catálogo de productos** con imágenes optimizadas y lazy loading
- **Carrito de compras** persistente con Zustand
- **Checkout seguro** integrado con Stripe Payment Elements
- **Búsqueda y filtrado** en tiempo real
- **Sistema de reviews** con calificaciones de estrellas
- **Descuentos automáticos** con códigos promocionales
- **Seguimiento de pedidos** en tiempo real

### 🎯 Experiencia de Usuario
- **100% Responsive** - Diseño mobile-first perfecto en todos los dispositivos
- **Loading states** y skeletons para mejor UX
- **Animaciones fluidas** y transiciones suaves
- **Notificaciones toast** con React Hot Toast
- **Modal de newsletter** con preferencias personalizadas
- **Navegación intuitiva** con React Router DOM 7
- **Imágenes optimizadas** con formato WebP

### 🇪🇸 Diseño Español Auténtico
- **Colores patrióticos** - Rojo (#CC0000) y amarillo (#FFD700)
- **Tipografía única** - Fuentes personalizadas
- **Temática cultural** - Iconografía y elementos españoles
- **Humor local** - Contenido adaptado al público español
- **Modo oscuro** con diseño de marca único

### ⚡ Rendimiento y Optimización
- **Vite** - Build ultrarrápido con HMR instantáneo
- **Code splitting** automático por rutas
- **Lazy loading** de componentes e imágenes
- **Tree shaking** para bundle mínimo
- **Compresión Gzip/Brotli** en producción
- **PWA Ready** con Service Worker
- **Lighthouse Score** > 95 en todas las métricas

### 🔐 Seguridad y Validación
- **TypeScript completo** - Type safety end-to-end
- **Validación de formularios** robusta
- **Sanitización de inputs** para prevenir XSS
- **HTTPS only** en producción
- **CSP Headers** configurados
- **Stripe PCI Compliance** - No almacenamos datos de tarjetas

### 📊 Analytics y SEO
- **Google Analytics 4** integrado
- **Meta tags dinámicos** por página
- **Sitemap.xml** generado
- **Robots.txt** configurado
- **Schema.org markup** para productos
- **Open Graph** para redes sociales
- **Canonical URLs** para evitar duplicados

## 🛠️ Tecnologías

### Core Framework
- **[React](https://react.dev/)** `19.2.0` - Biblioteca UI con las últimas características
- **[TypeScript](https://www.typescriptlang.org/)** `5.x` - Superset tipado de JavaScript
- **[Vite](https://vitejs.dev/)** `6.x` - Build tool de nueva generación

### Styling y UI
- **[Tailwind CSS](https://tailwindcss.com/)** `3.x` - Framework CSS utility-first
- **[Material UI](https://mui.com/)** `7.x` - Componentes React premium
- **[Emotion](https://emotion.sh/)** `11.x` - CSS-in-JS para MUI
- **[Lucide React](https://lucide.dev/)** - Iconos modernos y consistentes
- **[PostCSS](https://postcss.org/)** - Procesamiento de CSS
- **[Autoprefixer](https://github.com/postcss/autoprefixer)** - Vendor prefixes automáticos
- **[Tailwind Scrollbar](https://github.com/adoxography/tailwind-scrollbar)** - Scrollbars personalizados

### State Management & Routing
- **[Zustand](https://github.com/pmndrs/zustand)** `5.x` - Estado global minimalista y rápido
- **[React Router DOM](https://reactrouter.com/)** `7.x` - Routing declarativo para SPA
- **[React Hot Toast](https://react-hot-toast.com/)** `2.x` - Notificaciones elegantes

### Payments & HTTP
- **[@stripe/react-stripe-js](https://stripe.com/docs/stripe-js/react)** `5.x` - Componentes React de Stripe
- **[@stripe/stripe-js](https://github.com/stripe/stripe-js)** `8.x` - SDK de Stripe
- **[Axios](https://axios-http.com/)** `1.x` - Cliente HTTP con interceptores

### Utilities
- **[clsx](https://github.com/lukeed/clsx)** - Utilidad para classNames condicionales
- **[React Social Icons](https://github.com/jaketrent/react-social-icons)** - Iconos de redes sociales

### Testing
- **[Vitest](https://vitest.dev/)** `3.x` - Framework de testing ultrarrápido
- **[@testing-library/react](https://testing-library.com/react)** `16.x` - Testing centrado en usuario
- **[@testing-library/user-event](https://testing-library.com/docs/user-event/intro)** `14.x` - Interacciones de usuario
- **[@testing-library/jest-dom](https://testing-library.com/docs/ecosystem-jest-dom/)** `6.x` - Matchers personalizados
- **[@vitest/ui](https://vitest.dev/guide/ui.html)** - Interfaz web para tests
- **[jsdom](https://github.com/jsdom/jsdom)** - Implementación DOM para tests

### Development Tools
- **[ESLint](https://eslint.org/)** `9.x` - Linter de JavaScript/TypeScript
- **[Prettier](https://prettier.io/)** (Recomendado) - Formateador de código
cunao-frontend/
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── pages/           # Páginas principales
│   ├── stores/          # Estado Zustand
│   ├── services/        # APIs
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utilidades
│   ├── types/           # TypeScript
│   ├── __tests__/       # 39 tests
│   └── App.tsx
├── public/              # Assets estáticos
├── .github/workflows/   # 16 workflows
├── package.json
├── vite.config.ts
├── vitest.config.ts
- **[Prettier](https://prettier.io/)** (Recomendado) - Formateador de código

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0 ([Descargar](https://nodejs.org/))
- **npm** >= 9.0.0 (incluido con Node.js)
- **Git** ([Descargar](https://git-scm.com/))

### Backend API

Este frontend requiere el backend de Cuñadismo Ilustrado corriendo:

- **Repositorio**: [cunao-backend](https://github.com/CodeInIA/cunao-backend)
- **Puerto por defecto**: 3000
- **Ver documentación del backend** para instrucciones de instalación

## 🔧 Instalación

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/CodeInIA/cunao-frontend.git
cd cunao-frontend
```

### 2️⃣ Instalar Dependencias

```bash
npm install
```

### 3️⃣ Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# ======================
# API CONFIGURATION
# ======================
# Backend API URL
VITE_API_URL=http://localhost:3000/api

# Producción:
# VITE_API_URL=https://tu-backend.herokuapp.com/api

# ======================
# STRIPE CONFIGURATION
# ======================
# Stripe Publishable Key (Test)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxxxxxx

# Producción (Live):
# VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51xxxxxxxxxxxxx

# ======================
# GOOGLE ANALYTICS
# ======================
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ======================
# ENVIRONMENT
# ======================
VITE_ENV=development
# VITE_ENV=production
```

> **⚠️ Importante**: Todas las variables de entorno en Vite deben tener el prefijo `VITE_`

### 4️⃣ Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

## 🚀 Uso

### Scripts Disponibles

```bash
# Desarrollo (con HMR)
npm run dev

# Build para producción
npm run build

# Preview del build de producción
npm run preview

# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con interfaz UI
npm run test:ui

# Tests con reporte de cobertura
npm run test:coverage

# Linter
npm run lint

# Type checking
tsc --noEmit
```

### Flujo de Desarrollo

1. **Iniciar backend** (puerto 3000)
2. **Iniciar frontend** con `npm run dev`
3. **Navegar** a `http://localhost:5173`
4. **Hot Module Replacement** automático al guardar

### Build de Producción

```bash
# Compilar para producción
npm run build

# Los archivos compilados estarán en /dist
# Preview local del build
npm run preview
```

## 📁 Estructura del Proyecto

```
cunao-frontend/
├── public/                      # Archivos estáticos
│   ├── favicons/               # Iconos para diferentes dispositivos
│   ├── people/                 # Imágenes de personas/testimonios
│   ├── bar-image.webp          # Imágenes optimizadas WebP
│   ├── contact-wallpaper.webp
│   ├── logo-sin-letras.webp
│   ├── newsletter-modal.webp
│   ├── pool.webp
│   ├── pueblo.webp
│   ├── manifest.webmanifest    # PWA manifest
│   ├── robots.txt              # SEO
│   ├── sitemap.xml             # SEO
│   └── sw.js                   # Service Worker
│
├── src/
│   ├── components/             # Componentes React reutilizables
│   │   ├── cart/              # Carrito de compras
│   │   │   ├── Cart.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CartSummary.tsx
│   │   │
│   │   ├── checkout/          # Proceso de checkout
│   │   │   ├── CheckoutForm.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── ShippingForm.tsx
│   │   │
│   │   ├── common/            # Componentes comunes
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   └── Toast.tsx
│   │   │
│   │   ├── layout/            # Layout principal
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── Navbar.tsx
│   │   │
│   │   ├── newsletter/        # Newsletter
│   │   │   ├── NewsletterModal.tsx
│   │   │   └── NewsletterForm.tsx
│   │   │
│   │   ├── products/          # Productos
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── ProductFilters.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── ProductSearch.tsx
│   │   │
│   │   └── reviews/           # Reviews
│   │       ├── ReviewCard.tsx
│   │       ├── ReviewForm.tsx
│   │       └── ReviewList.tsx
│   │
│   ├── pages/                 # Páginas de la aplicación
│   │   ├── Home.tsx           # Página principal
│   │   ├── Products.tsx       # Catálogo de productos
│   │   ├── ProductDetail.tsx  # Detalle de producto
│   │   ├── Cart.tsx           # Página del carrito
│   │   ├── Checkout.tsx       # Proceso de compra
│   │   ├── Success.tsx        # Confirmación de compra
│   │   ├── Contact.tsx        # Contacto
│   │   ├── About.tsx          # Sobre nosotros
│   │   ├── FAQ.tsx            # Preguntas frecuentes
│   │   ├── PrivacyPolicy.tsx  # Política de privacidad
│   │   ├── TermsConditions.tsx # Términos y condiciones
│   │   └── NotFound.tsx       # 404
│   │
│   ├── stores/                # Zustand stores
│   │   ├── cartStore.ts       # Estado del carrito
│   │   ├── authStore.ts       # Autenticación (si aplica)
│   │   └── uiStore.ts         # Estado UI (modals, etc)
│   │
│   ├── services/              # Servicios API
│   │   ├── api.ts             # Cliente Axios configurado
│   │   ├── productService.ts  # Endpoints de productos
│   │   ├── orderService.ts    # Endpoints de pedidos
│   │   ├── discountService.ts # Endpoints de descuentos
│   │   ├── reviewService.ts   # Endpoints de reviews
│   │   └── newsletterService.ts # Endpoints de newsletter
│   │
│   ├── hooks/                 # Custom React Hooks
│   │   ├── useCart.ts         # Hook del carrito
│   │   ├── useProducts.ts     # Hook de productos
│   │   ├── useCheckout.ts     # Hook de checkout
│   │   └── useLocalStorage.ts # Hook de localStorage
│   │
│   ├── types/                 # Definiciones TypeScript
│   │   ├── index.ts           # Tipos principales
│   │   ├── product.ts         # Tipos de productos
│   │   ├── order.ts           # Tipos de pedidos
│   │   ├── cart.ts            # Tipos del carrito
│   │   └── api.ts             # Tipos de respuestas API
│   │
│   ├── utils/                 # Funciones auxiliares
│   │   ├── formatters.ts      # Formateo de moneda, fechas
│   │   ├── validators.ts      # Validaciones
│   │   ├── helpers.ts         # Funciones helpers
│   │   └── constants.ts       # Constantes globales
│   │
│   ├── __tests__/             # Tests
│   │   ├── components/        # Tests de componentes
│   │   ├── pages/             # Tests de páginas
│   │   ├── services/          # Tests de servicios
│   │   ├── stores/            # Tests de stores
│   │   └── utils/             # Tests de utilidades
│   │
│   ├── test/                  # Setup de tests
│   │   └── setup.ts
│   │
│   ├── App.tsx                # Componente principal
│   ├── App.css                # Estilos globales de App
│   ├── main.tsx               # 🚀 Punto de entrada
│   ├── index.css              # Estilos globales + Tailwind
│   ├── config.ts              # Configuración de la app
│   ├── swRegister.ts          # Registro del Service Worker
│   ├── suppress-warnings.ts   # Suprimir warnings específicos
│   └── vite-env.d.ts          # Tipos de Vite
│
├── .github/
│   └── workflows/             # GitHub Actions
│       ├── ci.yml
│       ├── deploy.yml
│       └── lighthouse.yml
│
├── dist/                      # Build de producción (generado)
├── node_modules/              # Dependencias (generado)
├── .env                       # Variables de entorno (no versionado)
├── .gitignore
├── eslint.config.js           # Configuración ESLint
├── index.html                 # HTML de entrada
├── package.json
├── postcss.config.js          # Configuración PostCSS
├── Procfile                   # Para Heroku
├── README.md
├── tailwind.config.js         # Configuración Tailwind
├── tsconfig.json              # Configuración TypeScript
├── tsconfig.app.json          # Config TS para app
├── tsconfig.node.json         # Config TS para Node
├── vite.config.ts             # Configuración Vite
└── vitest.config.ts           # Configuración Vitest
```

## 🖼️ Componentes Principales

### 🛒 Cart Store (Zustand)

```typescript
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}
```

**Características:**
- ✅ Persistencia en localStorage
- ✅ Cálculo automático de totales
- ✅ Validación de cantidades
- ✅ Sincronización entre pestañas

### 🔄 Product Service

```typescript
// Obtener todos los productos
const products = await productService.getAll();

// Obtener producto por ID
const product = await productService.getById(id);

// Buscar productos
const results = await productService.search(query);
```

### 💳 Stripe Integration

```typescript
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

<Elements stripe={stripePromise}>
  <CheckoutForm />
</Elements>
```

## 🧪 Testing

El proyecto incluye **tests completos** con Vitest y React Testing Library:

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con interfaz UI
npm run test:ui

# Con reporte de cobertura
npm run test:coverage
```

### Estructura de Tests

```
__tests__/
├── components/
│   ├── Cart.test.tsx
│   ├── ProductCard.test.tsx
│   └── CheckoutForm.test.tsx
├── stores/
│   └── cartStore.test.ts
├── services/
│   └── productService.test.ts
└── utils/
    └── formatters.test.ts
```

### Ejemplo de Test

```typescript
import { render, screen } from '@testing-library/react';
import { ProductCard } from '../components/products/ProductCard';

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const product = {
      id: '1',
      title: 'Camiseta Test',
      price: 2499,
      images: ['test.jpg']
    };
    
    render(<ProductCard product={product} />);
    
    expect(screen.getByText('Camiseta Test')).toBeInTheDocument();
    expect(screen.getByText('24,99 €')).toBeInTheDocument();
  });
});
```

# Con coverage
npm run test:coverage
```

### Coverage
- Components: Tests de UI
- Stores: Tests de estado
- Services: Tests de API
- Utils: Tests de funciones auxiliares

## 📱 Páginas y Rutas

```typescript
// Configuración de rutas en App.tsx
const routes = [
  { path: '/', element: <Home /> },
  { path: '/productos', element: <Products /> },
  { path: '/producto/:id', element: <ProductDetail /> },
  { path: '/carrito', element: <Cart /> },
  { path: '/checkout', element: <Checkout /> },
  { path: '/success', element: <Success /> },
  { path: '/contacto', element: <Contact /> },
  { path: '/sobre-nosotros', element: <About /> },
  { path: '/faq', element: <FAQ /> },
  { path: '/privacidad', element: <PrivacyPolicy /> },
  { path: '/terminos', element: <TermsConditions /> },
  { path: '*', element: <NotFound /> }
];
```

### Páginas Principales

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `Home` | Página de inicio con productos destacados |
| `/productos` | `Products` | Catálogo completo con filtros |
| `/producto/:id` | `ProductDetail` | Detalle de producto con reviews |
| `/carrito` | `Cart` | Carrito de compras |
| `/checkout` | `Checkout` | Proceso de pago con Stripe |
| `/success` | `Success` | Confirmación de compra |
| `/contacto` | `Contact` | Formulario de contacto |
| `/sobre-nosotros` | `About` | Información de la tienda |
| `/faq` | `FAQ` | Preguntas frecuentes |

## ⚡ Optimización y Rendimiento

### Code Splitting

```typescript
// Lazy loading de páginas
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/productos" element={<Products />} />
  </Routes>
</Suspense>
```

### Imágenes Optimizadas

- ✅ **WebP** para navegadores modernos con fallback
- ✅ **Lazy loading** nativo con `loading="lazy"`
- ✅ **Responsive images** con `srcset`
- ✅ **Dimensiones explícitas** para evitar layout shift
- ✅ **Compresión** automática en Cloudinary

```tsx
<img
  src="/producto.webp"
  alt="Producto"
  loading="lazy"
  width={400}
  height={400}
  decoding="async"
/>
```

### Bundle Size

```bash
# Analizar tamaño del bundle
npm run build

# Output típico:
# dist/assets/index-[hash].js  ~120kb (gzipped)
# dist/assets/vendor-[hash].js ~80kb (gzipped)
```

### Performance Metrics (Lighthouse)

| Métrica | Score | Target |
|---------|-------|--------|
| **Performance** | 95+ | > 90 |
| **Accessibility** | 100 | 100 |
| **Best Practices** | 100 | 100 |
| **SEO** | 100 | 100 |
| **PWA** | 90+ | > 85 |

## 🚀 Despliegue

### Heroku

```bash
# 1. Crear app
heroku create cunao-frontend

# 2. Configurar variables
heroku config:set VITE_API_URL=https://tu-backend.herokuapp.com/api
heroku config:set VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
heroku config:set VITE_GA_MEASUREMENT_ID=G-...

# 3. Deploy
git push heroku master

# 4. Abrir app
heroku open
```

### Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Configurar variables en dashboard
# https://vercel.com/your-project/settings/environment-variables
```

### Netlify

```bash
# 1. Instalar Netlify CLI
npm i -g netlify-cli

# 2. Build
npm run build

# 3. Deploy
netlify deploy --prod --dir=dist
```

### Docker

```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build
docker build -t cunao-frontend .

# Run
docker run -p 80:80 cunao-frontend
```

### Configuración Nginx

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔍 SEO

### Meta Tags Dinámicos

```tsx
// En cada página
<Helmet>
  <title>Cuñadismo Ilustrado - Camisetas y Ropa Original</title>
  <meta name="description" content="Tienda de camisetas..." />
  <meta property="og:title" content="..." />
  <meta property="og:description" content="..." />
  <meta property="og:image" content="..." />
  <meta name="twitter:card" content="summary_large_image" />
</Helmet>
```

### Sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://cunaoilustrado.com/</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
    <loc>https://cunaoilustrado.com/productos</loc>
    <priority>0.9</priority>
    <changefreq>daily</changefreq>
  </url>
  <!-- Más URLs -->
</urlset>
```

### Robots.txt

```txt
User-agent: *
Allow: /
Disallow: /checkout
Disallow: /success

Sitemap: https://cunaoilustrado.com/sitemap.xml
```

### Schema.org Markup

```tsx
// ProductDetail.tsx
<script type="application/ld+json">
  {JSON.stringify({
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": product.images,
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "EUR",
      "price": product.price / 100,
      "availability": "https://schema.org/InStock"
    }
  })}
</script>
```

## ♿ Accesibilidad

### Características de Accesibilidad

- ✅ **Navegación por teclado** completa
- ✅ **ARIA labels** en todos los componentes interactivos
- ✅ **Roles semánticos** apropiados
- ✅ **Contraste de color** WCAG AA compliant
- ✅ **Skip links** para navegación rápida
- ✅ **Focus visible** en todos los elementos
- ✅ **Alt text** en todas las imágenes
- ✅ **Form labels** asociados correctamente

### Ejemplo de Componente Accesible

```tsx
<button
  aria-label="Añadir al carrito"
  aria-describedby="product-price"
  onClick={handleAddToCart}
  className="focus:ring-2 focus:ring-red-500"
>
  <ShoppingCart aria-hidden="true" />
  <span className="sr-only">Añadir al carrito</span>
</button>
```

## 🎨 Personalización de Tema

### Tailwind Config

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#CC0000',
          dark: '#990000',
          light: '#FF3333'
        },
        secondary: {
          DEFAULT: '#FFD700',
          dark: '#CCAC00',
          light: '#FFED4E'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'sans-serif']
      }
    }
  }
}
```

### Colores de Marca

| Color | Hex | Uso |
|-------|-----|-----|
| **Rojo Español** | `#CC0000` | Primary, CTA, headers |
| **Amarillo Español** | `#FFD700` | Secondary, accents |
| **Gris Oscuro** | `#1A1A1A` | Text, backgrounds |
| **Blanco** | `#FFFFFF` | Background, text |

## 🐛 Troubleshooting

### Problemas Comunes

#### **Backend API no responde**
```bash
# Verificar que el backend esté corriendo
curl http://localhost:3000/api/config

# Verificar variable de entorno
echo $VITE_API_URL
```

#### **Stripe no carga**
```bash
# Verificar publishable key
console.log(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

# Debe empezar con pk_test_ o pk_live_
```

#### **Build falla**
```bash
# Limpiar cache y reinstalar
rm -rf node_modules dist .vite
npm install
npm run build
```

#### **Tests fallan**
```bash
# Limpiar cache de Vitest
npm run test -- --clearCache

# Ejecutar un test específico
npm test -- ProductCard.test.tsx
```

## 📚 Recursos Adicionales

### Documentación

- [React 19 Docs](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Stripe React](https://stripe.com/docs/stripe-js/react)
- [Vitest Docs](https://vitest.dev/)

### Comunidad

- **Issues**: [GitHub Issues](https://github.com/CodeInIA/cunao-frontend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/CodeInIA/cunao-frontend/discussions)

## 🤝 Contribuir

### Flujo de Trabajo

1. **Fork** el repositorio
2. **Crea** una rama (`git checkout -b feature/AmazingFeature`)
3. **Commit** cambios (`git commit -m 'Add: amazing feature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Convenciones

- **Components** - PascalCase (`ProductCard.tsx`)
- **Files** - camelCase (`productService.ts`)
- **CSS** - Tailwind utility classes
- **Commits** - Semantic commits (feat, fix, docs, etc.)

### Tests Requeridos

```bash
# Antes de hacer PR
npm run lint        # ESLint debe pasar
npm test            # Todos los tests deben pasar
npm run build       # Build debe ser exitoso
tsc --noEmit        # No debe haber errores de tipos
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **CodeInIA** - *Desarrollo inicial* - [@CodeInIA](https://github.com/CodeInIA)

## 🙏 Agradecimientos

- React team por React 19
- Evan You por Vite
- Tailwind Labs por Tailwind CSS
- Stripe por su excelente SDK
- La comunidad open source

---

<div align="center">

### ⭐ Si este proyecto te ha sido útil, considera darle una estrella

**[⬆ Volver arriba](#️-cuñadismo-ilustrado---frontend)**

Hecho con ❤️ en España 🇪🇸

</div>
```

### Coverage
- Stores: 100% (CartStore completo)
- Components: Header, Footer, ProductCard
- Integration: Flujo de compra E2E

## 🗺️ Rutas

```
/                    # Home
/productos           # Catálogo
/producto/:id        # Detalle
/carrito             # Carrito
/checkout            # Pago
/success             # Confirmación
/reviews             # Opiniones
/contacto            # Contacto
/admin               # Panel admin
```

## 🛒 Flujo de Compra

1. Navegación productos → `/productos`
2. Detalle producto → `/producto/:id`
3. Añadir al carrito → Zustand store
4. Ver carrito → Panel lateral o `/carrito`
5. Aplicar descuento → API validation
6. Checkout → `/checkout` + Stripe Elements
7. Pago → Stripe Payment Intent
8. Confirmación → `/success`

## 📊 Estado Global (Zustand)

### CartStore

```typescript
interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  
  addItem: (item: CartItem) => void;
  removeItem: (productId, variantId) => void;
  updateQuantity: (productId, variantId, quantity) => void;
  clearCart: () => void;
  
  getTotalItems: () => number;
  getTotalPrice: () => number;
}
```

## 🚀 Despliegue Heroku

```bash
heroku create cunao-frontend
heroku config:set VITE_API_URL=https://cunao-backend.herokuapp.com
heroku config:set VITE_STRIPE_PUBLIC_KEY=pk_live_...
git push heroku master
```

## 📊 CI/CD (16 Workflows)

### Principales
- **CI** - Lint, test, build (Node 18/20)
- **Full Suite** - Tests semanales + coverage
- **Security** - npm audit diario
- **Deployment** - Build validation

### Por Feature
Products, Cart, Checkout, Reviews, Newsletter, Admin, UI Components, Routing, State Management, Performance, Accessibility, Code Quality

## 🧑‍💻 Scripts

```bash
npm run dev              # Desarrollo Vite
npm run build            # Build producción
npm run preview          # Preview build
npm test                 # Tests Vitest
npm run test:ui          # Tests con UI
npm run lint             # ESLint
npm start                # Serve build (Heroku)
```

## 🎯 Optimizaciones

- **Code Splitting** - Lazy loading de páginas
- **Images** - WebP + lazy loading
- **Bundle** - Vite tree shaking
- **Caching** - Service Worker + localStorage

## ♿ Accesibilidad

- ✅ ARIA labels
- ✅ Navegación teclado
- ✅ Focus management
- ✅ Contraste WCAG AA
- ✅ Alt text en imágenes

## 🌐 SEO

- Meta tags dinámicos
- Sitemap.xml
- Robots.txt
- Open Graph tags
- Schema.org markup

## 🎨 Tema

### Colores
```css
--rojo-espana: #AA151B
--amarillo-espana: #F1BF00
--negro: #000000
--gris-oscuro: #1a1a1a
```

### Tipografía
- Headings: System fonts
- Body: Inter, system-ui

## 👥 Autor

**Cuñadismo Ilustrado**
- GitHub: [@CodeInIA](https://github.com/CodeInIA)
- Web: [cunaoilustrado.com](https://cunaoilustrado.com)

---

**Estado**: ✅ En producción | **Tests**: 39/39 ✅ | **CI/CD**: 16 workflows ✅ | **Performance**: Lighthouse 95+ ⚡
