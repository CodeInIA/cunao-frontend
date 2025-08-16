import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Heart, Star, Coffee } from 'lucide-react';
import { useSmartNavigation } from '../hooks/useSmartNavigation';

export const AboutPage: React.FC = () => {
  const { navigateTo } = useSmartNavigation();
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-spanish-red via-spanish-gold to-spanish-red text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-patriot font-bold mb-6 flex items-center justify-center gap-4">
            <span className="inline-block w-10 h-7 relative rounded-sm overflow-hidden shadow-lg transform hover:scale-110 transition-transform duration-300" style={{boxShadow: '0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'}}>
              <span className="absolute top-0 left-0 w-full h-1/4 bg-spanish-red"></span>
              <span className="absolute top-1/4 left-0 w-full h-1/2 bg-spanish-yellow"></span>
              <span className="absolute bottom-0 left-0 w-full h-1/4 bg-spanish-red"></span>
            </span>
            Sobre Nosotros
            <span className="inline-block w-10 h-7 relative rounded-sm overflow-hidden shadow-lg transform hover:scale-110 transition-transform duration-300" style={{boxShadow: '0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)'}}>
              <span className="absolute top-0 left-0 w-full h-1/4 bg-spanish-red"></span>
              <span className="absolute top-1/4 left-0 w-full h-1/2 bg-spanish-yellow"></span>
              <span className="absolute bottom-0 left-0 w-full h-1/4 bg-spanish-red"></span>
            </span>
          </h1>
          <p className="text-xl md:text-2xl font-bold max-w-3xl mx-auto">
            "En mi pueblo lo hacemos mejor"
          </p>
        </div>
      </section>

      {/* Nuestra historia */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-patriot font-bold text-white mb-8 text-center">
              Nuestra Historia Cuñao
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h3 className="text-2xl font-semibold text-spanish-yellow mb-4">
                  Todo empezó en una barbacoa...
                </h3>
                <p className="text-slate-300 mb-4">
                  Como en todas las historias épicas, <strong>Cuñadismo Ilustrado</strong> nació 
                  durante una barbacoa familiar. Mientras el cuñado de turno explicaba por enésima 
                  vez por qué "en su pueblo hacen las hamburguesas mejor", nos dimos cuenta de que 
                  estas perlas de sabiduría popular merecían ser inmortalizadas.
                </p>
                <p className="text-slate-300 mb-4">
                  Así surgió la idea: crear camisetas que capturen la esencia del cuñadismo español. 
                  Esas frases míticas que todos hemos escuchado en reuniones familiares, bares de 
                  pueblo y tertulias de cafetería.
                </p>
                <p className="text-slate-300">
                  Porque al final, todos tenemos un cuñado interior que quiere opinar sobre todo.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-slate-800 rounded-lg shadow-lg p-8">
                  <Coffee className="w-16 h-16 text-spanish-yellow mx-auto mb-4" />
                  <h4 className="text-xl font-semibold text-white mb-2">
                    "Esto no se hacía así antes"
                  </h4>
                  <p className="text-slate-300 italic">
                    - Frase fundacional de Cuñadismo Ilustrado
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuestros valores */}
      <section className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-patriot font-bold text-white mb-12 text-center">
            Nuestros Valores Cuñao
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-spanish-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Autenticidad
              </h3>
              <p className="text-slate-300">
                Cada diseño captura la esencia real del cuñadismo español. 
                Sin filtros, sin ediciones, puro estilo cuñao.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-spanish-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-slate-900" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Humor
              </h3>
              <p className="text-slate-300">
                Celebramos el cuñadismo con cariño y humor. Porque reírse 
                de nosotros mismos es lo más español que hay.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-spanish-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Calidad
              </h3>
              <p className="text-slate-300">
                Camisetas de la mejor calidad, porque "en mi pueblo 
                exigimos lo mejor para nuestras opiniones".
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* El equipo */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-patriot font-bold text-white mb-12 text-center">
            El Equipo Cuñao
          </h2>
          
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-slate-800 rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-semibold text-spanish-yellow mb-4">
                Somos un equipo de cuñados profesionales
              </h3>
              <p className="text-slate-300 mb-6">
                Cada miembro del equipo aporta su propia experiencia cuñao. Entre todos 
                hemos recopilado cientos de frases auténticas de tertulias familiares, 
                bares de pueblo y reuniones de vecinos.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <strong className="text-spanish-yellow">El Cuñado Jefe</strong>
                  <p className="text-slate-300 mt-1">
                    Especialista en opiniones contundentes sobre cualquier tema
                  </p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <strong className="text-spanish-yellow">La Cuñada Experta</strong>
                  <p className="text-slate-300 mt-1">
                    Master en comparaciones con "en mi pueblo"
                  </p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <strong className="text-spanish-yellow">El Cuñado Millennial</strong>
                  <p className="text-slate-300 mt-1">
                    Traductor oficial del cuñadismo a las nuevas generaciones
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 bg-gradient-to-br from-spanish-red to-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-patriot font-bold mb-6">
            ¿Preparado para ser el cuñado más auténtico?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-slate-200">
            Únete a la revolución cuñao y lleva tus opiniones al siguiente nivel
          </p>
            <button
              className="inline-flex items-center px-8 py-4 bg-spanish-yellow text-slate-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
              onClick={() => navigateTo('/productos')}
            >
              Ver Todas las Camisetas
            </button>
        </div>
      </section>
    </div>
  );
};

