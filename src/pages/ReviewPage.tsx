import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UploadCloud, Trash2 } from 'lucide-react';
import axios from 'axios';
import { getOptimizedImageUrl, getVariantImages, getMainProductImage } from '../utils/imageUtils';

export const ReviewPage: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [valid, setValid] = useState<boolean | null>(null);
  const [tokenUsed, setTokenUsed] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, { file: File; preview: string }[]>>({});
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [textareaActive, setTextareaActive] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, { files?: string; text?: string }>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  // drag state per line for reordering (hooks must be declared unconditionally)
  const [dragIndex, setDragIndex] = useState<Record<string, number | null>>({});
  const [dragOverIndex, setDragOverIndex] = useState<Record<string, number | null>>({});
  // touch timers for long-press detection per line
  const touchTimers = React.useRef<Record<string, number | null>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  const MAX_IMAGES_PER_LINE = 5;
  const MAX_REVIEW_CHARS = 1000;
  const MIN_REVIEW_CHARS = 20;
  useEffect(() => {
    if (!token) return;
    axios.get(`/api/reviews/validate/${token}`).then(res => {
      if (res.data && res.data.tokenUsed) {
        setValid(false);
        setTokenUsed(true);
        setOrder(res.data);
        return;
      }
      if (res.data && res.data.valid) {
        setValid(true);
        setOrder(res.data);
        // inicializar productos y agrupar por línea (cada item seleccionable individualmente)
        const lineItems = res.data.lineItems || [];
        lineItems.forEach((li: any, idx: number) => {
          const lineKey = `${li.productId}-${idx}`;
          setSelectedProducts(prev => ({ ...prev, [lineKey]: true }));
          setRatings(prev => ({ ...prev, [lineKey]: 5 }));
        });

        const uniqueProductIds: string[] = Array.from(new Set(lineItems.map((li: any) => String(li.productId))));

        // Fetch all products concurrently and keep a map
        const productFetches = uniqueProductIds.map(pid =>
          axios.get(`/api/products/${pid}`).then(prodRes => {
            const product = prodRes.data && prodRes.data.data ? prodRes.data.data : prodRes.data;
            return { pid, product };
          }).catch(() => ({ pid, product: null }))
        );

        Promise.all(productFetches).then(results => {
          const productMap: Record<string, any> = {};
          results.forEach(r => { if (r && r.pid) productMap[String(r.pid)] = r.product; });

          // Por cada línea del pedido (incluso si el mismo producto aparece varias veces) resolver la imagen correspondiente
          lineItems.forEach((li: any, idx: number) => {
            const pid = String(li.productId);
            const product = productMap[pid];
            if (!product || !product.images) {
              // eslint-disable-next-line no-console
              console.warn('ReviewPage: product or images missing for pid', pid, product);
              return;
            }

            const tryFindByVariantId = (variantId: number | string | undefined) => {
              if (!variantId) return null;
              const vid = Number(variantId);
              if (Number.isNaN(vid)) return null;
              const imgs = getVariantImages(product.images, vid);
              if (imgs && imgs.length > 0) return imgs[0];
              return null;
            };

            let chosenImage: any = tryFindByVariantId(li.variantId);

            if (!chosenImage) {
              const colorTitle = li.color || li.colorName || li.variantColor || '';
              const sizeTitle = li.size || li.sizeName || li.variantSize || '';
              const normalize = (s: any) => (s || '').toString().trim().toLowerCase();

              // Intento A: buscar variante por title "Color / Size"
              if (Array.isArray(product.variants) && colorTitle && sizeTitle) {
                const candidateTitle = `${colorTitle} / ${sizeTitle}`;
                const foundByTitle = product.variants.find((v: any) => normalize(v.title) === normalize(candidateTitle));
                if (foundByTitle) {
                  const imgs = getVariantImages(product.images, foundByTitle.id);
                  if (imgs && imgs.length > 0) chosenImage = imgs[0];
                  else {
                    const variantObjectId = foundByTitle._id ? (foundByTitle._id.$oid || foundByTitle._id) : null;
                    if (variantObjectId) {
                      const byImageOid = product.images.find((im: any) => {
                        const imOid = im._id && (im._id.$oid || im._id);
                        return imOid && imOid === variantObjectId;
                      });
                      if (byImageOid) chosenImage = byImageOid;
                    }
                  }
                }
              }

              // Intento B: fallback por option ids
              if (!chosenImage) {
                let colorId: number | null = null;
                let sizeId: number | null = null;
                if (Array.isArray(product.options)) {
                  for (const opt of product.options) {
                    const optType = (opt.type || opt.name || '').toString().toLowerCase();
                    if (optType.includes('color')) {
                      const found = (opt.values || []).find((v: any) => normalize(v.title) === normalize(colorTitle));
                      if (found) colorId = found.id;
                    }
                    if (optType.includes('size')) {
                      const found = (opt.values || []).find((v: any) => normalize(v.title) === normalize(sizeTitle));
                      if (found) sizeId = found.id;
                    }
                  }
                }

                if (colorId != null && sizeId != null && Array.isArray(product.variants)) {
                  const foundVariant = product.variants.find((v: any) => Array.isArray(v.options) && v.options.includes(colorId) && v.options.includes(sizeId));
                  if (foundVariant) {
                    const imgs = getVariantImages(product.images, foundVariant.id);
                    if (imgs && imgs.length > 0) chosenImage = imgs[0];
                    else {
                      const variantObjectId = foundVariant._id ? (foundVariant._id.$oid || foundVariant._id) : null;
                      if (variantObjectId) {
                        const byImageOid = product.images.find((im: any) => {
                          const imOid = im._id && (im._id.$oid || im._id);
                          return imOid && imOid === variantObjectId;
                        });
                        if (byImageOid) chosenImage = byImageOid;
                      }
                    }
                  }
                }
              }
            }

            if (!chosenImage) chosenImage = getMainProductImage(product.images) || null;

            // Debug: log chosenImage y contexto
            // eslint-disable-next-line no-console
            console.debug('ReviewPage: resolved image', { pid, idx, chosenImage });

            // Guardar imagen por línea del pedido (clave única)
            const lineKey = `${pid}-${idx}`;
            if (chosenImage) {
              try {
                setProductImages(prev => ({ ...prev, [lineKey]: getOptimizedImageUrl(chosenImage) } as any));
              } catch (e) {
                // eslint-disable-next-line no-console
                console.error('ReviewPage: error optimizing image for', lineKey, e, chosenImage);
              }
            }
          });
        }).catch(() => {});
      } else {
        setValid(false);
      }
    }).catch(() => setValid(false));
  }, [token]);

  // cleanup on unmount (always declared to keep hooks order stable)
  React.useEffect(() => {
    return () => {
      Object.values(files).flat().forEach(a => { try { URL.revokeObjectURL(a.preview); } catch (e) {} });
      // clear any pending touch timers
      Object.values(touchTimers.current || {}).forEach(t => { try { if (t) clearTimeout(t); } catch (e) {} });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // drag state per line for reordering (moved hooks to top)

  const handleDragStart = (lineKey: string, idx: number, e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', String(idx)); } catch (err) {}
    setDragIndex(prev => ({ ...prev, [lineKey]: idx }));
  };

  const handleDragOverThumb = (lineKey: string, idx: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(prev => ({ ...prev, [lineKey]: idx }));
  };

  const handleDropThumb = (lineKey: string, idx: number, e: React.DragEvent) => {
    e.preventDefault();
    const srcIdxStr = e.dataTransfer.getData('text/plain');
    const srcIdx = srcIdxStr ? Number(srcIdxStr) : dragIndex[lineKey];
    if (srcIdx == null || Number.isNaN(srcIdx)) {
      setDragIndex(prev => ({ ...prev, [lineKey]: null }));
      setDragOverIndex(prev => ({ ...prev, [lineKey]: null }));
      return;
    }
    if (srcIdx === idx) {
      setDragIndex(prev => ({ ...prev, [lineKey]: null }));
      setDragOverIndex(prev => ({ ...prev, [lineKey]: null }));
      return;
    }
    setFiles(prev => {
      const arr = (prev[lineKey] || []).slice();
      if (!arr[srcIdx]) return prev;
      const [moved] = arr.splice(srcIdx, 1);
      // insert before idx (if dropping on later index and removing earlier, adjust target)
      const target = srcIdx < idx ? idx : idx;
      arr.splice(target, 0, moved);
      return { ...prev, [lineKey]: arr };
    });
    setDragIndex(prev => ({ ...prev, [lineKey]: null }));
    setDragOverIndex(prev => ({ ...prev, [lineKey]: null }));
  };

  // Touch handlers: long-press to begin drag on mobile
  const handleTouchStart = (lineKey: string, idx: number, e: React.TouchEvent) => {
    // start a long-press timer (350ms) to enter drag mode
    if (touchTimers.current[lineKey]) clearTimeout(touchTimers.current[lineKey] as number);
    touchTimers.current[lineKey] = window.setTimeout(() => {
      setDragIndex(prev => ({ ...prev, [lineKey]: idx }));
      setDragOverIndex(prev => ({ ...prev, [lineKey]: idx }));
    }, 350) as unknown as number;
  };

  const handleTouchMove = (lineKey: string, e: React.TouchEvent) => {
    // if not dragging by touch, ignore
    if (!dragIndex[lineKey] && dragIndex[lineKey] !== 0) return;
    const t = e.touches && e.touches[0];
    if (!t) return;
    const el = document.elementFromPoint(t.clientX, t.clientY) as HTMLElement | null;
    if (!el) return;
    const thumb = el.closest('[data-thumb]') as HTMLElement | null;
    if (!thumb) return;
    const targetLine = thumb.getAttribute('data-line');
    const targetIdxStr = thumb.getAttribute('data-index');
    if (!targetLine || targetLine !== lineKey || !targetIdxStr) return;
    const targetIdx = Number(targetIdxStr);
    if (!Number.isNaN(targetIdx)) setDragOverIndex(prev => ({ ...prev, [lineKey]: targetIdx }));
  };

  const handleTouchEnd = (lineKey: string, e: React.TouchEvent) => {
    // cancel pending timer if user didn't long-press
    if (touchTimers.current[lineKey]) {
      clearTimeout(touchTimers.current[lineKey] as number);
      touchTimers.current[lineKey] = null;
    }
    const srcIdx = dragIndex[lineKey];
    const tgtIdx = dragOverIndex[lineKey];
    if (srcIdx == null || tgtIdx == null) {
      setDragIndex(prev => ({ ...prev, [lineKey]: null }));
      setDragOverIndex(prev => ({ ...prev, [lineKey]: null }));
      return;
    }
    if (srcIdx !== tgtIdx) {
      setFiles(prev => {
        const arr = (prev[lineKey] || []).slice();
        if (!arr[srcIdx]) return prev;
        const [moved] = arr.splice(srcIdx, 1);
        const target = srcIdx < tgtIdx ? tgtIdx : tgtIdx;
        arr.splice(target, 0, moved);
        return { ...prev, [lineKey]: arr };
      });
    }
    setDragIndex(prev => ({ ...prev, [lineKey]: null }));
    setDragOverIndex(prev => ({ ...prev, [lineKey]: null }));
  };

  if (valid === false) {
    if (tokenUsed) {
      return (
        <div className="container mx-auto p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Gracias — tus reseñas están en revisión</h2>
          <p>Hemos recibido tus reseñas y están siendo revisadas por nuestro equipo. No es necesario enviar nada más.</p>
        </div>
      );
    }
    return (
      <div className="container mx-auto p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Token inválido o expirado</h2>
        <p>Lo sentimos, no podemos encontrar una reseña asociada a este enlace.</p>
      </div>
    );
  }

  if (valid === null) {
    return <div className="p-8 text-white">Comprobando token...</div>;
  }

  const addFiles = (lineKey: string, newFiles: File[]) => {
    setFiles(prev => {
      const existing = prev[lineKey] || [];
      const allowed = Math.max(0, MAX_IMAGES_PER_LINE - existing.length);
      if (allowed <= 0) {
        // set error: no more allowed
        setErrors(errPrev => ({ ...errPrev, [lineKey]: { ...(errPrev[lineKey]||{}), files: `Sólo se permiten ${MAX_IMAGES_PER_LINE} imágenes por producto.` } }));
        return prev;
      }
      const toAdd = newFiles.slice(0, allowed);
      const mapped = toAdd.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
      const combined = existing.concat(mapped);
      // if attempted to add more than allowed, set an error message
      if (newFiles.length > allowed) {
        setErrors(errPrev => ({ ...errPrev, [lineKey]: { ...(errPrev[lineKey]||{}), files: `Has intentado añadir ${newFiles.length} archivos, pero sólo se permiten ${MAX_IMAGES_PER_LINE}.` } }));
      } else {
        // clear files error
        setErrors(errPrev => {
          const copy = { ...(errPrev || {}) };
          if (copy[lineKey]) { copy[lineKey] = { ...copy[lineKey], files: undefined }; }
          return copy;
        });
      }
      return { ...prev, [lineKey]: combined };
    });
  };

  const handleFileChange = (lineKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    if (selected.length === 0) return;
    addFiles(lineKey, selected);
  };

  const handleDrop = (lineKey: string, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dtFiles = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith('image/'));
    if (dtFiles.length === 0) return;
    addFiles(lineKey, dtFiles);
  };

  const removeFile = (lineKey: string, idx: number) => {
    setFiles(prev => {
      const arr = prev[lineKey] || [];
      if (!arr[idx]) return prev;
      // revoke object url
      try { URL.revokeObjectURL(arr[idx].preview); } catch (e) {}
      const next = arr.slice(0, idx).concat(arr.slice(idx+1));
      // clear files error if now under limit
      setErrors(errPrev => {
        const copy = { ...(errPrev || {}) };
        if (copy[lineKey] && copy[lineKey].files) copy[lineKey] = { ...copy[lineKey], files: undefined };
        return copy;
      });
      return { ...prev, [lineKey]: next };
    });
  };

  const clearFiles = (lineKey: string) => {
    setFiles(prev => {
      const arr = prev[lineKey] || [];
      arr.forEach(a => { try { URL.revokeObjectURL(a.preview); } catch (e) {} });
      const next = { ...prev };
      next[lineKey] = [];
      // clear files error
      setErrors(errPrev => {
        const copy = { ...(errPrev || {}) };
        if (copy[lineKey]) copy[lineKey] = { ...copy[lineKey], files: undefined };
        return copy;
      });
      return next;
    });
  };



  const toggleProduct = (lineKey: string) => {
    setSelectedProducts(prev => ({ ...prev, [lineKey]: !prev[lineKey] }));
  };

  const submit = async () => {
    if (!token) return;
    // validar antes de enviar: texto y número de imágenes
    const selectedKeys = Object.keys(selectedProducts).filter(k => selectedProducts[k]);
    let hasValidationError = false;
    const newErrors: Record<string, { files?: string; text?: string }> = {};
    selectedKeys.forEach(lineKey => {
      const txt = texts[lineKey] || '';
      if (txt.length > MAX_REVIEW_CHARS) {
        hasValidationError = true;
        newErrors[lineKey] = { ...(newErrors[lineKey] || {}), text: `Máximo ${MAX_REVIEW_CHARS} caracteres.` };
      }
      // mínimo de caracteres
      if ((txt || '').trim().length < MIN_REVIEW_CHARS) {
        hasValidationError = true;
        newErrors[lineKey] = { ...(newErrors[lineKey] || {}), text: `Por favor escribe al menos ${MIN_REVIEW_CHARS} caracteres.` };
      }
      const filesCount = (files[lineKey] || []).length;
      if (filesCount > MAX_IMAGES_PER_LINE) {
        hasValidationError = true;
        newErrors[lineKey] = { ...(newErrors[lineKey] || {}), files: `Sólo se permiten ${MAX_IMAGES_PER_LINE} imágenes por producto.` };
      }
      // no se exige número mínimo de imágenes (opcional)
    });
    if (hasValidationError) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      alert('Hay errores en las reseñas (texto o número de imágenes). Corrígelos antes de enviar.');
      return;
    }

  // show confirmation modal instead of native confirm
    setShowConfirm(true);
    return;

    // construir payload
    // payload por línea (lineKey tiene productId-idx)
    const payload = Object.keys(selectedProducts).filter(key => selectedProducts[key]).map(lineKey => {
      // extraer productId desde lineKey
      const [productId] = lineKey.split('-');
      return {
        productId,
        rating: ratings[lineKey] || 5,
        title: '',
        body: texts[lineKey] || '',
        authorName: order.customerName || ''
      };
    });

    const form = new FormData();
    form.append('payload', JSON.stringify(payload));

    // Adjuntar archivos con fieldname product-<lineKey>
    Object.entries(files).forEach(([lineKey, fileArr]) => {
      fileArr.forEach((obj) => form.append(`product-${lineKey}`, obj.file));
    });

    // final sanity-check on payload bodies
    for (const p of payload) {
      if ((p.body || '').length > MAX_REVIEW_CHARS) {
        alert('Hay reseñas que exceden el límite de caracteres. Corrige antes de enviar.');
        setSubmitting(false);
        return;
      }
    }

    try {
      const res = await axios.post(`/api/reviews/submit/${token}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data && res.data.success) {
        alert('Gracias, tu reseña está en revisión.');
        navigate('/');
      } else {
        alert('Error al enviar reseñas');
      }
    } catch (e) {
      console.error(e);
      alert('Error al enviar reseñas');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishClick = () => {
    setSubmitError(null);
    const selectedKeys = Object.keys(selectedProducts).filter(k => selectedProducts[k]);
    if (selectedKeys.length === 0) {
      setSubmitError('Selecciona al menos un producto para publicar.');
      return;
    }
    const newErrors: Record<string, { files?: string; text?: string }> = {};
    let firstErrorLine: string | null = null;
    selectedKeys.forEach(lineKey => {
      const txt = (texts[lineKey] || '').trim();
      const filesCount = (files[lineKey] || []).length;
      if (txt.length < MIN_REVIEW_CHARS) {
        newErrors[lineKey] = { ...(newErrors[lineKey]||{}), text: `Por favor escribe al menos ${MIN_REVIEW_CHARS} caracteres.` };
        if (!firstErrorLine) firstErrorLine = lineKey;
      }
      if (filesCount > MAX_IMAGES_PER_LINE) {
        newErrors[lineKey] = { ...(newErrors[lineKey]||{}), files: `Sólo se permiten ${MAX_IMAGES_PER_LINE} imágenes por producto.` };
        if (!firstErrorLine) firstErrorLine = lineKey;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...newErrors }));
      setSubmitError('Corrige los errores marcados en rojo antes de publicar.');
      // scroll to first error textarea
      if (firstErrorLine) {
        const el = document.getElementById(`textarea-${firstErrorLine}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // no validation errors -> proceed
    // show modal confirmation before calling submit
    setShowConfirm(true);
  };

  // confirmation and submission state (moved hooks to top)

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    try {
      const tokenLocal = token;
      if (!tokenLocal) return;
      // build payload (same as submit)
      const payload = Object.keys(selectedProducts).filter(key => selectedProducts[key]).map(lineKey => {
        const [productId] = lineKey.split('-');
        return {
          productId,
          rating: ratings[lineKey] || 5,
          title: '',
          body: texts[lineKey] || '',
          authorName: order.customerName || ''
        };
      });

      const form = new FormData();
      form.append('payload', JSON.stringify(payload));
      Object.entries(files).forEach(([lineKey, fileArr]) => {
        fileArr.forEach((obj) => form.append(`product-${lineKey}`, obj.file));
      });

      const res = await axios.post(`/api/reviews/submit/${tokenLocal}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.data && res.data.success) {
        // mark token used locally and show only the "en revisión" message
        setTokenUsed(true);
        setValid(false);
        // clear local inputs to avoid showing form data
        setFiles({});
        setSelectedProducts({});
        setTexts({});
        setRatings({});
      } else {
        // if server returns validationErrors, show them
        if (res.data && res.data.validationErrors) {
          setErrors(prev => ({ ...prev, ...res.data.validationErrors }));
        }
        alert('Error al enviar reseñas');
      }
    } catch (e: any) {
      if (e.response && e.response.data && e.response.data.validationErrors) {
        setErrors(prev => ({ ...prev, ...e.response.data.validationErrors }));
      } else {
        console.error(e);
        alert('Error al enviar reseñas');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // determine if there are active errors to disable submit
  const hasErrors = Object.keys(selectedProducts).some(key => {
    if (!selectedProducts[key]) return false;
    const txtErr = errors[key]?.text;
    const fileErr = errors[key]?.files;
    const txtLen = (texts[key] || '').length;
    const fileCount = (files[key] || []).length;
    return !!txtErr || !!fileErr || txtLen > MAX_REVIEW_CHARS || fileCount > MAX_IMAGES_PER_LINE || txtLen < MIN_REVIEW_CHARS;
  });

  const selectedCount = Object.keys(selectedProducts).filter(k => selectedProducts[k]).length;

  return (
    <div className="container mx-auto p-4 sm:p-8 text-white max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Deja tu reseña cuñao</h1>
      <p className="mb-6">Hola <strong>{order.customerName}</strong>, selecciona los productos que quieres valorar y completa la información.</p>

      <div className="grid grid-cols-1 gap-6">
        {(order.lineItems || []).map((li: any, idx: number) => {
          const uniqueKey = `${li.productId}-${li.variantId || 'v'}-${idx}`;
          const lineKey = `${li.productId}-${idx}`;
          return (
            <div key={uniqueKey} className="bg-slate-800 p-4 rounded-lg flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-full sm:w-32 flex-shrink-0">
                  {productImages[lineKey] ? (
                    <img src={productImages[lineKey]} alt={li.title} className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-md mx-auto sm:mx-0" />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-slate-900 rounded-md flex items-center justify-center text-slate-500 mx-auto sm:mx-0">Sin imagen</div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
                  <div>
                    <div className="font-semibold">{li.title}</div>
                    <div className="text-sm text-slate-400">Cantidad: {li.quantity}</div>
                    <div className="text-sm text-slate-400">Talla: {li.size} — Color: {li.color}</div>
                  </div>
                    <div>
                    <button
                      type="button"
                      onClick={() => toggleProduct(lineKey)}
                      aria-pressed={!!selectedProducts[lineKey]}
                      className={`w-6 h-6 rounded-sm flex items-center justify-center mr-3 transition-colors ${selectedProducts[lineKey] ? 'bg-yellow-400 ring-1 ring-slate-800 shadow-sm' : 'bg-white border'}`}
                      title={selectedProducts[lineKey] ? 'Seleccionado' : 'Seleccionar para review'}
                      aria-label={selectedProducts[lineKey] ? 'Seleccionado' : 'Seleccionar para review'}
                    >
                      {selectedProducts[lineKey] ? (
                        <svg className="w-4 h-4 text-slate-900" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ) : null}
                    </button>
                  </div>
                </div>

                {selectedProducts[lineKey] && (
                  <div className="mt-2">
                    <div className="mb-2">Puntuación:</div>
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} className={`px-2 py-1 rounded ${ratings[lineKey]===n ? 'bg-spanish-yellow text-slate-900' : 'bg-slate-700'}`} onClick={() => setRatings(prev => ({ ...prev, [lineKey]: n }))}>{n}★</button>
                      ))}
                    </div>
                    <textarea
                      id={`textarea-${lineKey}`}
                      className={`w-full p-2 bg-slate-900 rounded mb-2 border transition-colors duration-150 scrollbar-spanish ${textareaActive[lineKey] ? 'border-yellow-400' : 'border-transparent'} focus:border-yellow-400 focus:ring-0 outline-none min-h-[80px] sm:min-h-[120px]`}
                      placeholder="Escribe tu opinión"
                      value={texts[lineKey]||''}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v.length > MAX_REVIEW_CHARS) {
                          setErrors(prev => ({ ...prev, [lineKey]: { ...(prev[lineKey]||{}), text: `Máximo ${MAX_REVIEW_CHARS} caracteres.` } }));
                          setTexts(prev => ({ ...prev, [lineKey]: v.slice(0, MAX_REVIEW_CHARS) }));
                        } else {
                          setErrors(prev => ({ ...prev, [lineKey]: { ...(prev[lineKey]||{}), text: undefined } }));
                          setTexts(prev => ({ ...prev, [lineKey]: v }));
                        }
                      }}
                      onClick={() => setTextareaActive(prev => ({ ...prev, [lineKey]: true }))}
                      onFocus={() => setTextareaActive(prev => ({ ...prev, [lineKey]: true }))}
                      onBlur={() => setTextareaActive(prev => ({ ...prev, [lineKey]: false }))}
                    />
                    <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                      <div className="text-xs">
                        {errors[lineKey]?.text ? (
                          <span className="text-red-400">{errors[lineKey]?.text}</span>
                        ) : (
                          <span className="text-slate-400">Mínimo {MIN_REVIEW_CHARS} caracteres</span>
                        )}
                      </div>
                      <div className="text-xs">{(texts[lineKey] || '').length}/{MAX_REVIEW_CHARS}</div>
                    </div>
                    <div className="mb-2 flex items-center justify-between">
                      <div>Fotos (max 5 por producto):</div>
                      {(files[lineKey] || []).length > 0 ? (
                        <button type="button" onClick={() => clearFiles(lineKey)} className="text-slate-400 hover:text-red-400" title="Borrar todas">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      ) : null}
                    </div>

                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(lineKey, e)}
                      onClick={(e) => { /* click handled by invisible input */ }}
                      className="relative border-dashed border-2 border-slate-700 rounded p-3 mb-2 flex items-center gap-4 cursor-pointer min-h-[64px]"
                    >
                      {/* full-size invisible input to make whole area clickable */}
                      <input id={`file-input-${lineKey}`} type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(e) => handleFileChange(lineKey, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="flex-1 text-slate-400 flex items-center justify-center sm:justify-start">
                        <UploadCloud className="w-6 h-6 mr-3 text-slate-400" />
                        <span>Arrastra imágenes aquí o pulsa para seleccionar</span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap scrollbar-spanish items-center">
                      {(() => {
                        const base = (files[lineKey] || []).slice();
                        const src = dragIndex[lineKey];
                        const over = dragOverIndex[lineKey];
                        let display = base;
                        if (typeof src === 'number' && src >= 0 && typeof over === 'number' && over >= 0 && src !== over) {
                          display = base.slice();
                          const [m] = display.splice(src, 1);
                          display.splice(over, 0, m);
                        }
                        return display.map((fObj, displayIdx) => {
                          const origIdx = (files[lineKey] || []).findIndex(x => x.preview === fObj.preview);
                          const isOver = (dragOverIndex[lineKey] === origIdx) || (typeof dragIndex[lineKey] === 'number' && typeof dragOverIndex[lineKey] === 'number' && dragIndex[lineKey] < dragOverIndex[lineKey] && displayIdx === dragOverIndex[lineKey]);
                          return (
                            <div
                              key={fObj.preview}
                              data-thumb
                              data-line={lineKey}
                              data-index={String(displayIdx)}
                              draggable
                              onDragStart={(e) => handleDragStart(lineKey, origIdx, e)}
                              onDragOver={(e) => handleDragOverThumb(lineKey, displayIdx, e)}
                              onDrop={(e) => handleDropThumb(lineKey, displayIdx, e)}
                              onTouchStart={(e) => handleTouchStart(lineKey, origIdx, e)}
                              onTouchMove={(e) => handleTouchMove(lineKey, e)}
                              onTouchEnd={(e) => handleTouchEnd(lineKey, e)}
                              onTouchCancel={(e) => handleTouchEnd(lineKey, e)}
                              className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 rounded overflow-hidden border ${isOver ? 'ring-2 ring-yellow-400' : ''} transition-all`}
                            >
                              {/* numbered badge top-left */}
                              <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">{displayIdx+1}</div>
                              <img src={fObj.preview} className="w-full h-full object-cover" alt={`preview-${displayIdx}`} />
                              <button type="button" onClick={() => removeFile(lineKey, origIdx)} className="absolute top-0 right-0 m-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white">
                                ×
                              </button>
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div className="mt-1 text-xs text-red-400">{errors[lineKey]?.files || ''}</div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-6">
        {submitError ? <div className="text-red-400 mb-2">{submitError}</div> : null}
        <button
          type="button"
          onClick={() => {
            // handle click even if visually disabled
            handlePublishClick();
          }}
          aria-disabled={submitting || hasErrors || selectedCount === 0}
          className={`px-6 py-2 rounded font-bold ${(!hasErrors && !submitting && selectedCount > 0) ? 'bg-spanish-yellow text-slate-900' : 'bg-slate-600 text-slate-400 cursor-not-allowed'}`}
        >
          {selectedCount === 1 ? 'Publicar reseña' : 'Publicar reseñas'}
        </button>
      </div>
      {/* tokenUsed/validate path shows the pending message instead */}

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-800 rounded-lg w-11/12 max-w-md p-5 text-slate-100">
            <h2 className="text-xl font-bold mb-2">{selectedCount === 1 ? 'Publicar reseña' : 'Publicar reseñas'}</h2>
            <p className="text-slate-300 mb-4">{selectedCount === 1 ? '¿Estás seguro de que quieres publicar esta reseña?' : `¿Estás seguro de que quieres publicar estas ${selectedCount} reseñas?`}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 rounded bg-slate-700 text-slate-200">Cancelar</button>
              <button onClick={() => confirmSubmit()} className="px-4 py-2 rounded bg-spanish-yellow text-slate-900 font-bold">{selectedCount === 1 ? 'Publicar reseña' : 'Publicar reseñas'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;
