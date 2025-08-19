import React, { useEffect, useState, useRef } from 'react'; // Importar useRef
import { useLocation, Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { apiService } from '../services/api';
import { CheckCircle, Loader, AlertTriangle } from 'lucide-react';

export const SuccessPage: React.FC = () => {
  const location = useLocation();
  const { clearCart } = useCartStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false); // Bandera para evitar doble ejecución

  useEffect(() => {
    const processPayment = async () => {
      const params = new URLSearchParams(location.search);
      const sessionId = params.get('session_id');

      if (!sessionId) {
        setStatus('error');
        setError('No se encontró el ID de la sesión de pago.');
        return;
      }

      try {
        // Llamar a la API para procesar el pedido
        await apiService.processOrder(undefined, sessionId);
        setStatus('success');
        clearCart();
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'Hubo un problema al procesar tu pedido.');
        console.error('Error al procesar el pedido:', err);
      }
    };

    // Solo ejecutar si no se ha procesado antes
    if (!hasProcessed.current) {
      processPayment();
      hasProcessed.current = true; // Marcar como procesado
    }
  }, [location, clearCart]);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-center p-4">
      {status === 'loading' && (
        <div>
          <Loader className="w-16 h-16 text-spanish-yellow animate-spin mx-auto mb-4" />
          <h1 className="text-3xl font-patriot text-white">Procesando tu pedido...</h1>
          <p className="text-slate-400 mt-2">Por favor, no cierres esta ventana.</p>
        </div>
      )}
      {status === 'success' && (
        <div>
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-patriot text-white">¡Gracias por tu compra!</h1>
          <p className="text-slate-400 mt-2">Hemos recibido tu pedido y ya lo estamos preparando. Recibirás un email de confirmación en breve.</p>
          <Link to="/productos" className="mt-8 inline-block px-6 py-3 bg-spanish-yellow text-slate-900 font-bold rounded-lg shadow hover:bg-yellow-400 transition-colors">
            Seguir Comprando
          </Link>
        </div>
      )}
      {status === 'error' && (
        <div>
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-patriot text-white">Error en el Pedido</h1>
          <p className="text-slate-400 mt-2">Hubo un problema al procesar tu pedido.</p>
          <p className="text-red-400 mt-4 bg-red-900/50 p-3 rounded-md">{error}</p>
          <Link to="/contacto" className="mt-8 inline-block px-6 py-3 bg-spanish-red text-white font-bold rounded-lg shadow hover:bg-red-700 transition-colors">
            Contactar con Soporte
          </Link>
        </div>
      )}
    </div>
  );
};