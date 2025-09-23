import { useEffect } from 'react';

const GA_MEASUREMENT_ID = 'G-B2YZBLFSS5';

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
  if (!(window as any).gtag) return;
  (window as any).gtag('event', 'page_view', { page_path: path });
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
    }
  }, 500);
}

export function trackPurchase(payload: {
  transaction_id: string;
  value: number;
  currency: string;
  items?: Array<{ id: string; name?: string; price?: number; quantity?: number }>;
}) {
  if (!(window as any).gtag) {
    try { console.warn('[gtag] trackPurchase called but gtag not loaded'); } catch (e) {}
    return;
  }
  try {
    console.info('[gtag] trackPurchase', payload);
  } catch (e) {}
  (window as any).gtag('event', 'purchase', {
    transaction_id: payload.transaction_id,
    value: payload.value,
    currency: payload.currency,
    items: payload.items || []
  });
}
