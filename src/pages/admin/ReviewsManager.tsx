import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';

axios.defaults.withCredentials = true;

function getCookie(name: string) {
  const v = `; ${document.cookie}`;
  const parts = v.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(';').shift();
}

export default function ReviewsManager() {
  const [filter, setFilter] = useState<'pending'|'published'>('pending');
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newReview, setNewReview] = useState({ productId: '', rating: 5, description: '', authorName: '', status: 'pending' });
  const [createErrors, setCreateErrors] = useState<{ files?: string; text?: string; author?: string }>({});
  const [products, setProducts] = useState<any[]>([]);
  const [productQuery, setProductQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [fileList, setFileList] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [descCount, setDescCount] = useState<number>(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const touchTimer = useRef<number | null>(null);

  const MAX_IMAGES_PER_ITEM = 5;
  const MAX_REVIEW_CHARS = 1000;
  const MIN_REVIEW_CHARS = 20;
  const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB per file (backend multer limit)

  // fetch reviews only after authorization confirmed
  useEffect(() => { if (authorized) fetchReviews(); }, [filter, authorized]);

  async function fetchReviews() {
    setLoading(true);
    try {
  const res = await axios.get('/api/admin/reviews', { params: { status: filter } });
      setReviews(res.data.reviews || res.data);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  useEffect(() => {
    // fetch products once for the selector
    async function loadProducts() {
      try {
  const res = await axios.get('/api/products', { params: { limit: 200 } });
  // backend returns { success: true, data: products, message: ... }
  setProducts(res.data && res.data.data ? res.data.data : (res.data || []));
      } catch (e) {
        console.warn('Could not fetch products for admin selector', e);
      }
    }
    loadProducts();
  }, []);

  // check admin session on mount so this page cannot be accessed without login
  useEffect(() => {
    let mounted = true;
    (async function check() {
      try {
        const r = await axios.get('/api/admin/me');
        if (!mounted) return;
        if (r.data && r.data.user) setAuthorized(true);
        else { setAuthorized(false); navigate('/admin'); }
      } catch (e) {
        if (!mounted) return;
        setAuthorized(false);
        navigate('/admin');
      }
    })();
    return () => { mounted = false; };
  }, []);

  async function publish(id: string) {
  // Optimistic UI: update local state immediately
    const prev = reviews.slice();
    try {
      setReviews(r => r.map(rv => rv._id === id ? { ...rv, status: 'published' } : rv));
      // If currently filtering pending, remove the item from the list so it disappears
      if (filter === 'pending') setReviews(r => r.filter(rv => rv._id !== id));

      const csrf = getCookie('csrfToken');
      await axios.post(`/api/admin/reviews/publish/${id}`, {}, { headers: { 'x-csrf-token': csrf || '' } });
      // success: nothing else to do (state already updated)
    } catch (e) {
      console.error(e);
      // rollback
      setReviews(prev);
      toast.error('Error al publicar la reseña');
    }
  }

  // Publish with confirmation modal flow
  const [publishModalId, setPublishModalId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  function confirmPublish(id: string) {
    setPublishModalId(id);
  }

  async function publishConfirmed() {
    if (!publishModalId) return;
    const id = publishModalId;
    setPublishing(true);
    const prev = reviews.slice();
    try {
      // optimistic update
      setReviews(r => r.map(rv => rv._id === id ? { ...rv, status: 'published' } : rv));
      if (filter === 'pending') setReviews(r => r.filter(rv => rv._id !== id));

      const csrf = getCookie('csrfToken');
      await axios.post(`/api/admin/reviews/publish/${id}`, {}, { headers: { 'x-csrf-token': csrf || '' } });
      // show success toast and refresh list to ensure accurate data
      toast.success('Publicado correctamente');
      await fetchReviews();
      setPublishModalId(null);
    } catch (e) {
      console.error(e);
      setReviews(prev);
      toast.error('Error al publicar la reseña');
    } finally {
      setPublishing(false);
    }
  }

  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  function confirmRemove(id: string) {
    setDeleteModalId(id);
  }

  async function removeConfirmed() {
    if (!deleteModalId) return;
    setDeleting(true);
    const id = deleteModalId;
    const prev = reviews.slice();
  try {
      // optimistic remove
      setReviews(r => r.filter(rv => rv._id !== id));
      setDeleteModalId(null);
      const csrf = getCookie('csrfToken');
      await axios.delete(`/api/admin/reviews/${id}`, { headers: { 'x-csrf-token': csrf || '' } });
      // success: already removed from UI
    } catch (e) {
      console.error(e);
      setReviews(prev);
      toast.error('Error borrando la review');
    } finally {
      setDeleting(false);
    }
  }

  // Crear reseña manualmente (desde modal)
  async function createReview(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!newReview.productId || !newReview.rating) return toast.error('productId y rating requeridos');
    if (!newReview.authorName || !String(newReview.authorName).trim()) {
      setCreateErrors(prev => ({ ...prev, author: 'El nombre del autor es requerido.' }));
      toast.error('El nombre del autor es requerido.');
      return;
    }
    if (fileList.length > 5) return toast.error('Máximo 5 imágenes');
    // validar descripción
    const txt = (newReview.description || '').trim();
    if (txt.length < MIN_REVIEW_CHARS) {
      setCreateErrors(prev => ({ ...prev, text: `Por favor escribe al menos ${MIN_REVIEW_CHARS} caracteres.` }));
      toast.error(`La descripción debe tener al menos ${MIN_REVIEW_CHARS} caracteres.`);
      return;
    }
    if (txt.length > MAX_REVIEW_CHARS) {
      setCreateErrors(prev => ({ ...prev, text: `Máximo ${MAX_REVIEW_CHARS} caracteres.` }));
      toast.error(`La descripción no puede superar ${MAX_REVIEW_CHARS} caracteres.`);
      return;
    }
    setCreating(true);
    try {
      const csrf = getCookie('csrfToken');
      const fd = new FormData();
      fd.append('productId', newReview.productId);
      fd.append('rating', String(newReview.rating));
  // Title is not used in the review card UI; we send description as 'body' to backend
  if (newReview.description) fd.append('body', newReview.description);
      if (newReview.authorName) fd.append('authorName', newReview.authorName);
      if (newReview.status) fd.append('status', newReview.status);
      // append files
      fileList.slice(0,5).forEach((f) => fd.append('files', f));

  await axios.post('/api/admin/reviews/create', fd, { headers: { 'x-csrf-token': csrf || '' } });
      setShowCreate(false);
  setNewReview({ productId: '', rating: 5, description: '', authorName: '', status: 'pending' });
      setFileList([]);
      setPreviews([]);
  setCreateErrors({});
  setDescCount(0);
      fetchReviews();
      toast.success('Reseña creada correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al crear la reseña');
    } finally {
      setCreating(false);
    }
  }

  function handleFilesSelected(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    // separar aceptados y rechazados por mime y tamaño
    const accepted: File[] = [];
    const rejected: File[] = [];
    const oversized: File[] = [];
    arr.forEach(f => {
      const mim = (f.type || '').toLowerCase();
      if (!ALLOWED_MIME.includes(mim)) rejected.push(f);
      else if (f.size > MAX_FILE_SIZE) oversized.push(f);
      else accepted.push(f);
    });

    // mensajes similares a ReviewPage
    if (rejected.length > 0) {
      const names = rejected.map(f => f.name).join(', ');
      setCreateErrors(prev => ({ ...prev, files: `Formato no admitido para: ${names}. Sólo JPG, PNG o WebP.` }));
    } else if (oversized.length > 0) {
      const names = oversized.map(f => f.name).join(', ');
      setCreateErrors(prev => ({ ...prev, files: `Archivos demasiado grandes: ${names}. Máximo ${Math.round(MAX_FILE_SIZE/1024/1024)}MB.` }));
    } else {
      setCreateErrors(prev => ({ ...prev, files: undefined }));
    }

    const combined = [...fileList, ...accepted];
    if (combined.length > MAX_IMAGES_PER_ITEM) {
      const attempted = accepted.length;
      setCreateErrors(prev => ({ ...prev, files: `Has intentado añadir ${attempted} archivos, pero sólo se permiten ${MAX_IMAGES_PER_ITEM}.` }));
      const trimmed = combined.slice(0, MAX_IMAGES_PER_ITEM);
      setFileList(trimmed);
      return;
    }

    const newList = combined.slice(0, MAX_IMAGES_PER_ITEM);
    setFileList(newList);
  }

  // Generate and clean up object URLs whenever fileList changes
  useEffect(() => {
    // revoke previous previews handled in cleanup
    const urls = fileList.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach(u => {
        try { URL.revokeObjectURL(u); } catch (e) { /* ignore */ }
      });
    };
  }, [fileList]);

  // Drag handlers for preview reorder (adapted from ReviewPage)
  function handlePreviewDragStart(idx: number, e: React.DragEvent) {
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', String(idx)); } catch (err) {}
    setDragIndex(idx);
  }

  function handlePreviewDragOver(idx: number, e: React.DragEvent) {
    e.preventDefault();
    setDragOverIndex(idx);
  }

  function handlePreviewDrop(idx: number, e: React.DragEvent) {
    e.preventDefault();
    const srcIdxStr = e.dataTransfer.getData('text/plain');
    const srcIdx = srcIdxStr ? Number(srcIdxStr) : dragIndex;
    const tgtIdx = idx;
    if (srcIdx == null || Number.isNaN(srcIdx)) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    if (srcIdx === tgtIdx) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    setFileList(prev => {
      const arr = prev.slice();
      if (!arr[srcIdx]) return prev;
      const [moved] = arr.splice(srcIdx, 1);
      // insert at tgtIdx (splice will handle end insertion)
      arr.splice(tgtIdx, 0, moved);
      return arr;
    });
    setDragIndex(null);
    setDragOverIndex(null);
  }

  // Touch handlers: long-press to start drag (mobile)
  function handleTouchStart(idx: number, e: React.TouchEvent) {
    if (touchTimer.current) window.clearTimeout(touchTimer.current);
    touchTimer.current = window.setTimeout(() => {
      setDragIndex(idx);
      setDragOverIndex(idx);
    }, 350) as unknown as number;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (dragIndex == null) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
    const el = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
    if (!el) return;
    const thumb = el.closest('[data-thumb]') as HTMLElement | null;
    if (!thumb) return;
    const idxStr = thumb.getAttribute('data-index');
    if (!idxStr) return;
    const idx = Number(idxStr);
    if (!Number.isNaN(idx)) setDragOverIndex(idx);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchTimer.current) {
      window.clearTimeout(touchTimer.current);
      touchTimer.current = null;
    }
    const srcIdx = dragIndex;
    const tgtIdx = dragOverIndex;
    if (srcIdx == null || tgtIdx == null) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    if (srcIdx !== tgtIdx) {
      setFileList(prev => {
        const arr = prev.slice();
        if (!arr[srcIdx]) return prev;
        const [moved] = arr.splice(srcIdx, 1);
        arr.splice(tgtIdx, 0, moved);
        return arr;
      });
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const dtFiles = e.dataTransfer.files;
    handleFilesSelected(dtFiles);
  }

  function removeFileAt(index: number) {
    const f = fileList.slice();
    f.splice(index, 1);
    setFileList(f);
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Reviews manager</h2>
        <div className="flex items-center gap-3">
          <div className="inline-flex bg-slate-800 rounded-md p-1">
            <button onClick={()=>setFilter('pending')} className={`px-3 py-1 rounded text-sm ${filter==='pending'? 'bg-slate-700 text-white':'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>Pending</button>
            <button onClick={()=>setFilter('published')} className={`px-3 py-1 rounded text-sm ${filter==='published'? 'bg-slate-700 text-white':'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>Published</button>
          </div>

          <button onClick={()=>setShowCreate(true)} title="Crear reseña manual" className="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 px-3 py-2 rounded-md shadow hover:bg-yellow-300">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-semibold">Crear</span>
          </button>
        </div>
      </div>

      {loading ? <div>Cargando...</div> : (
        <div className="grid gap-4">
          {reviews.map(r => (
            <div key={r._id} className="p-4 border rounded bg-slate-800 text-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{r.authorName} — {r.rating}★</div>
                  <div className="text-sm text-slate-300">{r.productTitle || r.productId}</div>
                  <div className="mt-2 text-slate-200">{r.body}</div>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {r.status === 'pending' && <button onClick={()=>confirmPublish(r._id)} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded shadow">Publish</button>}
                  <button onClick={()=>confirmRemove(r._id)} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded shadow">Delete</button>
                </div>
              </div>
              {r.photos && r.photos.length>0 && <div className="mt-3 flex gap-2">{r.photos.map((p:string,i:number)=>(<img key={i} src={p} className="w-24 h-24 object-cover rounded" />))}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Modal crear reseña */}
      {showCreate ? (
  <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 bg-black/60">
          {/* Scrollbar styling for modal content: yellow thumb like the site */}
          <style>{`
            .admin-modal ::-webkit-scrollbar { width: 10px; height: 10px; }
            .admin-modal ::-webkit-scrollbar-track { background: #0f172a; }
            .admin-modal ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 9999px; border: 2px solid transparent; background-clip: padding-box; }
            .admin-modal { scrollbar-color: #f59e0b #0f172a; }
            /* For scrollable inner elements */
            .admin-modal .overflow-auto, .admin-modal .overflow-x-auto { scrollbar-color: #f59e0b #0f172a; }
          `}</style>
          <form onSubmit={createReview} className="admin-modal bg-slate-900 p-6 rounded-lg w-full max-w-xl border border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-white">Crear reseña manual</h3>
            <div className="grid gap-3">
              <label className="text-sm text-slate-300">Producto</label>
              <input value={productQuery} onChange={e=>setProductQuery(e.target.value)} placeholder="Buscar producto por título..." className="px-3 py-2 bg-slate-800 text-white rounded" />
              <div className="max-h-40 overflow-auto bg-slate-800 rounded p-2 admin-modal">
                {/* If a product is selected, show only the compact selected item */}
                {selectedProduct ? (
                  <div className="p-2 rounded bg-slate-700 flex items-center justify-between ring-2 ring-yellow-400">
                    <div className="text-sm text-white">{selectedProduct.title || selectedProduct.name || selectedProduct.id}</div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={()=>{ setSelectedProduct(null); setNewReview({...newReview, productId: ''}); }} className="text-xs px-2 py-1 bg-slate-800 rounded">Cambiar</button>
                    </div>
                  </div>
                ) : (
                  products.filter((p:any) => !productQuery || String(p.title || p.name || p.id).toLowerCase().includes(productQuery.toLowerCase())).slice(0,50).map((p:any) => (
                    <div key={p.id} onClick={()=>{ setSelectedProduct(p); setNewReview({...newReview, productId: String(p.id)}); }} className={`p-2 rounded cursor-pointer ${newReview.productId===String(p.id)? 'bg-slate-700 ring-2 ring-yellow-400':'hover:bg-slate-700'}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-white">{p.title || p.name || p.id}</div>
                        {newReview.productId===String(p.id) && <div className="text-xs bg-yellow-400 text-slate-900 px-2 py-0.5 rounded font-semibold">Selected</div>}
                      </div>
                      {p.images && p.images[0] && <div className="text-xs text-slate-400">{String(p.images[0]).slice(0,60)}</div>}
                    </div>
                  ))
                )}
              </div>

              <input value={newReview.authorName} onChange={e=>{ setNewReview({...newReview, authorName: e.target.value}); setCreateErrors(prev=>({...prev, author: undefined})); }} placeholder="Autor (nombre)" className="px-3 py-2 bg-slate-800 text-white rounded" />
              {createErrors.author && <div className="text-sm text-red-400 mt-1">{createErrors.author}</div>}
                {/* Rating and Status on the same row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-300">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1,2,3,4,5].map(n => (
                      <button type="button" key={n} onClick={()=>setNewReview({...newReview, rating: n})} className={`px-2 py-1 rounded ${newReview.rating>=n? 'bg-yellow-400 text-slate-900':'bg-slate-700 text-slate-300'}`}>{n}★</button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-300">Estado</label>
                  <select value={newReview.status} onChange={e=>setNewReview({...newReview, status: e.target.value})} className="px-3 py-2 bg-slate-800 text-white rounded">
                    <option value="pending">Pending</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              {/* Title removed (not part of review card). Description instead of body */}
              <label className="text-sm text-slate-300">Descripción</label>
              <textarea value={newReview.description} onChange={e=>{ const val = e.target.value.slice(0, MAX_REVIEW_CHARS); setNewReview({...newReview, description: val}); setCreateErrors(prev=>({...prev, text: undefined})); setDescCount(val.length); }} placeholder="Descripción" maxLength={MAX_REVIEW_CHARS} className="px-3 py-2 bg-slate-800 text-white rounded" />
              <div className="flex items-center justify-between mt-1">
                <div>
                  {createErrors.text ? (
                    <div className="text-sm text-red-400">{createErrors.text}</div>
                  ) : (descCount > 0 && descCount < MIN_REVIEW_CHARS) ? (
                    <div className="text-sm text-yellow-300">Por favor escribe al menos {MIN_REVIEW_CHARS} caracteres.</div>
                  ) : null}
                </div>
                <div className={`text-sm ${descCount >= MAX_REVIEW_CHARS ? 'text-red-400' : (descCount >= MAX_REVIEW_CHARS - 100 ? 'text-yellow-300' : 'text-slate-400')}`}>{descCount}/{MAX_REVIEW_CHARS}</div>
              </div>

              {/* Estado moved next to Rating above */}

              <label className="text-sm text-slate-300">Imágenes (max 5)</label>
              <div onDragOver={e=>e.preventDefault()} onDrop={handleDrop} className="border-dashed border-2 border-slate-700 p-4 rounded text-slate-300 bg-slate-800">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={()=>fileInputRef.current?.click()} className="px-3 py-1 bg-slate-700 rounded">Seleccionar archivos</button>
                  <div className="text-sm">o arrastra y suelta imágenes aquí</div>
                </div>
                <div className="text-xs text-slate-400 mt-2">Solo PNG, JPG o WebP — máximo 3MB por archivo. También puedes arrastrar y soltar imágenes.</div>
                <input ref={fileInputRef} type="file" multiple accept=".png,.jpg,.jpeg,.webp" onChange={e=>handleFilesSelected(e.target.files)} className="hidden" />
                {previews.length>0 && (
                  <div className="mt-3 admin-modal">
                    <div className="flex flex-wrap gap-3 px-1 py-2" style={{ alignItems: 'center' }}>
                      {previews.map((u,i)=> (
                        <div key={i} className={`relative rounded overflow-hidden bg-slate-700`} style={{ width: 72, height: 72 }} draggable data-thumb data-index={String(i)} onDragStart={(e)=>handlePreviewDragStart(i,e)} onDragOver={(e)=>handlePreviewDragOver(i,e)} onDrop={(e)=>handlePreviewDrop(i,e)} onTouchStart={(e)=>handleTouchStart(i,e)} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                          <img src={u} className={`w-full h-full object-cover ${dragOverIndex===i? 'ring-4 ring-yellow-400 ring-inset':''}`} style={{ objectPosition: 'center' }} />
                          <div className="absolute top-1 left-1 bg-yellow-400 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">{i+1}</div>
                          <button type="button" onClick={()=>removeFileAt(i)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
                          {dragOverIndex===i && (
                            <div className="absolute inset-0 border-2 border-dashed border-yellow-400 rounded pointer-events-none" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {createErrors.files && <div className="text-sm text-red-400 mt-2">{createErrors.files}</div>}
              </div>
            </div>

              <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={()=>{setShowCreate(false); setFileList([]); setPreviews([]); setNewReview({ productId: '', rating: 5, description: '', authorName: '', status: 'pending' }); setDescCount(0); setCreateErrors({});}} className="px-3 py-2 bg-slate-700 text-white rounded">Cancelar</button>
              <button type="submit" disabled={creating} className="px-4 py-2 bg-yellow-400 text-slate-900 rounded font-semibold">{creating? 'Creando...':'Crear reseña'}</button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Modal confirmar eliminación */}
      {deleteModalId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 p-6 rounded-lg w-full max-w-md border border-slate-700">
            <h3 className="text-lg font-semibold mb-2 text-white">Eliminar reseña</h3>
            <p className="text-slate-300">¿Estás seguro de que quieres eliminar esta reseña y todas sus fotos asociadas? Esta acción no se puede deshacer.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={()=>setDeleteModalId(null)} className="px-3 py-2 bg-slate-700 text-white rounded">Cancelar</button>
              <button onClick={removeConfirmed} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded font-semibold">{deleting ? 'Eliminando...' : 'Eliminar'}</button>
            </div>
          </div>
        </div>
      ) : null}
      {/* Modal confirmar publicación */}
      {publishModalId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 p-6 rounded-lg w-full max-w-md border border-slate-700">
            <h3 className="text-lg font-semibold mb-2 text-white">Publicar reseña</h3>
            <p className="text-slate-300">¿Estás seguro de que quieres publicar esta reseña? Se hará visible públicamente.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={()=>setPublishModalId(null)} className="px-3 py-2 bg-slate-700 text-white rounded">Cancelar</button>
              <button onClick={publishConfirmed} disabled={publishing} className="px-4 py-2 bg-emerald-500 text-white rounded font-semibold">{publishing ? 'Publicando...' : 'Publicar'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
