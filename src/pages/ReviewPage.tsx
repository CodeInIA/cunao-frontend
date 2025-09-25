import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getOptimizedImageUrl, getVariantImages, getMainProductImage } from '../utils/imageUtils';

export const ReviewPage: React.FC = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [valid, setValid] = useState<boolean | null>(null);
  const [order, setOrder] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<Record<string, boolean>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [texts, setTexts] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [textareaActive, setTextareaActive] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!token) return;
    axios.get(`/api/reviews/validate/${token}`).then(res => {
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

  if (valid === false) {
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

  const handleFileChange = (lineKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    setFiles(prev => ({ ...prev, [lineKey]: selected.slice(0,5) }));
  };

  const toggleProduct = (lineKey: string) => {
    setSelectedProducts(prev => ({ ...prev, [lineKey]: !prev[lineKey] }));
  };

  const submit = async () => {
    if (!token) return;
    // doble confirmación
    if (!window.confirm('¿Estás seguro de que quieres publicar estas reseñas?')) return;
    setSubmitting(true);

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
      fileArr.forEach((f, idx) => form.append(`product-${lineKey}`, f));
    });

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

  return (
    <div className="container mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-4">Deja tu reseña</h1>
      <p className="mb-6">Hola <strong>{order.customerName}</strong>, selecciona los productos que quieres valorar y completa la información.</p>

      <div className="grid grid-cols-1 gap-6">
        {(order.lineItems || []).map((li: any, idx: number) => {
          const uniqueKey = `${li.productId}-${li.variantId || 'v'}-${idx}`;
          const lineKey = `${li.productId}-${idx}`;
          return (
            <div key={uniqueKey} className="bg-slate-800 p-4 rounded-lg flex gap-4 items-center">
              <div className="w-32 flex-shrink-0">
                {productImages[lineKey] ? (
                  <img src={productImages[lineKey]} alt={li.title} className="w-32 h-32 object-cover rounded-md" />
                ) : (
                  <div className="w-32 h-32 bg-slate-900 rounded-md flex items-center justify-center text-slate-500">Sin imagen</div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
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
                      className={`w-6 h-6 rounded-sm flex items-center justify-center mr-3 transition-colors ${selectedProducts[lineKey] ? 'bg-yellow-400' : 'bg-white border'}`}
                      title={selectedProducts[lineKey] ? 'Seleccionado' : 'Seleccionar para review'}
                    >
                      {selectedProducts[lineKey] ? (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      ) : null}
                    </button>
                  </div>
                </div>

                {selectedProducts[lineKey] && (
                  <div className="mt-2">
                    <div className="mb-2">Puntuación:</div>
                    <div className="flex items-center gap-2 mb-4">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} className={`px-2 py-1 rounded ${ratings[lineKey]===n ? 'bg-spanish-yellow text-slate-900' : 'bg-slate-700'}`} onClick={() => setRatings(prev => ({ ...prev, [lineKey]: n }))}>{n}★</button>
                      ))}
                    </div>
                    <textarea
                      className={`w-full p-2 bg-slate-900 rounded mb-2 border transition-colors duration-150 ${textareaActive[lineKey] ? 'border-yellow-400' : 'border-transparent'} focus:border-yellow-400 focus:ring-0 outline-none`}
                      placeholder="Escribe tu opinión"
                      value={texts[lineKey]||''}
                      onChange={(e) => setTexts(prev => ({ ...prev, [lineKey]: e.target.value }))}
                      onClick={() => setTextareaActive(prev => ({ ...prev, [lineKey]: true }))}
                      onFocus={() => setTextareaActive(prev => ({ ...prev, [lineKey]: true }))}
                      onBlur={() => setTextareaActive(prev => ({ ...prev, [lineKey]: false }))}
                    />
                    <div className="mb-2">Fotos (max 5 por producto):</div>
                    <div>
                      <label className="inline-flex items-center px-3 py-2 bg-white border rounded cursor-pointer text-sm text-gray-700 hover:bg-gray-50">
                        <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(e) => handleFileChange(lineKey, e)} className="hidden" />
                        Subir imágenes ({(files[lineKey] || []).length})
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-6">
        <button className="bg-spanish-yellow text-slate-900 px-6 py-2 rounded font-bold" onClick={submit} disabled={submitting}>Publicar reseñas</button>
      </div>
    </div>
  );
};

export default ReviewPage;
