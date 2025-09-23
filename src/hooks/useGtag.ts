import { useEffect } from 'react';

const GA_MEASUREMENT_ID = 'G-B2YZBLFSS5';

const SERVER_FALLBACK_PATH = '/api/analytics/collect';
const CLIENT_ID_KEY = 'cunao.ga.client_id';

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getOrCreateClientId() {
  if (typeof window === 'undefined') return undefined;
  try {
    // Try to read the _ga cookie (format GA1.2.XXXXXXXXXX.YYYYYYYYY)
    const match = document.cookie.match(/_ga=GA1\.2\.([0-9]+)\.([0-9]+)/);
    if (match) return `${match[1]}.${match[2]}`;
  } catch (e) {}

  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = uuidv4();
    try { localStorage.setItem(CLIENT_ID_KEY, id); } catch (e) {}
  }
  return id;
}

async function sendToServerFallback(eventName: string, params: Record<string, any> = {}) {
  try {
    const client_id = getOrCreateClientId() || 'unknown_client';
    const payload = {
      client_id,
      events: [
        {
          name: eventName,
          params: {
            ...params
          }
        }
      ]
    };

    await fetch(SERVER_FALLBACK_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    try { console.info('[gtag-fallback] sent', eventName, params); } catch (e) {}
  } catch (e) {
    try { console.warn('[gtag-fallback] error', e); } catch (err) {}
  }
}

function injectGtag(id: string) {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`script[data-gtag='${id}']`)) return;

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  s.setAttribute('data-gtag', id);
  document.head.appendChild(s);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) { (window as any).dataLayer.push(arguments); }
  (window as any).gtag = gtag;
  (window as any).gtag('js', new Date());
  (window as any).gtag('config', id, { send_page_view: false, anonymize_ip: true });
  try { console.info('[gtag] injected', id); } catch (e) {}
}

export function useGtag(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    injectGtag(GA_MEASUREMENT_ID);
  }, [enabled]);
}

export function trackPageview(path: string) {
  const send = () => {
    if (!(window as any).gtag) return false;
    try {
      (window as any).gtag('event', 'page_view', { page_path: path });
      return true;
    } catch (e) { return false; }
  };

  if (send()) return;
  // if not available, fallback to server MP
  sendToServerFallback('page_view', { page_path: path });
}

export function trackEvent(name: string, params: Record<string, any> = {}) {
  const send = () => {
    if (!(window as any).gtag) return false;
    try {
      (window as any).gtag('event', name, params);
      try { console.info('[gtag] event', name, params); } catch (e) {}
      return true;
    } catch (e) {
      return false;
    }
  };

  if (send()) return;

  // Retry a few times if gtag not yet loaded
  let attempts = 0;
  const maxAttempts = 6;
  const iv = setInterval(() => {
    attempts += 1;
    if (send() || attempts >= maxAttempts) {
      clearInterval(iv);
      if (!send()) {
        // final fallback to server
        sendToServerFallback(name, params);
      }
    }
  }, 500);
}

export function trackPurchase(payload: {
  transaction_id: string;
  value: number;
  currency: string;
  items?: Array<{ id: string; name?: string; price?: number; quantity?: number }>;
}) {
  const name = 'purchase';
  const params = {
    transaction_id: payload.transaction_id,
    value: payload.value,
    currency: payload.currency,
    items: payload.items || []
  };

  const send = () => {
    if (!(window as any).gtag) return false;
    try {
      (window as any).gtag('event', name, params);
      try { console.info('[gtag] trackPurchase', params); } catch (e) {}
      return true;
    } catch (e) { return false; }
  };

  if (send()) return;
  // fallback to server
  sendToServerFallback(name, params);
}
