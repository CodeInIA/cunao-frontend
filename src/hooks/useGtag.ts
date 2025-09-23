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

export function trackPurchase(payload: {
  transaction_id: string;
  value: number;
  currency: string;
  items?: Array<{ id: string; name?: string; price?: number; quantity?: number }>;
}) {
  if (!(window as any).gtag) return;
  (window as any).gtag('event', 'purchase', {
    transaction_id: payload.transaction_id,
    value: payload.value,
    currency: payload.currency,
    items: payload.items || []
  });
}
