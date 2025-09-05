import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, XCircle, Save, Shield, AlertTriangle } from 'lucide-react';
import { useSmartNavigation } from '../hooks/useSmartNavigation';
import { LoadingSpinner } from '../components/Loading';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

interface NewsletterPreferences {
  email: string;
  newsletter: boolean;
  promotions: boolean;
  newProducts: boolean;
}

export const NewsletterPreferencesPage: React.FC = () => {
  const { navigateTo } = useSmartNavigation();
  const [preferences, setPreferences] = useState<NewsletterPreferences>({
    email: '',
    newsletter: true,
    promotions: true,
    newProducts: true
  });

  const [loading, setLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [isCustomer, setIsCustomer] = useState<boolean>(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    
    if (!tokenParam) {
      setTokenError('Token de acceso requerido. Esta página solo es accesible desde enlaces de newsletter.');
      setIsValidatingToken(false);
      return;
    }

    setToken(tokenParam);
    validateToken(tokenParam);
  }, []);

  const validateToken = async (tokenToValidate: string) => {
    setIsValidatingToken(true);
    
    try {
      console.log('🔍 Validating token:', tokenToValidate.substring(0, 20) + '...');
      
      const data = await apiService.validateNewsletterToken(tokenToValidate);
      
      console.log('🔍 Response from backend:', data);
      
      if (data.valid && data.email) {
        setIsTokenValid(true);
        setIsCustomer(data.isCustomer ?? false);
        
        // Configurar preferencias con datos del backend
        setPreferences({
          email: data.email,
          newsletter: data.preferences?.newsletter ?? true,
          promotions: data.preferences?.promotions ?? false,
          newProducts: data.preferences?.newProducts ?? false
        });
        
        setTokenError('');
        console.log('✅ Token validado correctamente');
      } else {
        console.log('❌ Token inválido');
        setTokenError('Token inválido o expirado');
        setIsTokenValid(false);
      }
    } catch (error: any) {
      console.error('❌ Error validating token:', error);
      setTokenError(error.message || 'Error al validar el token. Por favor, inténtalo de nuevo más tarde.');
      setIsTokenValid(false);
    } finally {
      setIsValidatingToken(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences.email) {
      toast.error('Por favor, introduce tu email');
      return;
    }

    if (!isTokenValid) {
      toast.error('Token inválido. No se pueden guardar las preferencias.');
      return;
    }

    setLoading(true);
    try {
      const result = await apiService.updateNewsletterPreferences(token, preferences);
      toast.success('¡Preferencias guardadas correctamente!');
      console.log('✅ Preferencias actualizadas:', result);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar las preferencias');
      console.error('Error saving preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (key: keyof Omit<NewsletterPreferences, 'email'>) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Validando acceso...
            </h2>
            <LoadingSpinner />
            <p className="text-gray-600 mt-4">
              Verificando tu token de acceso
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isTokenValid || tokenError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error de acceso
            </h2>
            <p className="text-red-600 mb-6">
              {tokenError}
            </p>
            <button
              onClick={() => navigateTo('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center">
              <Mail className="mx-auto h-12 w-12 text-blue-600 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Preferencias de Newsletter
              </h1>
              <p className="text-gray-600">
                Gestiona tus preferencias de comunicación
              </p>
            </div>
          </div>

          {/* Email Display */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Email de contacto
              </h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 font-medium">{preferences.email}</p>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Preferencias de comunicación
            </h2>

            <div className="space-y-6">
              {/* Newsletter */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Newsletter Semanal</h3>
                  <p className="text-sm text-gray-600">
                    Recibe nuestro newsletter semanal con contenido cuñado
                  </p>
                </div>
                <button
                  onClick={() => togglePreference('newsletter')}
                  className={`ml-4 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    preferences.newsletter
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {preferences.newsletter ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {preferences.newsletter ? 'Activado' : 'Desactivado'}
                </button>
              </div>

              {/* Promotions */}
              <div className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg transition-colors ${
                isCustomer ? 'hover:bg-gray-50' : 'bg-gray-100'
              }`}>
                <div className="flex-1">
                  <h3 className={`font-medium ${isCustomer ? 'text-gray-900' : 'text-gray-500'}`}>
                    Promociones
                  </h3>
                  <p className={`text-sm ${isCustomer ? 'text-gray-600' : 'text-gray-400'}`}>
                    {isCustomer 
                      ? 'Ofertas especiales y descuentos exclusivos'
                      : 'Solo disponible para clientes con compras'
                    }
                  </p>
                </div>
                <button
                  onClick={() => isCustomer && togglePreference('promotions')}
                  disabled={!isCustomer}
                  className={`ml-4 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    !isCustomer 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : preferences.promotions
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {preferences.promotions ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {preferences.promotions ? 'Activado' : 'Desactivado'}
                </button>
              </div>

              {/* New Products */}
              <div className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg transition-colors ${
                isCustomer ? 'hover:bg-gray-50' : 'bg-gray-100'
              }`}>
                <div className="flex-1">
                  <h3 className={`font-medium ${isCustomer ? 'text-gray-900' : 'text-gray-500'}`}>
                    Nuevos Productos
                  </h3>
                  <p className={`text-sm ${isCustomer ? 'text-gray-600' : 'text-gray-400'}`}>
                    {isCustomer 
                      ? 'Notificaciones sobre lanzamientos de productos'
                      : 'Solo disponible para clientes con compras'
                    }
                  </p>
                </div>
                <button
                  onClick={() => isCustomer && togglePreference('newProducts')}
                  disabled={!isCustomer}
                  className={`ml-4 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    !isCustomer 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : preferences.newProducts
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {preferences.newProducts ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  {preferences.newProducts ? 'Activado' : 'Desactivado'}
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={handleSavePreferences}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Preferencias
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
