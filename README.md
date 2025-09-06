# Cuñadismo Ilustrado - Frontend

Frontend de la tienda online "Cuñadismo Ilustrado" construido con React, TypeScript, y Tailwind CSS. Una experiencia de e-commerce completa con diseño español auténtico y funcionalidades modernas.

## Características

- 🛍️ **Tienda online completa** con carrito de compras persistente
- 💳 **Integración con Stripe** para pagos seguros (Payment Elements)
- 📱 **Diseño responsive** optimizado para móvil y desktop
- 🎨 **Temática española auténtica** con colores patrióticos y tipografía personalizada
- 🚀 **Optimizado para rendimiento** con lazy loading y code splitting
- 🔄 **Estado global con Zustand** para gestión eficiente del estado
- 🎯 **TypeScript completo** para type safety y mejor DX
- 🔍 **Búsqueda en tiempo real** sin necesidad de recargar página
- 📧 **Sistema de newsletter** con gestión de preferencias
- 🛡️ **Validación robusta** de formularios y datos
- 🎭 **Modo oscuro nativo** acorde con la identidad de marca
- 📊 **Analytics y tracking** de conversiones y eventos
- 🌐 **SEO optimizado** con meta tags dinámicos

## Tecnologías

- **React 19** - Framework de UI con las últimas características
- **TypeScript** - Tipado estático para mejor desarrollo
- **Vite** - Build tool ultrarrápido con HMR
- **Tailwind CSS** - Framework de utilidades CSS
- **React Router DOM** - Enrutamiento del lado del cliente
- **Zustand** - Gestión de estado minimalista y eficiente
- **Stripe Elements** - Integración segura de pagos
- **Axios** - Cliente HTTP con interceptores
- **Lucide React** - Iconos modernos y consistentes
- **React Hot Toast** - Notificaciones elegantes
- **React Social Icons** - Iconos de redes sociales
- **PostCSS** - Procesamiento avanzado de CSS
- **ESLint** - Linting para código consistente

## Instalación

1. Clona el repositorio:
```bash
git clone <tu-repo>
cd cunao-frontend
```

2. Instala las dependencias:
```bash
npm install --legacy-peer-deps
```

3. Configura las variables de entorno:
```bash
cp .env.example .env
# Edita .env con tus configuraciones
```

4. Ejecuta en desarrollo:
```bash
npm run dev
```

## Variables de Entorno

```env
# API y servicios
VITE_API_URL=https://cunao-backend.herokuapp.com/api
VITE_STRIPE_PUBLIC_KEY=pk_live_tu_clave_publica_stripe

# Información de la aplicación
VITE_APP_NAME=Cuñadismo Ilustrado
VITE_APP_DESCRIPTION=La tienda más cuñao de España - Camisetas auténticas con frases españolas
VITE_APP_URL=https://cunadismoilustrado.me

# SEO y analytics
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_FACEBOOK_PIXEL_ID=123456789

# Configuración de la tienda
VITE_CURRENCY=EUR
VITE_DEFAULT_COUNTRY=ES
VITE_SHIPPING_THRESHOLD=50  # Envío gratis a partir de 50€
```

## Estructura del Proyecto

```
src/
├── components/              # Componentes reutilizables
│   ├── Header.tsx           # Navegación principal
│   ├── Footer.tsx           # Footer con newsletter
│   ├── CartSidebar.tsx      # Carrito lateral
│   ├── ProductCard.tsx      # Tarjeta de producto
│   ├── FeaturedProductCard.tsx
│   ├── BrandLogo.tsx        # Logo de la marca
│   ├── Loading.tsx          # Componentes de carga
│   └── Error.tsx            # Manejo de errores
├── pages/                   # Páginas principales
│   ├── HomePage.tsx         # Página de inicio
│   ├── ProductsPage.tsx     # Catálogo con búsqueda
│   ├── ProductDetailPage.tsx
│   ├── CheckoutPage.tsx     # Proceso de compra
│   ├── SuccessPage.tsx      # Confirmación de pedido
│   ├── CancelPage.tsx       # Cancelación de pago
│   ├── NewsletterPreferencesPage.tsx
│   ├── AboutPage.tsx        # Sobre nosotros
│   ├── ContactPage.tsx      # Contacto
│   ├── PrivacyPage.tsx      # Política de privacidad
│   ├── TermsPage.tsx        # Términos y condiciones
│   └── ShippingPage.tsx     # Envíos y devoluciones
├── stores/                  # Estado global (Zustand)
│   ├── cartStore.ts         # Gestión del carrito
│   └── productStore.ts      # Productos y búsquedas
├── services/                # Servicios de API
│   └── api.ts               # Cliente HTTP centralizado
├── hooks/                   # Custom hooks
│   ├── useAsync.ts          # Manejo de operaciones async
│   ├── useLocalStorage.ts   # Persistencia local
│   ├── useShippingConfig.ts # Configuración de envíos
│   └── useSmartNavigation.ts # Navegación inteligente
├── types/                   # Tipos de TypeScript
│   └── index.ts             # Definiciones globales
├── config/                  # Configuración
│   └── index.ts             # Configuración centralizada
├── utils/                   # Utilidades
└── assets/                  # Recursos estáticos
```

## Características Destacadas

### 🛒 Carrito de Compras Avanzado
- Persistencia en localStorage
- Cálculo automático de totales y envío
- Validación de stock en tiempo real
- Soporte para múltiples variantes

### 🔍 Búsqueda Inteligente
- Búsqueda en tiempo real con debounce
- Filtrado por múltiples criterios
- Resultados instantáneos sin recargar página
- Historial de búsquedas

### 💳 Proceso de Pago Optimizado
- Stripe Elements integrado
- Validación en tiempo real
- Soporte para múltiples métodos de pago
- Cálculo automático de impuestos y envío

### 📧 Sistema de Newsletter
- Suscripción desde footer
- Gestión de preferencias personalizada
- Validación robusta de emails
- Modo oscuro consistente

### 📱 Experiencia Móvil
- Diseño mobile-first
- Touch gestures optimizados
- Carga rápida en conexiones lentas
- PWA ready

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## Despliegue en Heroku

1. Crea una aplicación en Heroku:
```bash
heroku create cunao-frontend
```

2. Configura las variables de entorno:
```bash
heroku config:set VITE_API_URL=https://tu-backend.herokuapp.com/api
heroku config:set VITE_STRIPE_PUBLIC_KEY=pk_live_tu_clave
```

3. Despliega:
```bash
git push heroku main
```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## Licencia

MIT
