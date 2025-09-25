import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReviewCard from './ReviewCard';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

type Props = { productId?: string; maxVisible?: number };

function getVisibleCount(width: number) {
  if (width >= 1200) return 3;
  if (width >= 992) return 3;
  if (width >= 768) return 2;
  return 1; // mobile: show 1
}

const ReviewsCarousel: React.FC<Props> = ({ productId, maxVisible = 3 }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [visible, setVisible] = useState<number>(maxVisible);
  const [index, setIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
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
      const winW = window.innerWidth;
      setVisible(Math.min(getVisibleCount(winW), maxVisible));
      setWindowWidth(winW);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [maxVisible]);

  useEffect(() => setIndex(0), [reviews.length, visible]);

  const effectiveVisible = windowWidth < 768 ? 1 : visible;
  const maxIndex = Math.max(0, reviews.length - effectiveVisible);
  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(maxIndex, i + 1));

  const canPrev = index > 0;
  const canNext = index < maxIndex;

  // Calculate item width and gap. On desktop/tablet we split the container width by visible items.
  // On mobile (showing 1) compute the width as viewport width minus 2x the left offset
  // between the first card and the viewport edge (so the card has equal left/right gutters).
  let itemWidth: number | undefined;
  let itemGap: number | undefined;
  if (effectiveVisible > 0 && containerWidth > 0) {
    if (windowWidth < 768) {
      try {
        // Measure left offset from the container (preferred) because the track may be translated.
        let leftOffset = 0;
        if (containerRef.current) {
          const crect = containerRef.current.getBoundingClientRect();
          const style = window.getComputedStyle(containerRef.current);
          const padLeft = parseFloat(style.paddingLeft || '0');
          leftOffset = crect.left + padLeft;
        } else {
          // fallback: use the first child of the track to measure its left offset relative to viewport
          const firstChild = trackRef.current?.firstElementChild as HTMLElement | null;
          if (firstChild) {
            const rect = firstChild.getBoundingClientRect();
            leftOffset = rect.left;
          }
        }
        const calc = Math.floor(window.innerWidth - 2 * leftOffset);
        // gap between items on mobile should be twice the left offset
        itemGap = Math.floor(2 * leftOffset);
        // sanity fallback to container division
        itemWidth = calc > 0 ? calc : Math.floor(containerWidth / effectiveVisible);
      } catch (e) {
        itemWidth = Math.floor(containerWidth / effectiveVisible);
      }
    } else {
      itemWidth = Math.floor(containerWidth / effectiveVisible);
    }
  }

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
    transform: itemWidth ? `translateX(-${index * (itemWidth + (itemGap || 0))}px)` : `translateX(-${index * (100 / effectiveVisible)}%)`,
    width: itemWidth ? `${itemWidth * reviews.length + (itemGap ? itemGap * (reviews.length - 1) : 0)}px` : `${(reviews.length * 100) / effectiveVisible}%`,
    gap: itemGap ? `${itemGap}px` : undefined,
  };

  if (reviews.length === 0) return null;

  return (
    <>
      <div ref={containerRef} className="relative px-4 sm:px-0">
      {/* arrow offset: outside on desktop, inside on small screens */}
      {windowWidth >= 640 && (() => {
        const arrowOffset = -36;
        return (
          <div className="absolute top-1/2 transform -translate-y-1/2 z-10" style={{ left: arrowOffset }}>
            <button
              onClick={() => { if (canPrev) prev(); }}
              disabled={!canPrev}
              aria-disabled={!canPrev}
              className={`bg-white/10 text-white p-2 rounded-full border border-slate-700 transition-colors duration-150 ${canPrev ? 'hover:bg-white/20' : 'opacity-40 cursor-not-allowed'}`}
            >◀</button>
          </div>
        );
      })()}
      <div className="overflow-hidden">
        <div ref={trackRef} style={trackStyle} className="flex gap-4">
          {reviews.map((r, idx) => (
            <div key={r._id} style={{ width: itemWidth ? `${itemWidth}px` : `${100 / effectiveVisible}%`, flex: '0 0 auto' }} className="px-0 sm:px-2 min-w-0">
              <ReviewCard review={r} onOpen={() => { setModalOpen(true); setActiveCard(idx); setActiveImage(0); }} />
            </div>
          ))}
        </div>
      </div>
      {windowWidth >= 640 && (() => {
        const arrowOffset = -36;
        return (
          <div className="absolute top-1/2 transform -translate-y-1/2 z-10" style={{ right: arrowOffset }}>
            <button
              onClick={() => { if (canNext) next(); }}
              disabled={!canNext}
              aria-disabled={!canNext}
              className={`bg-white/10 text-white p-2 rounded-full border border-slate-700 transition-colors duration-150 ${canNext ? 'hover:bg-white/20' : 'opacity-40 cursor-not-allowed'}`}
            >▶</button>
          </div>
        );
      })()}
      </div>
      {/* mobile bottom controls: prev, dots, next */}
      {windowWidth < 640 && (
        <div className="mt-3 flex items-center justify-center gap-4">
          <button onClick={() => { if (canPrev) prev(); }} disabled={!canPrev} aria-disabled={!canPrev} className={`p-2 rounded-full bg-white/10 text-white ${canPrev ? 'hover:bg-white/20' : 'opacity-40 cursor-not-allowed'}`}>◀</button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.max(1, Math.ceil(reviews.length / effectiveVisible)) }).map((_, p) => {
              const pageIndex = p * effectiveVisible;
              const activePage = Math.floor(index / effectiveVisible);
              return (
                <button key={p} onClick={() => setIndex(pageIndex)} className={`w-2 h-2 rounded-full ${activePage === p ? 'bg-white' : 'bg-white/30'}`} aria-label={`Ir a página ${p+1}`} />
              );
            })}
          </div>
          <button onClick={() => { if (canNext) next(); }} disabled={!canNext} aria-disabled={!canNext} className={`p-2 rounded-full bg-white/10 text-white ${canNext ? 'hover:bg-white/20' : 'opacity-40 cursor-not-allowed'}`}>▶</button>
        </div>
      )}
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
