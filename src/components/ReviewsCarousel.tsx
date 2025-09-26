import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReviewCard from './ReviewCard';
import { ChevronLeft, ChevronRight, X, Star } from 'lucide-react';

type Props = { productId?: string; maxVisible?: number };

function getVisibleCount(width: number) {
  // breakpoints: mobile <640:1, 640-767:2, 768-991:3, 992-1199:4, >=1200:6
  if (width >= 1200) return 6;
  if (width >= 992) return 4;
  if (width >= 768) return 3;
  if (width >= 640) return 2;
  return 1; // mobile: show 1
}

const ReviewsCarousel: React.FC<Props> = ({ productId, maxVisible = 6 }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [visible, setVisible] = useState<number>(maxVisible);
  const [index, setIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  // arrow offsets (relative to container) and overlap amount (pixels) to shrink cards if needed
  const [arrowOffsetLeft, setArrowOffsetLeft] = useState<number>(-36);
  const [arrowOffsetRight, setArrowOffsetRight] = useState<number>(-36);
  const [arrowOverlap, setArrowOverlap] = useState<number>(0);

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

      // compute responsive distance from viewport edges for arrow buttons
      const btnSize = 40; // button width/height in px
      const distanceFromEdge = winW >= 1200 ? 72 : winW >= 992 ? 56 : winW >= 768 ? 44 : winW >= 640 ? 32 : 12;

      if (containerRef.current) {
        const crect = containerRef.current.getBoundingClientRect();
        // left offset relative to container coordinates
        const leftOffsetRel = distanceFromEdge - crect.left;
        setArrowOffsetLeft(leftOffsetRel);
        // right offset relative to container coordinates (distance from viewport right edge)
        const containerRight = crect.left + w;
        const rightGapFromViewport = winW - containerRight; // space between container right and viewport right
        const rightOffsetRel = distanceFromEdge - rightGapFromViewport;
        setArrowOffsetRight(rightOffsetRel);

        // calculate overlap of arrow buttons with container area
        const leftArrowRight = distanceFromEdge + btnSize; // px from viewport left
        const leftOverlap = Math.max(0, leftArrowRight - crect.left + 8); // keep 8px minimum gap

        const rightArrowLeft = winW - distanceFromEdge - btnSize; // px from viewport left
        const rightOverlap = Math.max(0, containerRight - rightArrowLeft + 8);

        setArrowOverlap(Math.max(0, leftOverlap) + Math.max(0, rightOverlap));
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [maxVisible]);

  useEffect(() => setIndex(0), [reviews.length, visible]);

  // Ensure layout recalculation (centering) after reviews are loaded or when
  // the container size changes (images/fonts may change layout after first paint).
  // Some browsers/layouts require an extra paint before measurements stabilize,
  // so we trigger a synthetic "resize" after a rAF and a short timeout.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const trigger = () => window.requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    const t = window.setTimeout(trigger, 50);
    return () => clearTimeout(t);
  }, [reviews.length]);

  // Observe container size changes and trigger the same recalculation. This
  // covers cases where images load after mount and change the layout.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof (window as any).ResizeObserver === 'undefined') return;
    const ro = new (window as any).ResizeObserver(() => {
      window.requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // treat widths < 640 as mobile (1 card); from 640px show at least 2 cards
  const effectiveVisible = windowWidth < 640 ? 1 : visible;
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
    // treat widths < 640 as mobile; >=640 use multi-card layout
    if (windowWidth < 640) {
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
      // For non-mobile sizes (>=640) include a smaller gap between cards
      // Use progressively larger gaps on very large screens, but reduce gap starting at 640px
      itemGap = itemGap ?? (windowWidth >= 1200 ? 12 : windowWidth >= 992 ? 10 : 6);
      const totalGaps = itemGap * Math.max(0, effectiveVisible - 1);
      // subtract arrow overlap so cards shrink if arrows would overlap
      const available = Math.max(0, containerWidth - arrowOverlap);
      itemWidth = Math.floor((available - totalGaps) / effectiveVisible);
    }
  }

  // modal state for full-screen carousel view
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCard, setActiveCard] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  // modal navigation availability (defined after activeCard)
  const canPrevModal = activeCard > 0;
  const canNextModal = activeCard < Math.max(0, reviews.length - 1);
  // touch/swipe refs for carousel and modal
  const carouselTouchStartX = React.useRef<number | null>(null);
  const carouselTouchDeltaX = React.useRef<number>(0);
  const modalTouchStartX = React.useRef<number | null>(null);
  const modalTouchDeltaX = React.useRef<number>(0);
  // dragging state for smooth drag effect on carousel
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0); // px
  const dragPointerDown = React.useRef<boolean>(false);

  // animated card/image transitions in modal
  const [contentVisible, setContentVisible] = useState(true);
  const [imageVisible, setImageVisible] = useState(true);

  // --- Carousel touch handlers (to swipe pages of cards) ---
  const onTrackTouchStart = (e: React.TouchEvent) => {
    const t = e.touches && e.touches[0];
    if (!t) return;
    carouselTouchStartX.current = t.clientX;
    carouselTouchDeltaX.current = 0;
    dragPointerDown.current = true;
    setIsDragging(true);
  };

  const onTrackTouchMove = (e: React.TouchEvent) => {
    const t = e.touches && e.touches[0];
    if (!t || carouselTouchStartX.current == null) return;
    const delta = t.clientX - carouselTouchStartX.current;
    carouselTouchDeltaX.current = delta;
    // update live drag offset
    setDragOffset(delta);
  };

  const onTrackTouchEnd = () => {
    const delta = carouselTouchDeltaX.current || 0;
    const threshold = 40; // px
    if (delta > threshold) prev();
    else if (delta < -threshold) next();
    // reset drag
    carouselTouchStartX.current = null;
    carouselTouchDeltaX.current = 0;
    dragPointerDown.current = false;
    // animate dragOffset back to 0 by clearing dragging state after a tick
    setDragOffset(0);
    setIsDragging(false);
  };

  // --- Modal touch handlers (to change activeCard by swiping) ---
  const onModalTouchStart = (e: React.TouchEvent) => {
    const t = e.touches && e.touches[0];
    if (!t) return;
    modalTouchStartX.current = t.clientX;
    modalTouchDeltaX.current = 0;
  };

  const onModalTouchMove = (e: React.TouchEvent) => {
    const t = e.touches && e.touches[0];
    if (!t || modalTouchStartX.current == null) return;
    modalTouchDeltaX.current = t.clientX - modalTouchStartX.current;
  };

  const onModalTouchEnd = () => {
    const delta = modalTouchDeltaX.current || 0;
    const threshold = 40; // px
    if (delta > threshold) changeActiveCardAnimated(Math.max(0, activeCard - 1));
    else if (delta < -threshold) changeActiveCardAnimated(Math.min(reviews.length - 1, activeCard + 1));
    modalTouchStartX.current = null;
    modalTouchDeltaX.current = 0;
  };

  // Animated card change: fade out content, change card, fade in
  const changeActiveCardAnimated = (nextIndex: number) => {
    if (nextIndex === activeCard) return;
    setContentVisible(false);
    // small delay to allow fade-out
    window.setTimeout(() => {
      setActiveCard(nextIndex);
      setActiveImage(0);
      setContentVisible(true);
    }, 180);
  };

  // Animated image change inside modal
  const changeActiveImageAnimated = (nextImage: number) => {
    if (nextImage === activeImage) return;
    setImageVisible(false);
    window.setTimeout(() => {
      setActiveImage(nextImage);
      setImageVisible(true);
    }, 140);
  };

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
        if (activeImage < imgs.length - 1) changeActiveImageAnimated(activeImage + 1);
        else changeActiveCardAnimated(Math.min(reviews.length - 1, activeCard + 1));
      }
      if (e.key === 'ArrowLeft') {
        if (activeImage > 0) changeActiveImageAnimated(activeImage - 1);
        else changeActiveCardAnimated(Math.max(0, activeCard - 1));
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

  // Always show the first image when switching cards while the modal is open.
  // This guarantees that after changing to another review, the modal displays
  // image index 0 (the first photo) instead of keeping a stale index.
  useEffect(() => {
    if (!modalOpen) return;
    setActiveImage(0);
  }, [activeCard, modalOpen]);

  // Compute widths and center offset. For non-mobile (>=640) we always center the visible group
  const totalTrackWidth = itemWidth ? itemWidth * reviews.length + (itemGap ? itemGap * (reviews.length - 1) : 0) : undefined;
  const visibleGroupWidth = itemWidth ? itemWidth * Math.min(effectiveVisible, reviews.length) + (itemGap ? itemGap * Math.max(0, Math.min(effectiveVisible, reviews.length) - 1) : 0) : undefined;

  let transformValue: string;
  if (itemWidth) {
      if (windowWidth >= 640 && typeof visibleGroupWidth === 'number') {
      // center the visible group inside the container, then shift by index
      const centerOffset = Math.max(0, (containerWidth - visibleGroupWidth) / 2);
      const shift = index * (itemWidth + (itemGap || 0));
      // move track so that the current page is centered: positive centerOffset pulls track right
      const x = centerOffset - shift;
      transformValue = `translateX(${x}px)`;
    } else {
      // mobile: normal left translation per index; include dragOffset for live dragging
      transformValue = `translateX(calc(-${index * (itemWidth + (itemGap || 0))}px + ${dragOffset}px))`;
    }
  } else {
    transformValue = `translateX(-${index * (100 / effectiveVisible)}%)`;
  }

  const trackStyle: React.CSSProperties = {
    display: 'flex',
    transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(.2,.9,.2,1)',
    transform: transformValue,
    width: itemWidth ? `${totalTrackWidth}px` : `${(reviews.length * 100) / effectiveVisible}%`,
    gap: itemGap ? `${itemGap}px` : undefined,
  };

  if (reviews.length === 0) return null;

  // average rating for header
  const averageRating = reviews.reduce((s, r) => s + (Number(r?.rating) || 0), 0) / reviews.length;
  const avgRounded = Math.round(averageRating * 10) / 10; // one decimal
  const avgRoundedInt = Math.round(averageRating); // for star meter (nearest int)

  return (
    <>
      <div className="w-full flex justify-center my-6">
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Esto opinan otros cuñaos</div>
          <div className="mt-2 flex items-center justify-center gap-3">
            {/* stars */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < avgRoundedInt ? 'text-spanish-yellow' : 'text-slate-300'}`} />
              ))}
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">de {reviews.length} reseñas</div>
          </div>
        </div>
      </div>
      <div ref={containerRef} className="relative px-4 sm:px-0">
      {/* arrow offset: outside on desktop, inside on small screens */}
      {windowWidth >= 640 && (() => {
        // left position relative to container; cap to avoid huge negative offsets
        const leftPos = Math.min(0, arrowOffsetLeft);
        return (
          <div className="absolute top-1/2 transform -translate-y-1/2 z-10" style={{ left: leftPos }}>
            <button
              onClick={() => { if (canPrev) prev(); }}
              disabled={!canPrev}
              aria-disabled={!canPrev}
              aria-label="Anterior"
              className={`bg-white/10 text-white w-10 h-10 flex items-center justify-center rounded-full border border-slate-700 transition-colors duration-150 ${canPrev ? 'hover:bg-white/20' : 'opacity-40 cursor-not-allowed'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        );
      })()}
      <div className="overflow-hidden">
      <div ref={trackRef} style={trackStyle} className="flex" onTouchStart={onTrackTouchStart} onTouchMove={onTrackTouchMove} onTouchEnd={onTrackTouchEnd}>
          {reviews.map((r, idx) => (
            <div key={r._id} style={{ width: itemWidth ? `${itemWidth}px` : `${100 / effectiveVisible}%`, flex: '0 0 auto' }} className="px-0 sm:px-2 min-w-0">
              <ReviewCard review={r} onOpen={() => { setModalOpen(true); setActiveCard(idx); setActiveImage(0); }} />
            </div>
          ))}
        </div>
      </div>
      {windowWidth >= 640 && (() => {
        const rightPos = Math.min(0, arrowOffsetRight);
        return (
          <div className="absolute top-1/2 transform -translate-y-1/2 z-10" style={{ right: rightPos }}>
            <button
              onClick={() => { if (canNext) next(); }}
              disabled={!canNext}
              aria-disabled={!canNext}
              aria-label="Siguiente"
              className={`bg-white/10 text-white w-10 h-10 flex items-center justify-center rounded-full border border-slate-700 transition-colors duration-150 ${canNext ? 'hover:bg-white/20' : 'opacity-40 cursor-not-allowed'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
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
  <div onClick={(e) => e.stopPropagation()} className="relative bg-slate-900 rounded-lg p-4 sm:p-6 w-full mx-4 sm:w-[90%] sm:mx-0 max-w-[420px] sm:max-w-4xl max-h-[90vh] overflow-hidden box-border">
          <button onClick={() => setModalOpen(false)} className="absolute top-3 right-3 text-slate-200"><X className="w-6 h-6" /></button>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* external arrows hidden on small screens to avoid stealing width */}
            <button onClick={() => setActiveCard(c => Math.max(0, c - 1))} className="p-2 text-slate-200 hidden sm:inline-flex"><ChevronLeft /></button>
            <div className="flex-1 min-w-0 w-full box-border px-4">
              {/* image display */}
              <div className="w-full bg-black rounded-t-lg overflow-hidden flex items-center justify-center relative box-border" onTouchStart={onModalTouchStart} onTouchMove={onModalTouchMove} onTouchEnd={onModalTouchEnd}>
                {/* overlay arrows for mobile removed - arrows will be placed below the review info */}
                {reviews[activeCard] && reviews[activeCard].photos && reviews[activeCard].photos.length > 0 ? (
                  <div style={{ transition: 'opacity 180ms ease', opacity: imageVisible ? 1 : 0, width: '100%' }}>
                    <img src={reviews[activeCard].photos[activeImage]} alt="big" className="w-full h-auto max-h-[60vh] object-contain max-w-full block" />
                  </div>
                ) : (
                  <div className="text-slate-400">Sin imagen</div>
                )}
              
                {/* overlay arrows for mobile removed - arrows will be placed below the review info */}
              </div>
              {/* mobile controls moved below thumbnails */}
              <div className="mt-3 flex items-center justify-between">
                <div className="text-slate-200">
                  <div className="font-semibold">{shortenName(reviews[activeCard]?.authorName)}</div>
                  {reviews[activeCard]?.productTitle ? (
                    <a
                      onClick={(e) => e.stopPropagation()}
                      href={reviews[activeCard]?.productSlug ? `/producto/${reviews[activeCard].productSlug}` : `/product/${reviews[activeCard].productId}`}
                      className="text-xs text-slate-400 hover:text-yellow-400 block"
                      title={`Ver ${reviews[activeCard].productTitle}`}
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {reviews[activeCard].productTitle}
                    </a>
                  ) : null}
                </div>
                <div className="text-spanish-yellow">{reviews[activeCard]?.rating}★</div>
              </div>
              <div className="mt-2 text-slate-300 max-h-28 overflow-auto break-words whitespace-normal">{reviews[activeCard]?.body}</div>
              {/* thumbnails for images of this review */}
              <div style={{ transition: 'opacity 180ms ease', opacity: contentVisible ? 1 : 0 }}>
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {(reviews[activeCard]?.photos || []).map((p: string, i: number) => (
                    <button key={i} onClick={() => changeActiveImageAnimated(i)} className={`w-12 h-12 bg-slate-800 rounded flex items-center justify-center overflow-hidden shrink-0 ${i===activeImage ? 'border-2 border-yellow-400' : ''}`}>
                      <img src={p} alt={`thumb-${i}`} className="w-full h-full object-contain max-w-full block" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={() => setActiveCard(c => Math.min(reviews.length - 1, c + 1))} className="p-2 text-slate-200 hidden sm:inline-flex"><ChevronRight /></button>
          </div>
          {/* mobile bottom controls: placed under all review info so they don't overlap content */}
          <div className="sm:hidden mt-4 flex items-center justify-center gap-6">
            <button
              aria-label="Anterior review"
              onClick={() => setActiveCard(c => Math.max(0, c - 1))}
              disabled={!canPrevModal}
              aria-disabled={!canPrevModal}
              className={`p-2 rounded-full ${canPrevModal ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/10 text-white opacity-40 cursor-not-allowed'}`}
            >
              ◀
            </button>
            <div className="text-slate-300 text-sm">
              {activeCard + 1} / {Math.max(1, reviews.length)}
            </div>
            <button
              aria-label="Siguiente review"
              onClick={() => setActiveCard(c => Math.min(reviews.length - 1, c + 1))}
              disabled={!canNextModal}
              aria-disabled={!canNextModal}
              className={`p-2 rounded-full ${canNextModal ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/10 text-white opacity-40 cursor-not-allowed'}`}
            >
              ▶
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  );
};

export default ReviewsCarousel;
