import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Header } from './components/Header';
import { CartSidebar } from './components/CartSidebar';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/Error';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { FeaturedPage } from './pages/FeaturedPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { ShippingPage } from './pages/ShippingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage'; // Importar
import { SuccessPage } from './pages/SuccessPage';   // Importar
import { CancelPage } from './pages/CancelPage';     // Importar
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-slate-900 flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/productos" element={<ProductsPage />} />
              <Route path="/producto/:id" element={<ProductDetailPage />} />
              <Route path="/destacados" element={<FeaturedPage />} />
              <Route path="/sobre-nosotros" element={<AboutPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/privacidad" element={<PrivacyPage />} />
              <Route path="/terminos" element={<TermsPage />} />
              <Route path="/envios" element={<ShippingPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/success" element={<SuccessPage />} />
              <Route path="/cancel" element={<CancelPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
          <CartSidebar />
          <Toaster 
            position="top-right"
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

