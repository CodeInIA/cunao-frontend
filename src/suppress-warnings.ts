// Supresión de warnings de desarrollo para mejorar experiencia de desarrollo
if (typeof window !== 'undefined' && window.console && import.meta.env.VITE_SUPPRESS_DEV_WARNINGS) {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    
    // Lista de warnings a suprimir
    const suppressedWarnings = [
      'Download the React DevTools',
      'React Router Future Flag Warning',
      'moz-extension://',
      'chrome-extension://',
      'lockdown-install.js',
      'SES Removing unpermitted intrinsics'
    ];
    
    // Verificar si el warning debe ser suprimido
    const shouldSuppress = suppressedWarnings.some(pattern => 
      message.includes(pattern)
    );
    
    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };
  
  console.error = (...args) => {
    const message = args[0]?.toString() || '';
    
    // Solo suprimir errores de extensiones, no errores reales de la app
    if (message.includes('moz-extension://') || 
        message.includes('chrome-extension://') ||
        message.includes('lockdown-install.js')) {
      return;
    }
    
    originalError.apply(console, args);
  };
  
  // Suprimir warnings de performance específicos de desarrollo
  const originalTrace = console.trace;
  console.trace = (...args) => {
    const message = args[0]?.toString() || '';
    
    if (!message.includes('lockdown') && !message.includes('extension')) {
      originalTrace.apply(console, args);
    }
  };
}

export {};
