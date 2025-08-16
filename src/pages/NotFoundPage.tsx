import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="text-center max-w-2xl">
        {/* Número 404 grande y llamativo */}
        <div className="mb-8">
          <h1 className="text-9xl font-display font-bold text-cunao-600 leading-none">
            404
          </h1>
          <div className="spain-colors h-2 w-32 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Mensaje de error con humor cuñao */}
        <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
          ¡Página no encontrada!
        </h2>
        
        <p className="text-xl text-gray-600 mb-6">
          Parece que esta página se ha perdido por el camino...
        </p>

        <div className="bg-cunao-50 border border-cunao-200 rounded-lg p-6 mb-8">
          <p className="text-cunao-700 font-cunao italic text-lg">
            "En mi pueblo las páginas no se pierden nunca"
          </p>
          <p className="text-cunao-600 text-sm mt-2">
            - Tu cuñado favorito
          </p>
        </div>

        {/* Sugerencias útiles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            ¿Qué puedes hacer?
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <Home className="w-8 h-8 text-cunao-500 mx-auto mb-2" />
              <p className="font-medium">Volver al inicio</p>
              <p className="text-gray-500">Navega desde la página principal</p>
            </div>
            <div className="text-center">
              <Search className="w-8 h-8 text-cunao-500 mx-auto mb-2" />
              <p className="font-medium">Buscar productos</p>
              <p className="text-gray-500">Encuentra tu camiseta cuñao</p>
            </div>
            <div className="text-center">
              <ArrowLeft className="w-8 h-8 text-cunao-500 mx-auto mb-2" />
              <p className="font-medium">Ir atrás</p>
              <p className="text-gray-500">Usa el botón atrás del navegador</p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-8 py-3 bg-cunao-600 text-white font-semibold rounded-lg hover:bg-cunao-700 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Ir al Inicio
          </Link>
          
          <Link
            to="/productos"
            className="inline-flex items-center px-8 py-3 bg-white text-cunao-600 border-2 border-cunao-600 font-semibold rounded-lg hover:bg-cunao-600 hover:text-white transition-colors"
          >
            <Search className="w-5 h-5 mr-2" />
            Ver Productos
          </Link>
        </div>

        {/* Productos destacados */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Mientras tanto, echa un vistazo a estos productos cuñao:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            {[
              {
                title: 'En mi pueblo lo hacemos mejor',
                price: '19,99 €',
                description: 'La camiseta oficial del cuñadismo'
              },
              {
                title: 'Yo ya lo sabía',
                price: '19,99 €', 
                description: 'Para los que siempre tienen razón'
              },
              {
                title: 'Esto antes no pasaba',
                price: '19,99 €',
                description: 'Nostalgia cuñao nivel experto'
              }
            ].map((product, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                <div className="w-full h-32 bg-cunao-100 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-cunao-600 font-bold text-lg">🇪🇸</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{product.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                <p className="text-cunao-600 font-bold">{product.price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
