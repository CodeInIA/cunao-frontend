import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, X, Edit, Check } from 'lucide-react';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTags, setDraftTags] = useState<Record<string, string[]>>({});
  const dragInfoRef = React.useRef<{ productId: string | null; index: number | null }>({ productId: null, index: null });
  const [highlightedTag, setHighlightedTag] = useState<Record<string, number | null>>({});
  // touch drag state for mobile long-press drag-and-drop
  const longPressTimerRef = React.useRef<number | null>(null);
  const touchStartPosRef = React.useRef<{ x: number; y: number } | null>(null);
  const touchDragRef = React.useRef<{ productId: string | null; fromIndex: number | null; label?: string }>(
    { productId: null, fromIndex: null }
  );
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  // placeholder index while dragging per product
  const [touchPlaceholder, setTouchPlaceholder] = useState<Record<string, number | null>>({});
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);

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
      // clear draft for product
      setDraftTags(d => { const copy = { ...d }; delete copy[productId]; return copy; });
      setEditingId(null);
    } catch (e) {
      console.error(e);
      toast.error('Error al actualizar tags');
    }
  }

  function startEditing(productId: string, currentTags: string[]) {
    setEditingId(productId);
    setDraftTags(d => ({ ...d, [productId]: Array.isArray(currentTags) ? [...currentTags] : [] }));
  }

  function cancelEditing(productId: string) {
    setDraftTags(d => { const copy = { ...d }; delete copy[productId]; return copy; });
    setEditingId(null);
  }

  function addDraftTag(productId: string, tag: string) {
    if (!tag || !tag.trim()) return;
    setDraftTags(d => {
      const cur = Array.isArray(d[productId]) ? [...d[productId]] : [];
      if (cur.includes(tag)) return d;
      const nextArr = [...cur, tag];
      const next = { ...d, [productId]: nextArr };
      // highlight the newly added tag briefly
      setHighlightedTag(h => ({ ...h, [productId]: nextArr.length - 1 }));
      setTimeout(() => {
        setHighlightedTag(h => { const copy = { ...h }; delete copy[productId]; return copy; });
      }, 1200);
      return next;
    });
  }

  function removeDraftTag(productId: string, index: number) {
    setDraftTags(d => {
      const cur = Array.isArray(d[productId]) ? [...d[productId]] : [];
      cur.splice(index, 1);
      return { ...d, [productId]: cur };
    });
  }

  function onDragStart(productId: string, index: number, e: React.DragEvent) {
    dragInfoRef.current = { productId, index };
    try { e.dataTransfer!.setData('text/plain', String(index)); } catch {}
  }

  function onDragOver(e: React.DragEvent) { e.preventDefault(); }

  function onDrop(productId: string, index: number) {
    const info = dragInfoRef.current;
    if (!info.productId || info.productId !== productId || info.index === null) return;
    const from = info.index;
    const to = index;
    if (from === to) return;
    setDraftTags(d => {
      const cur = Array.isArray(d[productId]) ? [...d[productId]] : [];
      const item = cur.splice(from, 1)[0];
      cur.splice(to, 0, item);
      return { ...d, [productId]: cur };
    });
    dragInfoRef.current = { productId: null, index: null };
  }

  // --- Touch handlers for mobile long-press drag ---
  function beginTouchDrag(productId: string, index: number, label: string, clientX: number, clientY: number) {
    touchDragRef.current = { productId, fromIndex: index, label };
    setIsTouchDragging(true);
    setTouchPlaceholder(p => ({ ...p, [productId]: index }));
    setGhostPos({ x: clientX, y: clientY });
    // prevent page scroll while dragging
    try { document.body.style.touchAction = 'none'; } catch {}
  }

  function cancelLongPress() {
    if (longPressTimerRef.current) { window.clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
    touchStartPosRef.current = null;
  }

  function onTouchStartTag(productId: string, index: number, label: string, e: React.TouchEvent) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touchStartPosRef.current = { x: t.clientX, y: t.clientY };
    // start long-press timer (250ms)
    longPressTimerRef.current = window.setTimeout(() => {
      beginTouchDrag(productId, index, label, t.clientX, t.clientY);
      longPressTimerRef.current = null;
    }, 250);
  }

  function onTouchMoveTag(productId: string, e: React.TouchEvent) {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    // if we haven't started dragging yet, cancel if moved too much
    if (!isTouchDragging) {
      const start = touchStartPosRef.current;
      if (!start) return;
      const dx = Math.abs(t.clientX - start.x);
      const dy = Math.abs(t.clientY - start.y);
      if (dx > 10 || dy > 10) {
        // moved too much before long-press -> cancel
        cancelLongPress();
      }
      return;
    }

    // update ghost position
    setGhostPos({ x: t.clientX, y: t.clientY });

    // find element under touch to update placeholder
    const el = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
    if (!el) return;
    const tagEl = el.closest('[data-tag-item]') as HTMLElement | null;
    if (!tagEl) return;
    const pid = tagEl.getAttribute('data-product-id');
    const idx = tagEl.getAttribute('data-index');
    if (!pid || !idx) return;
    if (pid !== productId) return; // only reorder within same product
    const toIndex = parseInt(idx, 10);
    setTouchPlaceholder(p => ({ ...p, [productId]: toIndex }));
    e.preventDefault();
  }

  function finishTouchDrag() {
    const info = touchDragRef.current;
    if (info.productId && info.fromIndex !== null) {
      const pid = info.productId;
      const from = info.fromIndex;
      const to = (touchPlaceholder[pid] ?? from);
      if (from !== to) {
        setDraftTags(d => {
          const cur = Array.isArray(d[pid]) ? [...d[pid]] : [];
          // if tags are not in draft (maybe editing started), fallback to products tags
          let source = cur;
          if (!Array.isArray(d[pid])) {
            const prod = products.find(p => p.id === pid);
            source = Array.isArray(prod?.tags) ? [...prod!.tags] : [];
          }
          const item = source.splice(from, 1)[0];
          source.splice(to, 0, item);
          return { ...d, [pid]: source };
        });
      }
    }
    // cleanup
    touchDragRef.current = { productId: null, fromIndex: null };
    setIsTouchDragging(false);
    setTouchPlaceholder({});
    setGhostPos(null);
    try { document.body.style.touchAction = ''; } catch {}
  }

  function onTouchEndTag() {
    // cancel any pending longpress
    if (longPressTimerRef.current) { window.clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
    if (isTouchDragging) finishTouchDrag();
    touchStartPosRef.current = null;
  }

  useEffect(() => {
    return () => { // cleanup timers on unmount
      if (longPressTimerRef.current) { window.clearTimeout(longPressTimerRef.current); longPressTimerRef.current = null; }
      try { document.body.style.touchAction = ''; } catch {}
    };
  }, []);

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/dashboard')} className="p-2 rounded bg-slate-800 hover:bg-slate-700" aria-label="Volver al dashboard">
            <ArrowLeft className="w-5 h-5 text-slate-200" />
          </button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">Tag Manager</h2>
            <p className="text-slate-400 mt-1">Edita las tags de los productos y sincronízalas con Printify.</p>
          </div>
        </div>

        <div className="w-full md:w-auto md:ml-auto mt-3 md:mt-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="pl-9 pr-3 py-2 rounded bg-slate-800 text-slate-100 w-full md:w-80 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
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
          {filteredProducts.map(prod => {
            const isEditing = editingId === prod.id;
            const currentTags = isEditing ? (draftTags[prod.id] || []) : (Array.isArray(prod.tags) ? prod.tags : []);
            return (
              <div
                key={prod.id}
                className="bg-slate-800 p-4 rounded-md shadow-sm"
                // when editing, prevent vertical scrolling originating from inside this card
                style={{ touchAction: isEditing ? 'none' : undefined }}
                onWheel={(e) => { if (isEditing) { e.stopPropagation(); e.preventDefault(); } }}
                onTouchMove={(e) => { if (isEditing) { e.preventDefault(); } }}
              >
                <div className="flex gap-4 items-center md:items-stretch">
                  <div className="flex-none w-20 h-20 md:w-28 md:h-28 overflow-hidden rounded-md flex items-center justify-center bg-slate-900">
                    <img src={prod.image && (prod.image.cdnUrl || prod.image.src)} alt={prod.title} className="h-full w-auto object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 min-w-0">
                      <h3 className="text-white font-semibold break-words">{prod.title}</h3>
                      <div className="ml-auto text-sm text-slate-400">{Array.isArray(prod.tags) ? prod.tags.length : 0} tags</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  {/* tags display (full width under the header row) */}
                    <div className="flex flex-wrap gap-2">
                      {currentTags.length === 0 && <div className="text-slate-400">Sin tags</div>}
                      {currentTags.map((t: string, idx: number) => {
                        const placeholderIndex = touchPlaceholder[prod.id];
                        const isPlaceholder = isTouchDragging && placeholderIndex === idx;
                        return (
                          <React.Fragment key={t + idx}>
                            {isPlaceholder && (
                              <div className="w-full h-10" aria-hidden />
                            )}
                            <div
                              data-tag-item
                              data-product-id={prod.id}
                              data-index={String(idx)}
                              draggable={isEditing}
                              onDragStart={(e) => onDragStart(prod.id, idx, e)}
                              onDragOver={onDragOver}
                              onDrop={() => onDrop(prod.id, idx)}
                              onTouchStart={isEditing ? ((e) => onTouchStartTag(prod.id, idx, t, e)) : undefined}
                              onTouchMove={isEditing ? ((e) => onTouchMoveTag(prod.id, e)) : undefined}
                              onTouchEnd={isEditing ? onTouchEndTag : undefined}
                              onTouchCancel={isEditing ? onTouchEndTag : undefined}
                              className={`relative flex items-center gap-2 bg-slate-700 text-slate-100 px-3 py-1 rounded-full text-sm ${highlightedTag[prod.id] === idx ? 'ring-2 ring-yellow-400 border-yellow-400' : ''} ${isPlaceholder ? 'opacity-50 scale-95' : ''}`}
                            >
                              {isEditing && (
                                <span className="absolute -top-2 -left-2 bg-yellow-400 text-slate-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center" aria-hidden>
                                  {idx + 1}
                                </span>
                              )}
                              <span className="select-none">{t}</span>
                              {isEditing && (
                                <button className="ml-1 p-1 rounded-full hover:bg-slate-600" onClick={() => removeDraftTag(prod.id, idx)} aria-label={`Eliminar tag ${t}`}>
                                  <X className="w-3 h-3 text-slate-300" />
                                </button>
                              )}
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>
                    {/* ghost floating label for touch drag */}
                    {isTouchDragging && touchDragRef.current.productId === prod.id && ghostPos && touchDragRef.current.label && (
                      <div style={{ position: 'fixed', left: ghostPos.x + 8, top: ghostPos.y + 8, pointerEvents: 'none', zIndex: 60 }}>
                        <div className="px-3 py-1 rounded-full bg-yellow-400 text-slate-900 text-sm font-medium shadow-md">
                          {touchDragRef.current.label}
                        </div>
                      </div>
                    )}

                  {isEditing && (
                    <div className="mt-3 flex items-center gap-2">
                      <input type="text" placeholder="Nueva tag" className="flex-1 min-w-0 bg-slate-900 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400" id={`newtag-${prod.id}`} />
                      <button className="inline-flex items-center gap-2 bg-slate-700 px-3 py-2 rounded" onClick={() => {
                        const el = document.getElementById(`newtag-${prod.id}`) as HTMLInputElement | null;
                        if (!el) return;
                        const v = (el.value || '').trim();
                        if (!v) return;
                        addDraftTag(prod.id, v);
                        el.value = '';
                      }} aria-label="Añadir tag"><Plus className="w-4 h-4" /></button>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-3">
                    {!isEditing ? (
                      <button className="inline-flex items-center gap-2 bg-yellow-400 text-slate-900 px-3 py-1 rounded-md text-sm font-semibold" onClick={() => startEditing(prod.id, prod.tags || [])}><Edit className="w-4 h-4" /> Editar tags</button>
                    ) : (
                      <>
                        <button className="inline-flex items-center gap-2 bg-slate-700 text-slate-100 px-3 py-1 rounded-md text-sm" onClick={() => cancelEditing(prod.id)}>Cancelar</button>
                        <button className="inline-flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded-md text-sm" onClick={() => saveTags(prod.id, draftTags[prod.id] || [])}><Check className="w-4 h-4" /> Guardar cambios</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
