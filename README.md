# Cuñadismo Ilustrado - Frontend

Frontend de la tienda online "Cuñadismo Ilustrado" construido con React, TypeScript, y Tailwind CSS.

## Características

- 🛍️ Tienda online completa con carrito de compras
- 💳 Integración con Stripe para pagos
- 📱 Diseño responsive y móvil
- 🎨 Diseño con temática española y cuñao
- 🚀 Optimizado para rendimiento
- 🔄 Estado global con Zustand
- 🎯 TypeScript para type safety

## Tecnologías

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Zustand (state management)
- Stripe para pagos
- Axios para API calls
- Lucide React para iconos
- React Hot Toast para notificaciones

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
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_PUBLIC_KEY=pk_test_tu_clave_publica_stripe
VITE_APP_NAME=Cuñadismo Ilustrado
VITE_APP_DESCRIPTION=La tienda más cuñao de España
```

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Header.tsx
│   ├── CartSidebar.tsx
│   └── ProductCard.tsx
├── pages/              # Páginas principales
│   └── HomePage.tsx
├── stores/             # Estado global (Zustand)
│   ├── cartStore.ts
│   └── productStore.ts
├── services/           # Servicios de API
│   └── api.ts
├── types/              # Tipos de TypeScript
│   └── index.ts
├── config/             # Configuración
│   └── index.ts
├── utils/              # Utilidades
├── hooks/              # Custom hooks
└── assets/             # Recursos estáticos
```

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
