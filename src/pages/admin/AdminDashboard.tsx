import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
axios.defaults.withCredentials = true;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get('/api/admin/reviews', { params: { status: 'pending' } });
        const list = res.data && (res.data.reviews || res.data) ? (res.data.reviews || res.data) : [];
        if (!mounted) return;
        setPendingCount(Array.isArray(list) ? list.length : 0);
      } catch (e) {
        // Keep null on error
        console.warn('Could not fetch pending reviews count', e);
        if (!mounted) return;
        setPendingCount(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function goToReviews() {
    navigate('/admin/review-manager');
  }

  function logout() {
    (async () => {
      try {
        await axios.post('/api/admin/logout');
      } catch (e) {
        // ignore
      } finally {
        navigate('/admin');
      }
    })();
  }

  function handleKeyNavigate(e: React.KeyboardEvent, fn: () => void) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fn();
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-white">Panel de administración</h2>
          <p className="text-slate-400 mt-1">Accesos rápidos para moderar y gestionar contenido.</p>
        </div>

        <button
          onClick={logout}
          className="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 px-4 py-2 rounded-md font-semibold shadow hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div
          role="button"
          tabIndex={0}
          onClick={goToReviews}
          onKeyDown={(e) => handleKeyNavigate(e, goToReviews)}
          className="group relative overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg transform transition hover:scale-105 focus:scale-105 focus:outline-none focus:ring-4 focus:ring-yellow-400 cursor-pointer"
        >
          <div className="flex items-start gap-4">
            <div className="flex-none w-14 h-14 rounded-lg bg-slate-700/60 flex items-center justify-center">
              {/* icono */}
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-yellow-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M3 10h4l3 9 4-18 3 9h4" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">Reviews Manager</h3>
              <p className="text-slate-300 mt-1">Revisa, publica o elimina reseñas. Las fotos en Cloudinary se eliminarán al borrar una reseña.</p>

              <div className="mt-4 flex items-center gap-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-200">Pendientes: {pendingCount === null ? '—' : pendingCount}</span>
                <button className="ml-auto inline-flex items-center gap-2 bg-yellow-400 text-slate-900 px-3 py-1 rounded-md text-sm font-semibold opacity-0 group-hover:opacity-100 transition">Abrir</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
