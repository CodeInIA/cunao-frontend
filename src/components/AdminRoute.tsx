import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';

axios.defaults.withCredentials = true;

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const res = await axios.get('/api/admin/me');
        if (!mounted) return;
        if (res.data && res.data.user) setAuthorized(true);
      } catch (e) {
        // unauthorized
        setAuthorized(false);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    check();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-8 text-white">Comprobando sesión de admin...</div>;
  if (!authorized) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
