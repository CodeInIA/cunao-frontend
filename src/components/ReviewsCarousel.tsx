import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiService } from '../services/api';
import ReviewCard from './ReviewCard';
import { ChevronLeft, ChevronRight, X, UserStar} from 'lucide-react';
import Rating from '@mui/material/Rating';
import StarIcon from '@mui/icons-material/Star';
import { getWebPImageUrl } from '../utils/imageUtils';

type Props = { productId?: string; maxVisible?: number; arrowEdgeExtra?: number };

function getVisibleCount(width: number) {
  // breakpoints: mobile <640:1, 640-767:2, 768-991:3, 992-1199:4, >=1200:6
  if (width >= 1400) return 4;
  if (width >= 1100) return 3;
  if (width >= 640) return 2;
  return 1; // mobile: show 1
}

const ReviewsCarousel: React.FC<Props> = ({ productId, maxVisible = 6, arrowEdgeExtra = 0 }) => {
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

  // rating display will use MUI Rating with precision 0.1

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await apiService.getReviews(productId);
        // Ordenar por: 1) Rating (desc), 2) Con fotos primero, 3) Fecha más reciente (desc)
        const sorted = (Array.isArray(data) ? data.slice() : []).sort((a: any, b: any) => {
          // 1. Comparar por rating (descendente)
          const ratingA = Number(a?.rating) || 0;
          const ratingB = Number(b?.rating) || 0;
          const ratingDiff = ratingB - ratingA;
          if (ratingDiff !== 0) return ratingDiff;
          
          // 2. Si tienen el mismo rating, las con fotos primero
          const hasPhotosA = Array.isArray(a?.photos) && a.photos.length > 0;
          const hasPhotosB = Array.isArray(b?.photos) && b.photos.length > 0;
          if (hasPhotosA !== hasPhotosB) {
            return hasPhotosB ? 1 : -1; // B (con fotos) primero si tiene fotos
          }
          
          // 3. Si ambas tienen o no tienen fotos, ordenar por fecha (más reciente primero)
          const dateB = new Date(b?.createdAt || b?.created_at || 0).getTime();
          const dateA = new Date(a?.createdAt || a?.created_at || 0).getTime();
          return dateB - dateA;
        });
        setReviews(sorted);
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
  const baseDistance = winW >= 1200 ? 72 : winW >= 992 ? 56 : winW >= 768 ? 44 : winW >= 640 ? 32 : 12;
  const distanceFromEdge = baseDistance + (arrowEdgeExtra || 0);

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

  // reset index when reviews/visible change; ensure it's within bounds (index is the start item index)
  useEffect(() => {
    const maxIdx = Math.max(0, reviews.length - effectiveVisible);
    setIndex(i => Math.min(i, maxIdx));
  }, [reviews.length, visible, windowWidth]);

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

  // treat widths < 640 as mobile (1 card); from 640px use page-based navigation
  const effectiveVisible = windowWidth < 640 ? 1 : visible;

  // navigation: index is the start item index (leftmost visible card). Move one item at a time.
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
      // index is the start item index. Shift track left so items [index .. index+effectiveVisible-1] are visible inside the clipped viewport.
      const singleStep = (itemWidth + (itemGap || 0));
      const shift = index * singleStep;
      transformValue = `translateX(${-shift}px)`;
    } else {
      // mobile: normal left translation per item index; include dragOffset for live dragging
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
  const averageRating = reviews.length ? reviews.reduce((s, r) => s + (Number(r?.rating) || 0), 0) / reviews.length : 0;
  const avgRounded = Math.round(averageRating * 10) / 10; // one decimal



  return (
    <>
      <div className="w-full flex justify-center my-6">
        <div className="text-center">
          <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">Esto opinan otros cuñaos</div>
          <div className="mt-2 flex items-center justify-center gap-3">
            {/* average number with user-star icon before the stars */}
            <div className="flex items-center gap-2">
              <UserStar className="w-5 h-5 text-spanish-yellow" />
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{avgRounded}</div>
            </div>

            {/* stars with continuous fill: gray background stars and yellow foreground clipped by width */}
            {/* Use a filled SVG star so clipping shows a proper partial fill (lucide Star is outline-only) */}
            {/* local FilledStar component */}
            
            <div className="relative inline-block" aria-hidden>
              <Rating 
              name="avg-rating" 
              value={avgRounded} 
              precision={0.1} 
              readOnly 
              size="medium" 
              emptyIcon={<StarIcon style={{ opacity: 1 }} fontSize="inherit" />}
              sx={{ color: 'var(--tw-color-spanish-yellow, #f5c518)' }} />
            </div>

            <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">de {reviews.length} reseñas</div>
          </div>
        </div>
      </div>
      <div ref={containerRef} className="relative px-4 sm:px-0">
      {/* arrow offset: outside on desktop, inside on small screens */}
      {windowWidth >= 640 && (() => {
        // position arrows using offsets computed against the container so they sit outside the cards
        // apply a small extra margin (-extraPx) to make sure they don't touch the cards
        const extraPx = 12;
        const leftPos = `${arrowOffsetLeft - extraPx}px`;
        return (
          <div className="absolute top-1/2 transform -translate-y-1/2 z-30 pointer-events-auto" style={{ left: leftPos }}>
            <div className="relative inline-block">
              {/* group wrapper to allow tooltip and hover effects on desktop */}
              <div className={`relative group`}>
                <button
                  onClick={() => { if (canPrev) prev(); }}
                  disabled={!canPrev}
                  aria-disabled={!canPrev}
                  aria-label="Anterior"
                  className={`bg-white/10 text-white w-10 h-10 flex items-center justify-center rounded-full border border-slate-700 transition duration-150 ${canPrev ? 'group-hover:shadow-lg group-hover:bg-white/20' : 'opacity-40 cursor-not-allowed'}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {/* Tooltip only intended for desktop (this branch is already desktop-only) */}
                <span style={{ zIndex: 9999 }} className="pointer-events-none absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-slate-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                  Anterior
                </span>
              </div>
            </div>
          </div>
        );
      })()}
  {/* viewport: on desktop limit width to the visible group and center it so side cards are clipped */}
  <div className="overflow-hidden" style={{ width: windowWidth >= 640 && typeof visibleGroupWidth === 'number' ? `${visibleGroupWidth}px` : '100%', margin: '0 auto' }}>
  <div ref={trackRef} style={trackStyle} className="flex" onTouchStart={onTrackTouchStart} onTouchMove={onTrackTouchMove} onTouchEnd={onTrackTouchEnd}>
          {reviews.map((r, idx) => (
            <div key={r._id} style={{ width: itemWidth ? `${itemWidth}px` : `${100 / effectiveVisible}%`, flex: '0 0 auto' }} className="px-0 sm:px-2 min-w-0">
              <ReviewCard review={r} onOpen={() => { setModalOpen(true); setActiveCard(idx); setActiveImage(0); }} />
            </div>
          ))}
        </div>
      </div>
      {windowWidth >= 640 && (() => {
        const extraPxR = 12;
        const rightPos = `${arrowOffsetRight - extraPxR}px`;
        return (
          <div className="absolute top-1/2 transform -translate-y-1/2 z-30 pointer-events-auto" style={{ right: rightPos }}>
            <div className="relative inline-block">
              <div className={`relative group`}>
                <button
                  onClick={() => { if (canNext) next(); }}
                  disabled={!canNext}
                  aria-disabled={!canNext}
                  aria-label="Siguiente"
                  className={`bg-white/10 text-white w-10 h-10 flex items-center justify-center rounded-full border border-slate-700 transition duration-150 ${canNext ? 'group-hover:shadow-lg group-hover:bg-white/20' : 'opacity-40 cursor-not-allowed'}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span style={{ zIndex: 9999 }} className="pointer-events-none absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-slate-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                  Siguiente
                </span>
              </div>
            </div>
          </div>
        );
      })()}
      </div>
      {/* mobile bottom controls: prev, dots, next */}
      {windowWidth < 640 && (
        <div className="mt-3 flex items-center justify-center gap-4">
          <button onClick={() => { if (canPrev) prev(); }} disabled={!canPrev} aria-disabled={!canPrev} className={`p-2 rounded-full bg-white/10 text-white ${canPrev ? 'hover:bg-white/20' : 'opacity-40 cursor-not-allowed'}`}>◀</button>
          <div className="flex items-center gap-2">
              {(() => {
              const pages = Math.max(1, Math.ceil(reviews.length / effectiveVisible));
              // activePage: when desktop (index is page) it's just index; on mobile index might be item index so derive page
              const activePage = windowWidth >= 640 ? index : Math.floor(index / effectiveVisible);
              const maxDots = 7; // máximo de puntitos a mostrar entre las flechas en móvil
              let pageIndices: number[] = [];
              if (pages <= maxDots) {
                pageIndices = Array.from({ length: pages }).map((_, i) => i);
              } else {
                const half = Math.floor(maxDots / 2);
                let start = Math.max(0, activePage - half);
                let end = start + maxDots;
                if (end > pages) {
                  end = pages;
                  start = pages - maxDots;
                }
                pageIndices = Array.from({ length: end - start }).map((_, i) => i + start);
              }
                return pageIndices.map((p) => {
                // clicking a dot: on desktop set page index directly; on mobile set item index to page start
                const targetIndex = windowWidth >= 640 ? p : p * effectiveVisible;
                return (
                  <button key={p} onClick={() => setIndex(targetIndex)} className={`w-2 h-2 rounded-full ${activePage === p ? 'bg-white' : 'bg-white/30'}`} aria-label={`Ir a página ${p+1}`} />
                );
              });
            })()}
          </div>
          <button onClick={() => { if (canNext) next(); }} disabled={!canNext} aria-disabled={!canNext} className={`p-2 rounded-full bg-white/10 text-white ${canNext ? 'hover:bg-white/20' : 'opacity-40 cursor-not-allowed'}`}>▶</button>
        </div>
      )}
      {/* modal overlay */}
      {modalOpen && (
      <div onClick={() => setModalOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div onClick={(e) => e.stopPropagation()} className="relative bg-slate-900 rounded-lg p-4 sm:p-6 w-full mx-4 sm:w-[90%] sm:mx-0 max-w-[420px] sm:max-w-4xl max-h-[90vh] overflow-auto box-border flex flex-col">
          <div className="absolute top-3 right-3 text-slate-200">
            <div className="relative inline-block">
              <div className="relative group">
                <button
                  onClick={() => setModalOpen(false)}
                  aria-label="Cerrar"
                  className="text-slate-200 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-150 group-hover:shadow-lg group-hover:bg-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
                {/* tooltip only on desktop */}
                <span style={{ zIndex: 10001 }} className="hidden sm:block pointer-events-none absolute -top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-slate-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                  Cerrar
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* external arrows hidden on small screens to avoid stealing width */}
            <button
              onClick={() => setActiveCard(c => Math.max(0, c - 1))}
              disabled={!canPrevModal}
              aria-disabled={!canPrevModal}
              aria-label="Anterior review"
              className={`p-2 text-slate-200 hidden sm:inline-flex`}
            >
              <div className={`relative group ${canPrevModal ? '' : 'opacity-40 cursor-not-allowed'}`}>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition duration-150 ${canPrevModal ? 'group-hover:shadow-lg group-hover:bg-white/10' : ''}`}>
                  <ChevronLeft />
                </div>
                <span style={{ zIndex: 9999 }} className={`pointer-events-none absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 transition-opacity duration-150 bg-slate-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap ${canPrevModal ? 'group-hover:opacity-100' : ''}`}>
                  Anterior
                </span>
              </div>
            </button>
            <div className="flex-1 min-w-0 w-full box-border px-4">
              {/* image display: use 3:4 aspect frame to match review cards; limit max-height so modal fits viewport */}
              <div className="w-full bg-transparent rounded-t-lg overflow-hidden flex items-center justify-center relative box-border aspect-[3/4] max-h-[60vh] sm:max-h-[60vh]" onTouchStart={onModalTouchStart} onTouchMove={onModalTouchMove} onTouchEnd={onModalTouchEnd}>
                {/* overlay arrows for mobile removed - arrows will be placed below the review info */}
                {(() => {
                  const rv = reviews[activeCard] || {};
                  const photos: string[] = rv.photos || [];
                  const photoFromReview = photos.length > 0 ? photos[activeImage] : null;
                  const fallback = rv.imageUrl || rv.productImage || rv.product_image || null;
                  const src = photoFromReview || fallback;
                  if (src) {
                    const url = getWebPImageUrl(src as any);
                    const isReviewPhoto = !!photoFromReview;
                    // show the full image inside the frame (no crop) for both review photos and fallback
                    return (
                      <div style={{ transition: 'opacity 180ms ease', opacity: imageVisible ? 1 : 0, width: '100%', height: '100%' }}>
                        <img src={url} alt="big" className="w-full h-full object-contain max-w-full block" />
                      </div>
                    );
                  }
                  return <div className="text-slate-400">Sin imagen</div>;
                })()}
              
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
              {/* modal: mostrar la fila sutil de talla/color/cantidad (si existe) debajo del título */}
              {(() => {
                const rv = reviews[activeCard] || {};
                const size = rv.size || rv.talla || rv.productSize || rv.product_size;
                const color = rv.color || rv.colour || rv.productColor || rv.product_color;
                const qty = rv.quantity || rv.qty || rv.cantidad || rv.amount;
                const parts: string[] = [];
                if (size) parts.push(`Talla ${size}`);
                if (color) parts.push(`Color ${typeof color === 'string' ? color : String(color)}`);
                if (qty != null) parts.push(`${qty}x`);
                if (parts.length === 0) return null;
                return (
                  <div className="text-xs text-slate-400/90 mt-1" title={parts.join(' · ')}>
                    {parts.join(' · ')}
                  </div>
                );
              })()}

              {/* modal: mostrar descripción completa (puede hacer scroll si es larga) */}
              <div className="mt-2 text-slate-300 overflow-auto break-words whitespace-normal max-h-[28vh]">{reviews[activeCard]?.body}</div>
              {/* thumbnails for images of this review */}
              <div style={{ transition: 'opacity 180ms ease', opacity: contentVisible ? 1 : 0 }}>
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                  {(reviews[activeCard]?.photos || []).map((p: string, i: number) => (
                    <button key={i} onClick={() => changeActiveImageAnimated(i)} className={`w-12 aspect-[3/4] bg-slate-800 rounded overflow-hidden shrink-0 flex items-center justify-center ${i===activeImage ? 'border-2 border-yellow-400' : ''}`}>
                      <img src={p} alt={`thumb-${i}`} className="w-full h-full object-cover block" />
                    </button>
                  ))}
                  {/* If there are no photos but we have a fallback image, show it as a single thumbnail */}
                  {(!(reviews[activeCard]?.photos || []).length && (reviews[activeCard]?.imageUrl || reviews[activeCard]?.productImage || reviews[activeCard]?.product_image)) ? (
                    <div className={`w-12 aspect-[3/4] bg-slate-800 rounded overflow-hidden shrink-0 flex items-center justify-center border-2 border-yellow-400`}>
                      <img src={getWebPImageUrl(reviews[activeCard].imageUrl || reviews[activeCard].productImage || reviews[activeCard].product_image)} alt={`thumb-fallback`} className="w-full h-full object-cover block" />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveCard(c => Math.min(reviews.length - 1, c + 1))}
              disabled={!canNextModal}
              aria-disabled={!canNextModal}
              aria-label="Siguiente review"
              className={`p-2 text-slate-200 hidden sm:inline-flex`}
            >
              <div className={`relative group ${canNextModal ? '' : 'opacity-40 cursor-not-allowed'}`}>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition duration-150 ${canNextModal ? 'group-hover:shadow-lg group-hover:bg-white/10' : ''}`}>
                  <ChevronRight />
                </div>
                <span style={{ zIndex: 9999 }} className={`pointer-events-none absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 transition-opacity duration-150 bg-slate-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap ${canNextModal ? 'group-hover:opacity-100' : ''}`}>
                  Siguiente
                </span>
              </div>
            </button>
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
