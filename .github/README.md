# GitHub Actions Workflows - Frontend

Este directorio contiene los workflows de GitHub Actions para el frontend de Cuñadismo Ilustrado.

## 📋 Workflows Disponibles

### 🔄 CI/CD Principal

1. **ci.yml** - Continuous Integration
   - Ejecuta en cada push/PR a master o develop
   - Verifica: Build, Lint, Type check, Tests
   - Matrix: Node 18.x y 20.x

2. **full-suite.yml** - Suite Completa
   - Ejecuta semanalmente (domingos a las 3 AM)
   - Ejecutable manualmente
   - Incluye: Build, Lint, Type check, Tests, Bundle analysis

3. **deployment.yml** - Despliegue
   - Ejecuta en push a master
   - Build de producción
   - Preparación para deploy

### 🔒 Seguridad y Calidad

4. **security.yml** - Auditoría de Seguridad
   - npm audit diario (2 AM)
   - Verifica vulnerabilidades
   - Ejecutable manualmente

5. **code-quality.yml** - Calidad de Código
   - ESLint con análisis detallado
   - TypeScript strict mode
   - Unused code detection

### 🎨 Features Específicos

6. **products.yml** - Sistema de Productos
   - Tests del catálogo
   - Filtrado y búsqueda
   - ProductCard, ProductDetail

7. **cart.yml** - Carrito de Compra
   - Gestión del carrito
   - Cálculos de totales
   - Descuentos

8. **checkout.yml** - Proceso de Checkout
   - Integración con Stripe
   - Validación de formularios
   - Flujo de pago

9. **reviews.yml** - Sistema de Reviews
   - Validación de reseñas
   - Rating calculations
   - Review submission

10. **newsletter.yml** - Newsletter
    - Suscripción
    - Preferencias
    - Validación de email

11. **admin.yml** - Panel de Admin
    - Autenticación
    - Gestión de productos
    - Analytics

12. **ui-components.yml** - Componentes UI
    - Header, Footer
    - Modals, Banners
    - Responsive design

13. **routing.yml** - Sistema de Rutas
    - React Router
    - Protected routes
    - 404 handling

14. **state-management.yml** - Gestión de Estado
    - Zustand stores
    - Estado del carrito
    - Usuario y autenticación

15. **performance.yml** - Performance
    - Bundle size
    - Lighthouse CI
    - Load times

16. **accessibility.yml** - Accesibilidad
    - ARIA labels
    - Keyboard navigation
    - Screen reader compatibility

## 🚀 Cómo Usar

### Ejecutar Workflow Manualmente

1. Ve a la pestaña "Actions" en GitHub
2. Selecciona el workflow que quieres ejecutar
3. Click en "Run workflow"
4. Selecciona la rama y confirma

### Ver Resultados

Los workflows generan badges que puedes añadir al README:

```markdown
![CI](https://github.com/CodeInIA/cunao-frontend/workflows/CI/badge.svg)
![Security](https://github.com/CodeInIA/cunao-frontend/workflows/Security%20Audit/badge.svg)
```

## ⚙️ Configuración

### Variables de Entorno

Los workflows usan datos de prueba (no se necesitan secrets reales):

```yaml
env:
  VITE_API_URL: 'http://localhost:3000'
  VITE_STRIPE_PUBLIC_KEY: 'pk_test_fake_key_for_ci'
```

### Matrix Strategy

Los workflows principales usan una matrix para probar en múltiples versiones de Node:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
```

## 🔧 Personalización

### Añadir un Nuevo Workflow

1. Crea un archivo `.yml` en `.github/workflows/`
2. Define los triggers (push, PR, schedule, manual)
3. Configura los steps necesarios
4. Documenta el workflow en este README

### Modificar Triggers

```yaml
on:
  push:
    branches: [ master, develop ]
    paths:
      - 'src/components/**'
      - '!src/**/*.test.tsx'
  pull_request:
    branches: [ master ]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:  # Manual execution
```

## 📊 Métricas

Los workflows registran:
- ✅ Build success/failure
- ⏱️ Tiempo de ejecución
- 📦 Tamaño del bundle
- 🐛 Errores de lint
- 🔒 Vulnerabilidades de seguridad

## 🎯 Best Practices

1. **Paths Filters** - Solo ejecuta cuando cambian archivos relevantes
2. **Cache Dependencies** - Usa cache de npm para velocidad
3. **Fail Fast** - Para en el primer error para ahorrar recursos
4. **Parallel Jobs** - Ejecuta tests en paralelo cuando sea posible
5. **Continue on Error** - Para tests opcionales (lint warnings)

## 📝 Notas

- Los workflows NO realizan deploys automáticos (requiere aprobación manual)
- Los datos de prueba son falsos y solo para validación de sintaxis
- Los tests se ejecutan contra mocks, no APIs reales
- El bundle analysis ayuda a detectar código no usado
