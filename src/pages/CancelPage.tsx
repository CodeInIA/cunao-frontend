import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export const CancelPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center text-center p-4">
      <div>
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-patriot text-white">Pago Cancelado</h1>
        <p className="text-slate-400 mt-2">
          Tu pedido ha sido cancelado. No se ha realizado ningún cargo.
        </p>
        <Link to="/productos" className="mt-8 inline-block px-6 py-3 bg-spanish-yellow text-slate-900 font-bold rounded-lg shadow hover:bg-yellow-400 transition-colors">
          Volver a la Tienda
        </Link>
      </div>
    </div>
  );
};