import React, { useEffect, Suspense, lazy } from 'react';
import { trackPageview } from './utils/analytics';
import { getConsent } from './utils/consent';
import PageViewTracker from './components/PageViewTracker';
import ScrollToTopOnNavigate from './components/ScrollToTopOnNavigate';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { CartSidebar } from './components/CartSidebar';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/Error';
import { LoadingSpinner } from './components/Loading';
import { useCriticalImagePreloader } from './hooks/useCriticalImagePreloader';

// =============================================================
// Lazy-loaded pages (code splitting por ruta)
// =============================================================
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage').then(m => ({ default: m.ProductsPage })));
const FeaturedPage = lazy(() => import('./pages/FeaturedPage').then(m => ({ default: m.FeaturedPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));
const ShippingPage = lazy(() => import('./pages/ShippingPage').then(m => ({ default: m.ShippingPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const ReviewPage = lazy(() => import('./pages/ReviewPage').then(m => ({ default: m.ReviewPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const SuccessPage = lazy(() => import('./pages/SuccessPage').then(m => ({ default: m.SuccessPage })));
const CancelPage = lazy(() => import('./pages/CancelPage').then(m => ({ default: m.CancelPage })));
const NewsletterPreferencesPage = lazy(() => import('./pages/NewsletterPreferencesPage').then(m => ({ default: m.NewsletterPreferencesPage })));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin').then(m => ({ default: m.default })));
const ReviewsManager = lazy(() => import('./pages/admin/ReviewsManager').then(m => ({ default: m.default })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.default })));
const TagManager = lazy(() => import('./pages/admin/TagManager').then(m => ({ default: m.default })));
const AdminRoute = lazy(() => import('./components/AdminRoute').then(m => ({ default: m.default })));
import './App.css';

function App() {
  // Precarga crítica de imágenes para primera visita
  useCriticalImagePreloader();
  // Precarga terminada, el tracking de páginas se realiza por el componente

  // =================================================================
  // ▼▼▼ CÓDIGO DE REDIRECCIÓN AÑADIDO AQUÍ ▼▼▼
  // =================================================================
useEffect(() => {
    // Solo ejecutar en el navegador y en producción
    if (typeof window !== 'undefined' && import.meta.env.PROD) {
      const currentHostname = window.location.hostname;
      const canonicalUrl = import.meta.env.VITE_APP_URL; // -> https://www.cunadismoilustrado.me

      if (canonicalUrl) {
        try {
          const canonicalHostname = new URL(canonicalUrl).hostname; // -> www.cunadismoilustrado.me
          const rootHostname = canonicalHostname.startsWith('www.') 
            ? canonicalHostname.substring(4) 
            : null; // -> cunadismoilustrado.me

          // Si el hostname actual es el dominio raíz, redirige a la versión canónica (www)
          if (rootHostname && currentHostname === rootHostname) {
            window.location.href = `${canonicalUrl}${window.location.pathname}${window.location.search}`;
          }
        } catch (error) {
          console.error('Error al parsear VITE_APP_URL:', error);
        }
      }
    }
  }, []);
  // =================================================================
  // ▲▲▲ FIN DEL CÓDIGO DE REDIRECCIÓN ▲▲▲
  // =================================================================

  return (
    <ErrorBoundary>
      <Router>
        <PageViewTracker />
        <ScrollToTopOnNavigate />
        <div className="min-h-screen bg-slate-900 flex flex-col">
          <Header />
          <main className="flex-1">
            <Suspense fallback={
              <div className="py-20 flex justify-center items-center">
                <LoadingSpinner size="lg" />
              </div>
            }>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/productos" element={<ProductsPage />} />
                <Route path="/producto/:id" element={<ProductDetailPage />} />
                <Route path="/destacados" element={<FeaturedPage />} />
                <Route path="/review/:token" element={<ReviewPage />} />
                <Route path="/sobre-nosotros" element={<AboutPage />} />
                <Route path="/contacto" element={<ContactPage />} />
                <Route path="/privacidad" element={<PrivacyPage />} />
                <Route path="/terminos" element={<TermsPage />} />
                <Route path="/envios" element={<ShippingPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/success" element={<SuccessPage />} />
                <Route path="/cancel" element={<CancelPage />} />
                <Route path="/newsletter/preferences" element={<NewsletterPreferencesPage />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/admin/review-manager" element={<AdminRoute><ReviewsManager /></AdminRoute>} />
                  <Route path="/admin/tag-manager" element={<AdminRoute><TagManager /></AdminRoute>} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <CartSidebar />
          <Toaster 
            position="top-right"
            containerStyle={{ zIndex: 110000 }}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

