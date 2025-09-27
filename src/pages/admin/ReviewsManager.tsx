import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Plus, ArrowLeft } from 'lucide-react';

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
  const [newReview, setNewReview] = useState({ productId: '', rating: 5, description: '', authorName: '', status: 'pending', color: '', size: '', quantity: 1 });
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<'all'|'real'|'manual'>('all');
  const [sortOrder, setSortOrder] = useState<'newest'|'oldest'>('newest');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const touchTimer = useRef<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const MAX_IMAGES_PER_ITEM = 5;
  const MAX_REVIEW_CHARS = 1000;
  const MIN_REVIEW_CHARS = 20;
  const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB per file (backend multer limit)

  // fetch reviews only after authorization confirmed
  useEffect(() => { if (authorized) fetchReviews(); }, [filter, authorized]);

  type FetchOpts = { cacheBust?: boolean; retries?: number; delayMs?: number };
  async function fetchReviews(opts: FetchOpts = {}) {
    const { cacheBust = false, retries = 0, delayMs = 300 } = opts;
    setLoading(true);
    console.debug('[ReviewsManager] fetchReviews start, filter=', filter, 'opts=', opts);

    let attempt = 0;
    let lastLen: number | null = reviews ? reviews.length : null;
    while (true) {
      try {
        const params: any = { status: filter };
        if (cacheBust) params._t = Date.now();
        const res = await axios.get('/api/admin/reviews', { params, headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' } });
        const newReviews = res.data.reviews || res.data;
        console.debug('[ReviewsManager] fetchReviews got', Array.isArray(newReviews) ? newReviews.length : typeof newReviews, 'items', 'attempt=', attempt);
        setReviews(newReviews);

        // if caller requested retries and the length didn't change, wait and retry
        if (attempt < retries) {
          const len = Array.isArray(newReviews) ? newReviews.length : null;
          if (lastLen !== null && len === lastLen) {
            attempt++;
            console.debug('[ReviewsManager] fetchReviews length unchanged, retrying after', delayMs, 'ms (attempt', attempt, 'of', retries, ')');
            await new Promise(r => setTimeout(r, delayMs));
            continue;
          }
        }

        break;
      } catch (e) {
        console.error(e);
        toast.error('Error cargando reseñas (ver consola)');
        break;
      } finally {
        setLoading(false);
      }
    }
  }

  const filteredReviews = React.useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    return reviews.filter(r => {
      // source filter
      const orderIdRaw = (r.orderId || (r.order && (r.order.id || r.order.orderId)) || '').toString();
      const isManual = orderIdRaw && orderIdRaw.toLowerCase() === 'admin';
      const isReal = !!orderIdRaw && !isManual;
      if (sourceFilter === 'manual' && !isManual) return false;
      if (sourceFilter === 'real' && !isReal) return false;

      if (!q) return true;
      const title = String(r.productTitle || r.productId || '').toLowerCase();
      const body = String(r.body || '').toLowerCase();
      const author = String(r.authorName || r.author || '').toLowerCase();
      const color = String(r.color || '').toLowerCase();
      return title.includes(q) || body.includes(q) || author.includes(q) || color.includes(q);
    });
  }, [reviews, searchQuery, sourceFilter]);

  // Apply client-side sorting by creation date
  const sortedFilteredReviews = React.useMemo(() => {
    const arr = filteredReviews.slice();
    arr.sort((a: any, b: any) => {
      const ta = Number(new Date(a && a.createdAt ? a.createdAt : a.createdAt));
      const tb = Number(new Date(b && b.createdAt ? b.createdAt : b.createdAt));
      if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
      return sortOrder === 'newest' ? tb - ta : ta - tb;
    });
    return arr;
  }, [filteredReviews, sortOrder]);

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

  // derive color/size options from the selected product (heuristic)
  function getProductOptions(prod: any) {
    if (!prod) return { colors: [] as string[], sizes: [] as string[] };
    // Use only enabled variants to determine available option ids (matches ProductCard logic)
    const enabledVariants = Array.isArray(prod.variants) ? prod.variants.filter((v: any) => v.is_enabled !== false) : [];

    // If options exist, prefer to map from option values but filter by those used by enabled variants
    if (Array.isArray(prod.options) && prod.options.length > 0) {
      // collect option ids used by enabled variants
      const usedOptionIds = Array.from(new Set(enabledVariants.flatMap((v: any) => (Array.isArray(v.options) ? v.options : []).filter(Boolean))));

      const findOption = (typeName: string) => prod.options.find((o: any) => (o.type || '').toString().toLowerCase() === typeName || String(o.name || '').toLowerCase().includes(typeName));
      const colorOpt = findOption('color');
      const sizeOpt = findOption('size') || prod.options.find((o: any) => String(o.name || '').toLowerCase().includes('talla'));

  const mapValues = (vals: any[]) => vals.map((v: any) => String(typeof v === 'string' ? v : (v && (v.title || v.name || v))));

      let colors: string[] = [];
      if (colorOpt && Array.isArray(colorOpt.values)) {
        // if variants reference option ids, filter values by id
        if (usedOptionIds.length > 0 && Array.isArray(colorOpt.values) && colorOpt.values[0] && typeof colorOpt.values[0] === 'object' && 'id' in colorOpt.values[0]) {
          colors = colorOpt.values.filter((val: any) => usedOptionIds.includes(val.id)).map((v: any) => String(v && (v.title || v.name || '')));
        } else {
          colors = mapValues(colorOpt.values);
        }
      }

      let sizes: string[] = [];
      if (sizeOpt && Array.isArray(sizeOpt.values)) {
        if (usedOptionIds.length > 0 && Array.isArray(sizeOpt.values) && sizeOpt.values[0] && typeof sizeOpt.values[0] === 'object' && 'id' in sizeOpt.values[0]) {
          sizes = sizeOpt.values.filter((val: any) => usedOptionIds.includes(val.id)).map((v: any) => String(v && (v.title || v.name || '')));
        } else {
          sizes = mapValues(sizeOpt.values);
        }
      }

      return { colors, sizes };
    }

    // Fallback: use enabled variants fields
    if (enabledVariants.length > 0) {
      const colors = Array.from(new Set(enabledVariants.map((v: any) => v.color || v.variantColor || '').filter(Boolean)));
      const sizes = Array.from(new Set(enabledVariants.map((v: any) => v.size || v.variantSize || '').filter(Boolean)));
      return { colors, sizes };
    }
    return { colors: [], sizes: [] };
  }

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
      // success: refresh list to ensure server/state consistency
      console.debug('[ReviewsManager] publish succeeded, refreshing list for id=', id);
  await fetchReviews({ cacheBust: true, retries: 3, delayMs: 400 });
      toast.success('Publicado correctamente');
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
  await fetchReviews({ cacheBust: true, retries: 3, delayMs: 400 });
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
    // success: refresh list to make sure server and client are consistent
    // use cacheBust + retries to avoid stale/cached responses that could reintroduce the deleted item
    console.debug('[ReviewsManager] delete succeeded, refreshing list for id=', id);
    await fetchReviews({ cacheBust: true, retries: 3, delayMs: 400 });
    toast.success('Reseña eliminada correctamente');
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
    if (newReview.color) fd.append('color', String(newReview.color));
    if (newReview.size) fd.append('size', String(newReview.size));
    if (newReview.quantity) fd.append('quantity', String(newReview.quantity));
      // append files
      fileList.slice(0,5).forEach((f) => fd.append('files', f));

  await axios.post('/api/admin/reviews/create', fd, { headers: { 'x-csrf-token': csrf || '' } });
      setShowCreate(false);
  setNewReview({ productId: '', rating: 5, description: '', authorName: '', status: 'pending', color: '', size: '', quantity: 1 });
      setFileList([]);
      setPreviews([]);
  setCreateErrors({});
  setDescCount(0);
  fetchReviews({ cacheBust: true, retries: 3, delayMs: 400 });
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
    // prevent the parent drop handler from also receiving this event
    e.stopPropagation();
    setDragOverIndex(idx);
  }

  function handlePreviewDrop(idx: number, e: React.DragEvent) {
    e.preventDefault();
    // prevent the parent drop handler from also receiving this event (which would treat it as a file drop)
    e.stopPropagation();
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
    // If this drop carries an internal drag index (text/plain) it is a reorder of previews
    // and should not be treated as adding new files.
    try {
      const txt = e.dataTransfer.getData('text/plain');
      if (txt) return;
    } catch (err) {
      // ignore
    }
    const dtFiles = e.dataTransfer.files;
    if (dtFiles && dtFiles.length > 0) handleFilesSelected(dtFiles);
  }

  function removeFileAt(index: number) {
    const f = fileList.slice();
    f.splice(index, 1);
    setFileList(f);
  }

  // Prevent background page scrolling when any modal is open (create / delete / publish)
  useEffect(() => {
    const modalOpen = showCreate || !!deleteModalId || !!publishModalId;
    // save previous values to restore later
    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    if (modalOpen) {
      // Compensate for scrollbar to avoid layout shift
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prevOverflow || '';
      document.body.style.paddingRight = prevPaddingRight || '';
    }

    return () => {
      // restore previous values on cleanup/unmount
      document.body.style.overflow = prevOverflow || '';
      document.body.style.paddingRight = prevPaddingRight || '';
    };
  }, [showCreate, deleteModalId, publishModalId]);

  // Control body scroll when lightbox is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (lightboxImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = prev || '';
    }
    return () => { document.body.style.overflow = prev || ''; };
  }, [lightboxImage]);

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-3">
        {/* Left: arrow + title (row 1) */}
        <div className="flex items-center gap-3 order-1 min-w-0">
          <Link to="/admin/dashboard" className="p-2 rounded bg-slate-800 hover:bg-slate-700" title="Volver al dashboard">
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <h2 className="text-2xl font-bold truncate">Reviews manager</h2>
        </div>

        {/* Middle: source filter (row 2 on mobile, combined with others on sm+) */}
        <div className="order-2 sm:order-3 w-full sm:w-auto flex items-center justify-start sm:justify-end shrink-0 mb-0 sm:mb-0">
          <div className="inline-flex items-center rounded-md bg-slate-800 p-1">
            <button
              onClick={() => setSourceFilter('all')}
              className={`px-3 py-1 rounded text-sm ${sourceFilter==='all' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
              Todas
            </button>
            <button
              onClick={() => setSourceFilter('real')}
              className={`px-3 py-1 rounded text-sm ${sourceFilter==='real' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
              Reales
            </button>
            <button
              onClick={() => setSourceFilter('manual')}
              className={`px-3 py-1 rounded text-sm ${sourceFilter==='manual' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
              Manuales
            </button>
          </div>
        </div>
        {/* Sort control (newest/oldest) */}
        <div className="order-2 sm:order-3 w-full sm:w-auto flex items-center justify-start sm:justify-end shrink-0 mb-0 sm:mb-0">
          <div className="ml-0 sm:ml-3 inline-flex items-center rounded-md bg-slate-800 p-1">
            <button onClick={() => setSortOrder('newest')} className={`px-3 py-1 rounded text-sm ${sortOrder==='newest' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>Más recientes</button>
            <button onClick={() => setSortOrder('oldest')} className={`px-3 py-1 rounded text-sm ${sortOrder==='oldest' ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>Más antiguas</button>
          </div>
        </div>

        {/* Selector + create (row 3 on mobile, row 3 on sm+) */}
        <div className="order-3 sm:order-3 flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end shrink-0">
          <div className="inline-flex bg-slate-800 rounded-md p-1">
            <button
              onClick={() => { setFilter('pending'); fetchReviews(); }}
              aria-pressed={filter === 'pending'}
              className={`px-3 py-1 rounded text-sm ${filter==='pending'? 'bg-slate-700 text-white':'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
              Pending
            </button>
            <button
              onClick={() => { setFilter('published'); fetchReviews(); }}
              aria-pressed={filter === 'published'}
              className={`px-3 py-1 rounded text-sm ${filter==='published'? 'bg-slate-700 text-white':'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
              Published
            </button>
          </div>

          <button onClick={()=>setShowCreate(true)} title="Crear reseña manual" className="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 px-3 py-2 rounded-md shadow hover:bg-yellow-300">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-semibold">Crear</span>
          </button>
        </div>

        {/* Right: search (row 4 on mobile, row 2 on sm+) */}
        <div className="order-4 sm:order-2 w-full sm:max-w-[24rem] md:max-w-[420px]">
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar reseñas... (autor, producto, texto)"
            className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      {loading ? <div>Cargando...</div> : (
        <div className="grid gap-4">
          {sortedFilteredReviews.map(r => (
            <div key={r._id} className="p-0 relative border rounded bg-slate-800 text-slate-100 w-full mx-auto min-w-0 overflow-hidden" style={{ maxWidth: 'calc(100vw - 32px)', boxSizing: 'border-box' }}>
              <div className="flex">
                {/* Left: variant image full height */}
                <div className="flex-shrink-0 w-28 sm:w-32 bg-slate-700 flex items-center justify-center">
                  <img src={r.imageUrl || '/logo/logo-sin-letras.png'} alt={r.productTitle || r.productId} className="w-full h-full object-contain p-2" style={{ maxHeight: '160px' }} />
                </div>
                <div className="p-4 flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      {(() => {
                        const orderIdRaw = (r.orderId || (r.order && (r.order.id || r.order.orderId)) || '').toString();
                        const isManual = orderIdRaw && orderIdRaw.toLowerCase() === 'admin';
                        const isReal = !!orderIdRaw && !isManual;
                        return (
                          <>
                            <div className="font-semibold text-lg flex items-center gap-2">
                              <a href={`/producto/${r.productSlug || r.productId}${r.color ? `?color=${encodeURIComponent(String(r.color))}` : ''}`} className="text-white hover:underline break-words whitespace-normal max-w-full">{r.productTitle || r.productId}</a>
                              {/* Desktop/tablet badge (hidden on small screens) */}
                              {isReal && <span title="Reseña verificada - proviene de un pedido real" className="hidden sm:inline-flex text-xs bg-green-600 text-white px-2 py-0.5 rounded-full">Auténtica</span>}
                              {isManual && <span title="Reseña creada manualmente por admin" className="hidden sm:inline-flex text-xs bg-gray-700 text-slate-200 px-2 py-0.5 rounded-full">🤖 Manual</span>}
                            </div>

                            {/* Rating: show stars and numeric value */}
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center" aria-hidden>
                                {[1,2,3,4,5].map((n) => (
                                  <span key={n} className={`text-spanish-yellow ${n <= (Number(r?.rating) || 0) ? '' : 'opacity-40'}`}>★</span>
                                ))}
                              </div>
                              <div className="text-sm text-slate-300">{r?.rating ? `${r.rating}★` : ''}</div>
                            </div>

                            {/* Mobile badge moved below photos to avoid overlap (see block after thumbnails) */}
                          </>
                        );
                      })()}
                      <div className="text-sm text-slate-300 mt-1">{r.color ? `${r.color}` : ''}{r.size ? ` · ${r.size}` : ''}{(r.quantity !== undefined && r.quantity !== null) ? ` · x${r.quantity}` : ''}</div>
                      <div className="text-sm text-slate-400 mt-1">{
                        `Autor: ${r.authorName || r.author || '—'} · Pedido: ${r.orderId || (r.order && (r.order.id || r.order.orderId)) || '—'}`
                      }</div>
                      <div className="mt-2 text-slate-200 break-words whitespace-normal min-w-0 max-w-full">{r.body}</div>
                      {/* Created at timestamp bottom-right (desktop/tablet). Mobile timestamp + badge rendered below thumbnails to avoid overlap. */}
                      <div className="absolute right-3 bottom-3 text-xs text-slate-400 hidden sm:block">{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {r.status === 'pending' && <button onClick={()=>confirmPublish(r._id)} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded shadow">Publish</button>}
                      <button onClick={()=>confirmRemove(r._id)} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded shadow">Delete</button>
                    </div>
                  </div>
                  {/* thumbnails (if any) */}
                  {r.photos && r.photos.length>0 && (
                      <div className="mt-3 flex gap-2 flex-wrap box-border max-w-full overflow-hidden">
                      {r.photos.map((p:string,i:number) => (
                        <div key={i} className="relative">
                          <img src={p} onClick={()=>setLightboxImage(p)} className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] object-cover rounded cursor-pointer" />
                          <div className="absolute top-1 left-1 bg-yellow-400 text-slate-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">{i+1}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Mobile-only: badge + timestamp below photos to avoid overlap */}
                  <div className="sm:hidden mt-2 text-right">
                    {(() => {
                      const orderIdRaw = (r.orderId || (r.order && (r.order.id || r.order.orderId)) || '').toString();
                      const isManual = orderIdRaw && orderIdRaw.toLowerCase() === 'admin';
                      const isReal = !!orderIdRaw && !isManual;
                      return (
                        <>
                          {isReal && <div className="inline-block text-xs bg-green-600 text-white px-2 py-0.5 rounded-full mb-1">Auténtica</div>}
                          {isManual && <div className="inline-block text-xs bg-gray-700 text-slate-200 px-2 py-0.5 rounded-full mb-1">🤖 Manual</div>}
                          {r.createdAt ? (
                            <div className="text-xs text-slate-400">
                              <div>{new Date(r.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                              <div className="text-[11px]">{new Date(r.createdAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                            </div>
                          ) : null}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear reseña */}
    {showCreate ? (
  <div className="fixed inset-0 z-50 flex items-start justify-center pt-0 bg-black/60">
          {/* Scrollbar styling for modal content: yellow thumb like the site */}
          <style>{`
            .admin-modal ::-webkit-scrollbar { width: 10px; height: 10px; }
            .admin-modal ::-webkit-scrollbar-track { background: #0f172a; }
            .admin-modal ::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 9999px; border: 2px solid transparent; background-clip: padding-box; }
            .admin-modal { scrollbar-color: #f59e0b #0f172a; }
            /* For scrollable inner elements */
            .admin-modal .overflow-auto, .admin-modal .overflow-x-auto { scrollbar-color: #f59e0b #0f172a; }
            /* Remove number input spin buttons (Chrome/Safari/Edge/Firefox) */
            .admin-modal input[type=number]::-webkit-outer-spin-button,
            .admin-modal input[type=number]::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
            .admin-modal input[type=number] { -moz-appearance: textfield; appearance: textfield; }
          `}</style>
          <form onSubmit={createReview} className="admin-modal bg-slate-900 p-4 sm:p-6 rounded-none sm:rounded-lg w-full sm:max-w-xl border border-slate-700 h-full sm:h-auto sm:mt-[5px] sm:mx-auto max-h-screen" style={{ display: 'flex', flexDirection: 'column', boxSizing: 'border-box', maxHeight: '100vh' }}>
            <h3 className="text-lg font-semibold mb-4 text-white">Crear reseña manual</h3>
            <div className="grid gap-3 overflow-auto" style={{ flex: 1 }}>
              <label className="text-sm text-slate-300">Producto</label>
              <input value={productQuery} onChange={e=>setProductQuery(e.target.value)} placeholder="Buscar producto por título..." className="px-3 py-2 bg-slate-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-inset" />
              <div className="max-h-40 overflow-auto bg-slate-800 rounded p-2 admin-modal" style={{ minHeight: '48px' }}>
                {/* If a product is selected, show only the compact selected item */}
                  {selectedProduct ? (
                  <div className="p-2 rounded bg-slate-700 flex items-center justify-between ring-2 ring-yellow-400" style={{ minHeight: '48px' }}>
                    <div className="text-sm text-white">{selectedProduct.title || selectedProduct.name || selectedProduct.id}</div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={()=>{ setSelectedProduct(null); setNewReview({...newReview, productId: ''}); }} className="text-xs px-2 py-1 bg-slate-800 rounded">Cambiar</button>
                    </div>
                  </div>
                ) : (
                  products.filter((p:any) => !productQuery || String(p.title || p.name || p.id).toLowerCase().includes(productQuery.toLowerCase())).slice(0,50).map((p:any) => (
                    <div key={p.id} onClick={()=>{ 
                        setSelectedProduct(p);
                        // prefill productId and attempt to pick default color/size from product options/variants
                        const opts = getProductOptions(p);
                        const color = (opts.colors && opts.colors.length>0) ? String(opts.colors[0]) : '';
                        const size = (opts.sizes && opts.sizes.length>0) ? String(opts.sizes[0]) : '';
                        setNewReview({...newReview, productId: String(p.id), color: color, size: size});
                      }} className={`p-2 rounded cursor-pointer ${newReview.productId===String(p.id)? 'bg-slate-700 ring-2 ring-yellow-400':'hover:bg-slate-700'}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-white">{p.title || p.name || p.id}</div>
                        {newReview.productId===String(p.id) && <div className="text-xs bg-yellow-400 text-slate-900 px-2 py-0.5 rounded font-semibold">Selected</div>}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Color / Size / Quantity selectors inserted here */}
              {selectedProduct && (
                (() => {
                  const opts = getProductOptions(selectedProduct) as { colors: string[]; sizes: string[] };
                  return (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-sm text-slate-300">Color</label>
                        <select value={newReview.color} onChange={e=>setNewReview({...newReview, color: e.target.value})} className="w-full px-3 py-2 bg-slate-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-inset">
                          <option value="">(Seleccionar color)</option>
                          {opts.colors.map((c:string)=> <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-slate-300">Talla</label>
                        <select value={newReview.size} onChange={e=>setNewReview({...newReview, size: e.target.value})} className="w-full px-3 py-2 bg-slate-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-inset">
                          <option value="">(Seleccionar talla)</option>
                          {opts.sizes.map((s:string)=> <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm text-slate-300">Cantidad</label>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={()=>setNewReview(prev => ({ ...prev, quantity: Math.max(1, (prev.quantity || 1) - 1) }))} className="px-2 py-1 bg-slate-700 rounded text-white">-</button>
                          <input type="number" min={1} value={newReview.quantity} onChange={e=>{
                            const v = Number(e.target.value || 1);
                            setNewReview(prev => ({ ...prev, quantity: Number.isNaN(v) ? 1 : Math.max(1, Math.floor(v)) }));
                          }} className="w-full text-center px-3 py-2 bg-slate-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-inset" />
                          <button type="button" onClick={()=>setNewReview(prev => ({ ...prev, quantity: (prev.quantity || 1) + 1 }))} className="px-2 py-1 bg-slate-700 rounded text-white">+</button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )}

              <input value={newReview.authorName} onChange={e=>{ setNewReview({...newReview, authorName: e.target.value}); setCreateErrors(prev=>({...prev, author: undefined})); }} placeholder="Autor (nombre)" className="px-3 py-2 bg-slate-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-inset" />
              {createErrors.author && <div className="text-sm text-red-400 mt-1">{createErrors.author}</div>}
                {/* Rating and Status: stack on mobile, row on sm+ */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-slate-300">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1,2,3,4,5].map(n => (
                        <button type="button" key={n} onClick={()=>setNewReview({...newReview, rating: n})} className={`px-2 py-1 rounded ${newReview.rating>=n? 'bg-yellow-400 text-slate-900':'bg-slate-700 text-slate-300'}`}>{n}★</button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <label className="text-sm text-slate-300">Estado</label>
                    <div role="tablist" aria-label="Estado reseña" className="inline-flex bg-slate-800 rounded-md p-1">
                      <button
                        type="button"
                        aria-pressed={newReview.status === 'pending'}
                        onClick={() => setNewReview(prev => ({ ...prev, status: 'pending' }))}
                        className={`px-3 py-1 text-sm rounded-l-md font-medium transition-all duration-150 ${newReview.status === 'pending' ? 'bg-yellow-400 text-slate-900 shadow-sm ring-1 ring-yellow-300' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                        Pending
                      </button>
                      <button
                        type="button"
                        aria-pressed={newReview.status === 'published'}
                        onClick={() => setNewReview(prev => ({ ...prev, status: 'published' }))}
                        className={`px-3 py-1 text-sm rounded-r-md font-medium transition-all duration-150 ${newReview.status === 'published' ? 'bg-yellow-400 text-slate-900 shadow-sm ring-1 ring-yellow-300' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                        Published
                      </button>
                    </div>
                  </div>
                </div>

              {/* Title removed (not part of review card). Description instead of body */}
              <label className="text-sm text-slate-300">Descripción</label>
              <textarea value={newReview.description} onChange={e=>{ const val = e.target.value.slice(0, MAX_REVIEW_CHARS); setNewReview({...newReview, description: val}); setCreateErrors(prev=>({...prev, text: undefined})); setDescCount(val.length); }} placeholder="Descripción" maxLength={MAX_REVIEW_CHARS} className="px-3 py-2 bg-slate-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-inset" style={{ minHeight: '60px' }} />
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
                      <div className="flex gap-3 px-1 py-2 overflow-x-auto" style={{ alignItems: 'center' }}>
                        {previews.map((u,i)=> (
                          <div key={i} className={`relative rounded overflow-hidden bg-slate-700 flex-shrink-0 w-[60px] h-[60px] sm:w-[72px] sm:h-[72px]`} draggable data-thumb data-index={String(i)} onDragStart={(e)=>handlePreviewDragStart(i,e)} onDragOver={(e)=>handlePreviewDragOver(i,e)} onDrop={(e)=>handlePreviewDrop(i,e)} onTouchStart={(e)=>handleTouchStart(i,e)} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                            <img src={u} className={`w-full h-full object-cover ${dragOverIndex===i? 'ring-4 ring-yellow-400 ring-inset':''}`} style={{ objectPosition: 'center' }} />
                          <div className="absolute top-1 left-1 bg-yellow-400 text-slate-900 rounded-full w-5 h-5 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-semibold">{i+1}</div>
                          <button type="button" onClick={()=>removeFileAt(i)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 sm:w-5 sm:h-5 text-xs">×</button>
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
              <button type="button" onClick={()=>{setShowCreate(false); setFileList([]); setPreviews([]); setNewReview({ productId: '', rating: 5, description: '', authorName: '', status: 'pending', color: '', size: '', quantity: 1 }); setDescCount(0); setCreateErrors({});}} className="px-3 py-2 bg-slate-700 text-white rounded">Cancelar</button>
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

      {/* Lightbox modal for enlarging review images */}
      {lightboxImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={(e)=>{ if (e.target === e.currentTarget) setLightboxImage(null); }}>
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button onClick={()=>setLightboxImage(null)} className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center z-50">×</button>
            <img src={lightboxImage} alt="preview" className="max-w-full max-h-[90vh] object-contain rounded shadow-lg" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
