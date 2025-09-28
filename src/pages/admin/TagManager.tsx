import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
axios.defaults.withCredentials = true;

function getCookie(name: string) {
  const v = `; ${document.cookie}`;
  const parts = v.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift();
}

export default function TagManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/admin/products', { params: { limit: 500 } });
        if (!mounted) return;
        setProducts(res.data && res.data.data ? res.data.data : []);
      } catch (e) {
        console.error(e);
        toast.error('Error cargando productos');
      } finally { setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  async function saveTags(productId: string, tags: string[]) {
    try {
      const csrf = getCookie('csrfToken');
      await axios.put(`/api/admin/products/${productId}/tags`, { tags }, { headers: { 'x-csrf-token': csrf || '' } });
      toast.success('Tags actualizados correctamente');
      // actualizar localmente
      setProducts(p => p.map(pp => pp.id === productId ? { ...pp, tags } : pp));
    } catch (e) {
      console.error(e);
      toast.error('Error al actualizar tags');
    }
  }

  const normalizedQuery = (searchQuery || '').trim().toLowerCase();
  const filteredProducts = React.useMemo(() => {
    if (!normalizedQuery) return products;
    return products.filter(p => {
      const title = (p.title || '').toString().toLowerCase();
      const tags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : ((p.tags || '') + '').toLowerCase();
      return title.includes(normalizedQuery) || tags.includes(normalizedQuery);
    });
  }, [products, normalizedQuery]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/dashboard')} className="p-2 rounded bg-slate-800 hover:bg-slate-700" aria-label="Volver al dashboard">
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">Tag Manager</h2>
            <p className="text-slate-400 mt-1">Edita las tags de los productos y sincronízalas con Printify.</p>
          </div>
        </div>

        <div className="ml-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="pl-9 pr-3 py-2 rounded bg-slate-800 text-slate-100 w-80 placeholder:text-slate-400"
              placeholder="Buscar por nombre o tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar productos por nombre o tags"
            />
          </div>
        </div>
      </div>

      {loading ? <div>Cargando...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map(prod => (
            <div key={prod.id} className="flex gap-4 items-start bg-slate-800 p-4 rounded-md">
              <img src={prod.image && (prod.image.cdnUrl || prod.image.src)} alt={prod.title} className="w-24 h-24 object-cover rounded" />
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <h3 className="text-white font-semibold">{prod.title}</h3>
                  <div className="ml-auto text-sm text-slate-400">{Array.isArray(prod.tags) ? prod.tags.length : 0} tags</div>
                </div>
                <textarea className="w-full mt-2 bg-slate-900 text-white p-2 rounded" defaultValue={Array.isArray(prod.tags) ? prod.tags.join(', ') : ''} onBlur={(e) => {
                  const raw = e.currentTarget.value || '';
                  const tags = raw.split(',').map((t:any)=>t.trim()).filter((t:any)=>t);
                  saveTags(prod.id, tags);
                }} />
                <div className="text-xs text-slate-400 mt-1">Separadas por comas — los cambios se guardan al perder foco</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
