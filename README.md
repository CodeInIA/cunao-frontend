# Cuñadismo Ilustrado - Frontend

Frontend de la tienda online "Cuñadismo Ilustrado" con React 19, TypeScript y Tailwind CSS. Experiencia de e-commerce completa con diseño español auténtico.

## 🎨 Características Principales

- 🛍️ **Tienda online completa** - Carrito persistente con Zustand
- 💳 **Integración Stripe** - Payment Elements para pagos seguros
- 📱 **100% Responsive** - Mobile-first design
- 🇪🇸 **Temática española** - Colores patrióticos y tipografía única
- ⚡ **Ultra rápido** - Vite, lazy loading, code splitting
- 🔄 **Estado global** - Zustand para gestión eficiente
- 🎯 **TypeScript completo** - Type safety end-to-end
- 🔍 **Búsqueda en tiempo real** - Filtrado instantáneo
- 📧 **Newsletter integrada** - Modal con preferencias
- 🛡️ **Validación robusta** - Formularios validados
- 🎭 **Modo oscuro** - Diseño único de marca
- 📊 **Analytics** - Google Analytics 4
- 🌐 **SEO optimizado** - Meta tags, sitemap
- 🔔 **Notificaciones** - React Hot Toast
- ♿ **Accesible** - ARIA, teclado
- 🚀 **PWA ready** - Service Worker

## 🛠️ Tecnologías

### Core
- **React 19.2** - Última versión
- **TypeScript 5.x** - Tipado completo
- **Vite 6.x** - Build ultrarrápido

### Styling
- **Tailwind CSS 3.x** - Utilidades CSS
- **PostCSS** - Procesamiento CSS
- **Material UI 7.x** - Componentes premium

### State & Routing
- **React Router DOM 7.x** - SPA routing
- **Zustand 5.x** - Estado minimalista

### Payments & APIs
- **@stripe/react-stripe-js** - Pagos
- **Axios** - Cliente HTTP

### Testing
- **Vitest** - Testing rápido
- **@testing-library/react** - Component testing
- **jsdom** - DOM para tests

## 📁 Estructura

```
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
└── README.md
```

## 🔧 Instalación

### 1. Clonar e instalar

```bash
git clone https://github.com/CodeInIA/cunao-frontend.git
cd cunao-frontend
npm install
```

### 2. Variables de entorno

Crea `.env`:

```env
# API Backend
VITE_API_URL=http://localhost:3000

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# Analytics (opcional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Iniciar

```bash
# Desarrollo
npm run dev

# Build producción
npm run build

# Preview build
npm run preview
```

## 🧪 Testing

**39 tests passing** cubriendo stores, componentes e integración:

```bash
# Todos los tests
npm test

# Con UI
npm run test:ui

# Con coverage
npm run test:coverage
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
