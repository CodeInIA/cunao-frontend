import { useLocation, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useSmartNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigateTo = useCallback((path: string) => {
    const currentPath = location.pathname;
    
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
  }, [location.pathname, navigate]);

  return { navigateTo, currentPath: location.pathname };
};
