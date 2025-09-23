import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageview } from '../utils/analytics';
import { getConsent } from '../utils/consent';

export const PageViewTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const consent = getConsent();
    if (consent?.analytics) {
      trackPageview(location.pathname + location.search);
    }
  }, [location.pathname, location.search]);

  return null;
};

export default PageViewTracker;
