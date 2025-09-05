// Registro del Service Worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => {
          console.log('[SW] Registrado', reg.scope);
        })
        .catch(err => console.error('[SW] Error registro', err));
    });
  }
}

registerServiceWorker();
