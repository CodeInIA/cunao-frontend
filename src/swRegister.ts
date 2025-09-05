// Registro mejorado del Service Worker con auto-update

// Funciones globales para los botones del toast
(window as any).updateApp = function() {
  window.location.reload();
};

(window as any).dismissUpdate = function() {
  const toast = document.getElementById('sw-update-toast');
  if (toast) {
    toast.remove();
  }
};

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('[SW] Registrado correctamente:', registration.scope);
          
          // Comprobar actualizaciones cada 10 minutos
          setInterval(() => {
            registration.update();
          }, 600000);
          
          // Escuchar nuevas versiones
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  showUpdateToast();
                }
              });
            }
          });
        })
        .catch(err => console.error('[SW] Error en registro:', err));
      
      // Escuchar mensajes del Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SW_UPDATED') {
          console.log('[SW] Nueva versión disponible:', event.data.version);
          showUpdateToast();
        }
      });
    });
  }
}

function showUpdateToast() {
  // Crear toast de actualización si no existe
  if (document.getElementById('sw-update-toast')) return;
  
  const toast = document.createElement('div');
  toast.id = 'sw-update-toast';
  toast.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1e293b;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      font-family: system-ui;
      max-width: 300px;
      border: 2px solid #fbbf24;
    ">
      <div style="font-weight: bold; margin-bottom: 8px;">🔄 Nueva versión disponible</div>
      <div style="font-size: 14px; margin-bottom: 12px; opacity: 0.9;">
        Actualiza para obtener las últimas mejoras cuñao.
      </div>
      <button onclick="updateApp()" style="
        background: #fbbf24;
        color: #0f172a;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        margin-right: 8px;
      ">Actualizar</button>
      <button onclick="dismissUpdate()" style="
        background: transparent;
        color: #94a3b8;
        border: 1px solid #475569;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      ">Después</button>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Auto-dismiss después de 10 segundos
  setTimeout(() => {
    if (document.getElementById('sw-update-toast')) {
      (window as any).dismissUpdate();
    }
  }, 10000);
}

registerServiceWorker();
