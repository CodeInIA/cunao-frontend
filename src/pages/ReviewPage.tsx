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

  useEffect(() => {
    if (!token) return;
    axios.get(`/api/reviews/validate/${token}`).then(res => {
      if (res.data && res.data.valid) {
        setValid(true);
        setOrder(res.data);
        // inicializar productos y agrupar por productId para evitar fetch duplicados
        const lineItems = res.data.lineItems || [];
        lineItems.forEach((li: any) => {
          setSelectedProducts(prev => ({ ...prev, [li.productId]: true }));
          setRatings(prev => ({ ...prev, [li.productId]: 5 }));
        });

        const uniqueProductIds: string[] = Array.from(new Set(lineItems.map((li: any) => String(li.productId))));
        uniqueProductIds.forEach((pid) => {
          // Buscar una línea del pedido que pertenezca a este productId para obtener variantId y otros datos
          const sampleLine = lineItems.find((l: any) => String(l.productId) === pid);
          if (!sampleLine) return;
          axios.get(`/api/products/${pid}`).then(prodRes => {
            const product = prodRes.data && prodRes.data.data ? prodRes.data.data : prodRes.data;
            if (product && product.images) {
              const variantImgs = getVariantImages(product.images, sampleLine.variantId);
              let img: any = null;
              if (variantImgs && variantImgs.length > 0) img = variantImgs[0];
              else img = getMainProductImage(product.images) || null;
              if (img) {
                setProductImages(prev => ({ ...prev, [pid as string]: getOptimizedImageUrl(img) } as any));
              }
            }
          }).catch(() => {});
        });
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

  const handleFileChange = (productId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    setFiles(prev => ({ ...prev, [productId]: selected.slice(0,5) }));
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

  const submit = async () => {
    if (!token) return;
    // doble confirmación
    if (!window.confirm('¿Estás seguro de que quieres publicar estas reseñas?')) return;
    setSubmitting(true);

    // construir payload
    const payload = Object.keys(selectedProducts).filter(pid => selectedProducts[pid]).map(pid => ({
      productId: pid,
      rating: ratings[pid] || 5,
      title: '',
      body: texts[pid] || '',
      authorName: order.customerName || ''
    }));

    const form = new FormData();
    form.append('payload', JSON.stringify(payload));

    // Adjuntar archivos con fieldname product-<productId>
    Object.entries(files).forEach(([pid, fileArr]) => {
      fileArr.forEach((f, idx) => form.append(`product-${pid}`, f));
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
          return (
            <div key={uniqueKey} className="bg-slate-800 p-4 rounded-lg flex gap-4 items-center">
              <div className="w-24 flex-shrink-0">
                {productImages[li.productId] ? (
                  <img src={productImages[li.productId]} alt={li.title} className="w-24 h-24 object-cover rounded" />
                ) : (
                  <div className="w-24 h-24 bg-slate-900 rounded flex items-center justify-center text-slate-500">Sin imagen</div>
                )}
              </div>

              <div className="flex-1">
                <label className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold">{li.title}</div>
                    <div className="text-sm text-slate-400">Cantidad: {li.quantity}</div>
                    <div className="text-sm text-slate-400">Talla: {li.size} — Color: {li.color}</div>
                  </div>
                  <div>
                    <input type="checkbox" checked={!!selectedProducts[li.productId]} onChange={() => toggleProduct(li.productId)} />
                  </div>
                </label>

                {selectedProducts[li.productId] && (
                  <div className="mt-2">
                    <div className="mb-2">Puntuación:</div>
                    <div className="flex items-center gap-2 mb-4">
                      {[1,2,3,4,5].map(n => (
                        <button key={n} className={`px-2 py-1 rounded ${ratings[li.productId]===n ? 'bg-spanish-yellow text-slate-900' : 'bg-slate-700'}`} onClick={() => setRatings(prev => ({ ...prev, [li.productId]: n }))}>{n}★</button>
                      ))}
                    </div>
                    <textarea className="w-full p-2 bg-slate-900 rounded mb-2" placeholder="Escribe tu opinión" value={texts[li.productId]||''} onChange={(e) => setTexts(prev => ({ ...prev, [li.productId]: e.target.value }))} />
                    <div className="mb-2">Fotos (max 5 por producto):</div>
                    <input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(e) => handleFileChange(li.productId, e)} />
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
