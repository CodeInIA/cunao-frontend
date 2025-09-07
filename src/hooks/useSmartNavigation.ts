import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { useProductStore } from '../stores/productStore';

export const useSmartNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { error, loadingState } = useProductStore();

  const navigateTo = useCallback((path: string) => {
    const currentPath = location.pathname;
    
    // Si hay un estado de error, usar window.location.href para forzar recarga completa
    if (error || loadingState === 'error') {
      console.log('🚨 Estado de error detectado, usando navegación forzada a:', path);
      window.location.href = path;
      return;
    }
    
    // Si ya estamos en la misma ruta, hacer scroll suave al top
    if (currentPath === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Si es una ruta diferente, navegar directamente sin scroll
      navigate(path);
      // Forzar scroll instantáneo al top después de la navegación
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }, 0);
    }
  }, [location.pathname, navigate, error, loadingState]);

  return { navigateTo, currentPath: location.pathname };
};
