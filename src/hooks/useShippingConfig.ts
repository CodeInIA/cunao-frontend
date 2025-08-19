import { useEffect, useState } from 'react';

export function useShippingConfig(apiUrl: string) {
  const [config, setConfig] = useState({
    shippingCostSpain: 0,
    shippingCostEuropa: 0,
    freeShippingThreshold: 0,
    loading: true,
    error: null as string | null,
  });

  useEffect(() => {
    fetch(`${apiUrl}/config/shipping`)
      .then(res => res.json())
      .then(data => setConfig({ ...data, loading: false, error: null }))
      .catch(err => setConfig(prev => ({ ...prev, loading: false, error: err.message })));
  }, [apiUrl]);

  return config;
}
