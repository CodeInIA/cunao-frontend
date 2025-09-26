import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTopOnNavigate: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    try { window.scrollTo({ top: 0, left: 0 }); } catch (e) {}
  }, [pathname]);
  return null;
};

export default ScrollToTopOnNavigate;
