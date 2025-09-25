import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReviewCard from './ReviewCard';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type Props = { productId?: string; maxVisible?: number };

function getVisibleCount(width: number) {
  if (width >= 1200) return 3;
  if (width >= 992) return 3;
  if (width >= 768) return 2;
  return 1;
}

const ReviewsCarousel: React.FC<Props> = ({ productId, maxVisible = 3 }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [visible, setVisible] = useState<number>(maxVisible);
  const [index, setIndex] = useState(0);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get('/api/reviews/list' + (productId ? `?productId=${productId}` : ''));
        setReviews(res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    const update = () => {
      const w = containerRef.current ? containerRef.current.clientWidth : window.innerWidth;
      setContainerWidth(w);
      setVisible(Math.min(getVisibleCount(w), maxVisible));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [maxVisible]);

  useEffect(() => setIndex(0), [reviews.length, visible]);

  const maxIndex = Math.max(0, reviews.length - visible);
  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(maxIndex, i + 1));

  const itemWidth = visible > 0 && containerWidth > 0 ? Math.floor(containerWidth / visible) : undefined;

  // modal state for full-screen carousel view
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  const shortenName = (name?: string) => {
    if (!name) return 'Anónimo';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts.slice(1).map(p => p[0]).join('. ')}.`;
  };

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
      if (e.key === 'ArrowRight') {
        // advance image or card
        const imgs = reviews[activeCard]?.photos || [];
        if (activeImage < imgs.length - 1) setActiveImage(i => i + 1);
        else setActiveCard(c => Math.min(reviews.length - 1, c + 1));
      }
      if (e.key === 'ArrowLeft') {
        if (activeImage > 0) setActiveImage(i => i - 1);
        else setActiveCard(c => Math.max(0, c - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, activeCard, activeImage, reviews]);

  // prevent background scroll when modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (modalOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  const trackStyle: React.CSSProperties = {
    display: 'flex',
    transition: 'transform 350ms ease',
    transform: itemWidth ? `translateX(-${index * itemWidth}px)` : `translateX(-${index * (100 / visible)}%)`,
    width: itemWidth ? `${itemWidth * reviews.length}px` : `${(reviews.length * 100) / visible}%`,
  };

  if (reviews.length === 0) return null;

  return (
    <>
      <div ref={containerRef} className="relative">
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
        <button onClick={prev} className="bg-white/10 text-white p-2 rounded-full border border-slate-700">◀</button>
      </div>
      <div className="overflow-hidden">
        <div ref={trackRef} style={trackStyle} className="flex gap-4">
          {reviews.map((r, idx) => (
            <div key={r._id} style={{ width: itemWidth ? `${itemWidth}px` : `${100 / visible}%`, flex: '0 0 auto' }} className="px-2">
              <ReviewCard review={r} onOpen={() => { setModalOpen(true); setActiveCard(idx); setActiveImage(0); }} />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
        <button onClick={next} className="bg-white/10 text-white p-2 rounded-full border border-slate-700">▶</button>
      </div>
      </div>
      {/* modal overlay */}
      {modalOpen && (
      <div onClick={() => setModalOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div onClick={(e) => e.stopPropagation()} className="relative bg-slate-900 rounded-lg p-6 max-w-4xl w-[90%] max-h-[90vh] overflow-hidden">
          <button onClick={() => setModalOpen(false)} className="absolute top-3 right-3 text-slate-200"><X className="w-6 h-6" /></button>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveCard(c => Math.max(0, c - 1))} className="p-2 text-slate-200"><ChevronLeft /></button>
            <div className="flex-1">
              {/* image display */}
              <div className="w-full h-[60vh] bg-black rounded overflow-hidden flex items-center justify-center">
                {reviews[activeCard] && reviews[activeCard].photos && reviews[activeCard].photos.length > 0 ? (
                  <img src={reviews[activeCard].photos[activeImage]} alt="big" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-slate-400">Sin imagen</div>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-slate-200">
                  <div className="font-semibold">{shortenName(reviews[activeCard]?.authorName)}</div>
                  {reviews[activeCard]?.productTitle ? (
                    <a onClick={(e) => e.stopPropagation()} href={reviews[activeCard]?.productSlug ? `/producto/${reviews[activeCard].productSlug}` : `/product/${reviews[activeCard].productId}`} className="text-xs text-slate-400 hover:text-yellow-400 block truncate" title={`Ver ${reviews[activeCard].productTitle}`}>
                      {reviews[activeCard].productTitle}
                    </a>
                  ) : null}
                </div>
                <div className="text-slate-200">{reviews[activeCard]?.rating}★</div>
              </div>
              <div className="mt-2 text-slate-300 max-h-28 overflow-auto">{reviews[activeCard]?.body}</div>
              {/* thumbnails for images of this review */}
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {(reviews[activeCard]?.photos || []).map((p: string, i: number) => (
                  <button key={i} onClick={() => setActiveImage(i)} className={`w-12 h-12 bg-slate-800 rounded flex items-center justify-center overflow-hidden ${i===activeImage ? 'border-2 border-yellow-400' : ''}`}>
                    <img src={p} alt={`thumb-${i}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setActiveCard(c => Math.min(reviews.length - 1, c + 1))} className="p-2 text-slate-200"><ChevronRight /></button>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default ReviewsCarousel;
