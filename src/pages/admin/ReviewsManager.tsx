import React, { useEffect, useState } from 'react';
import axios from 'axios';

function getToken() { return localStorage.getItem('adminToken'); }

export default function ReviewsManager() {
  const [filter, setFilter] = useState<'pending'|'published'>('pending');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchReviews(); }, [filter]);

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/reviews', { params: { status: filter }, headers: { Authorization: `Bearer ${getToken()}` } });
      setReviews(res.data.reviews || res.data);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  async function publish(id: string) {
    try {
      await axios.post(`/api/admin/reviews/publish/${id}`, {}, { headers: { Authorization: `Bearer ${getToken()}` } });
      fetchReviews();
    } catch (e) { console.error(e); }
  }

  async function remove(id: string) {
    if (!confirm('Eliminar review y sus fotos?')) return;
    try {
      await axios.delete(`/api/admin/reviews/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      fetchReviews();
    } catch (e) { console.error(e); }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Reviews manager</h2>
      <div className="mb-4">
        <button onClick={()=>setFilter('pending')} className={`px-3 py-1 mr-2 ${filter==='pending'? 'bg-slate-800 text-white':'bg-white text-slate-900'}`}>Pending</button>
        <button onClick={()=>setFilter('published')} className={`px-3 py-1 ${filter==='published'? 'bg-slate-800 text-white':'bg-white text-slate-900'}`}>Published</button>
      </div>
      {loading ? <div>Cargando...</div> : (
        <div className="grid gap-4">
          {reviews.map(r => (
            <div key={r._id} className="p-4 border rounded bg-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{r.authorName} — {r.rating}★</div>
                  <div className="text-sm">{r.productTitle || r.productId}</div>
                  <div className="mt-2">{r.body}</div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {r.status === 'pending' && <button onClick={()=>publish(r._id)} className="px-3 py-1 bg-green-600 text-white rounded">Publish</button>}
                  <button onClick={()=>remove(r._id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                </div>
              </div>
              {r.photos && r.photos.length>0 && <div className="mt-3 flex gap-2">{r.photos.map((p:string,i:number)=>(<img key={i} src={p} className="w-24 h-24 object-cover" />))}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
