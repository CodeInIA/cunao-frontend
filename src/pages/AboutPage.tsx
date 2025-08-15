import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart, Star, Coffee } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-viking-600 via-viking-500 to-viking-400 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
            🇪🇸 Sobre Nosotros
          </h1>
          <p className="text-xl md:text-2xl font-vikingo max-w-3xl mx-auto">
            "En mi pueblo lo hacemos mejor"
          </p>
        </div>
      </section>

      {/* Nuestra historia */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-8 text-center">
              Nuestra Historia vikingo
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-semibold text-viking-600 mb-4">
                  Todo empezó en una barbacoa...
                </h3>
                <p className="text-gray-700 mb-4">
                  Como en todas las historias épicas, <strong>Cuñadismo Ilustrado</strong> nació 
                  durante una barbacoa familiar. Mientras el cuñado de turno explicaba por enésima 
                  vez por qué "en su pueblo hacen las hamburguesas mejor", nos dimos cuenta de que 
                  estas perlas de sabiduría popular merecían ser inmortalizadas.
                </p>
                <p className="text-gray-700 mb-4">
                  Así surgió la idea: crear camisetas que capturen la esencia del cuñadismo español. 
                  Esas frases míticas que todos hemos escuchado en reuniones familiares, bares de 
                  pueblo y tertulias de cafetería.
                </p>
                <p className="text-gray-700">
                  Porque al final, todos tenemos un cuñado interior que quiere opinar sobre todo.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <Coffee className="w-16 h-16 text-viking-500 mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    "Esto no se hacía así antes"
                  </h4>
                  <p className="text-gray-600 italic">
                    - Frase fundacional de Cuñadismo Ilustrado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestros valores */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-12 text-center">
            Nuestros Valores vikingo
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-viking-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-viking-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Autenticidad
              </h3>
              <p className="text-gray-600">
                Cada diseño captura la esencia real del cuñadismo español. 
                Sin filtros, sin ediciones, puro estilo vikingo.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-viking-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-viking-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Humor
              </h3>
              <p className="text-gray-600">
                Celebramos el cuñadismo con cariño y humor. Porque reírse 
                de nosotros mismos es lo más español que hay.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-viking-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-viking-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Calidad
              </h3>
              <p className="text-gray-600">
                Camisetas de la mejor calidad, porque "en mi pueblo 
                exigimos lo mejor para nuestras opiniones".
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* El equipo */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-12 text-center">
            El Equipo vikingo
          </h2>
          
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-semibold text-viking-600 mb-4">
                Somos un equipo de cuñados profesionales
              </h3>
              <p className="text-gray-700 mb-6">
                Cada miembro del equipo aporta su propia experiencia vikingo. Entre todos 
                hemos recopilado cientos de frases auténticas de tertulias familiares, 
                bares de pueblo y reuniones de vecinos.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="bg-viking-50 p-4 rounded-lg">
                  <strong className="text-viking-700">El Cuñado Jefe</strong>
                  <p className="text-gray-600 mt-1">
                    Especialista en opiniones contundentes sobre cualquier tema
                  </p>
                </div>
                <div className="bg-viking-50 p-4 rounded-lg">
                  <strong className="text-viking-700">La Cuñada Experta</strong>
                  <p className="text-gray-600 mt-1">
                    Master en comparaciones con "en mi pueblo"
                  </p>
                </div>
                <div className="bg-viking-50 p-4 rounded-lg">
                  <strong className="text-viking-700">El Cuñado Millennial</strong>
                  <p className="text-gray-600 mt-1">
                    Traductor oficial del cuñadismo a las nuevas generaciones
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 bg-viking-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
            ¿Preparado para ser el cuñado más auténtico?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a la revolución vikingo y lleva tus opiniones al siguiente nivel
          </p>
          <Link
            to="/productos"
            className="inline-flex items-center px-8 py-4 bg-white text-viking-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Ver Todas las Camisetas
          </Link>
        </div>
      </section>
    </div>
  );
};

