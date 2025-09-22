import React from 'react';
import type { Product } from '../types';
import RecentProductCard from './RecentProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  products: Product[];
  maxVisible?: number;
  className?: string;
};

function getVisibleCount(width: number) {
  // Larger screens show 4
  if (width >= 1200) return 4;
  // Intermediate large screens show 3 before dropping to 2
  if (width >= 992) return 3;
  // Medium screens show 2
  if (width >= 768) return 2;
  // Small screens show 2
  return 2;
}

const ProductsCarousel: React.FC<Props> = ({ products, maxVisible = 4, className }) => {
  const [visible, setVisible] = React.useState<number>(() => maxVisible);
  const [index, setIndex] = React.useState(0);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(0);
  // Swipe / pointer tracking refs
  const pointerActive = React.useRef(false);
  const startX = React.useRef(0);
  const lastX = React.useRef(0);
  const dragged = React.useRef(false);
  const animationFrame = React.useRef<number | null>(null);

  React.useEffect(() => {
    // Use ResizeObserver on the container if available, otherwise fallback to window resize
    let ro: ResizeObserver | null = null;
    const update = () => {
      try {
        const w = containerRef.current ? containerRef.current.clientWidth : window.innerWidth;
        setContainerWidth(w);
        setVisible(Math.min(getVisibleCount(w), maxVisible));
      } catch (e) {
        setContainerWidth(0);
        setVisible(maxVisible);
      }
    };

    if (containerRef.current && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => update());
      ro.observe(containerRef.current);
      // update initially
      update();
    } else {
      window.addEventListener('resize', update);
      // initial
      update();
    }

    return () => {
      if (ro && containerRef.current) ro.unobserve(containerRef.current);
      else window.removeEventListener('resize', update);
    };
  }, [maxVisible]);

  // Recalcular visible inmediatamente en montaje (antes del primer paint)
  // para evitar un render inicial con un valor desincronizado que provoca
  // que el carrusel muestre menos cards (y las haga enormes) hasta recargar.
  React.useLayoutEffect(() => {
    // calcular según el ancho del contenedor al montar
    const w = containerRef.current ? containerRef.current.clientWidth : (typeof window !== 'undefined' ? window.innerWidth : 1024);
    const count = Math.min(getVisibleCount(w), maxVisible);
    setVisible(count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxVisible]);

  React.useEffect(() => setIndex(0), [products.length, visible]);

  const maxIndex = Math.max(0, products.length - visible);
  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(maxIndex, i + 1));

  const isPrevDisabled = index <= 0;
  const isNextDisabled = index >= maxIndex;

  // calcular ancho por item en px para forzar exactamente `visible` items en vista
  const itemWidth = visible > 0 && containerWidth > 0 ? Math.floor(containerWidth / visible) : undefined;

  const trackStyle: React.CSSProperties = {
    display: 'flex',
    transition: 'transform 350ms ease',
    transform: itemWidth ? `translateX(-${index * itemWidth}px)` : `translateX(-${index * (100 / visible)}%)`,
    width: itemWidth ? `${itemWidth * products.length}px` : `${(products.length * 100) / visible}%`,
    touchAction: 'pan-y' // allow vertical scroll but handle horizontal pointer movement
  };

  // Pointer (touch/mouse) handlers for swipe
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || !trackRef.current) return;

    const THRESHOLD = 50; // pixels needed to trigger a slide

    const getDelta = (clientX: number) => clientX - startX.current;

    const onPointerDown = (e: PointerEvent) => {
      // Only handle primary pointer
      if ((e as any).isPrimary === false) return;
      pointerActive.current = true;
      startX.current = e.clientX;
      lastX.current = e.clientX;
      dragged.current = false;
      // Capture pointer so we receive events outside target
      try { (e.target as Element).setPointerCapture?.((e as any).pointerId); } catch {}
      // temporarily disable transition for direct dragging
      if (trackRef.current) trackRef.current.style.transition = 'none';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerActive.current) return;
      const dx = getDelta(e.clientX);
      // if vertical motion is dominant, ignore horizontal dragging to allow page scroll
      const dy = Math.abs((e as any).clientY - ((e as any).startY || 0));
      // mark dragged if moved more than a few pixels
      if (Math.abs(dx) > 5) dragged.current = true;
      lastX.current = e.clientX;
      // update transform to follow finger
      if (trackRef.current && itemWidth) {
        // compute base translate for current index
        const base = -index * itemWidth;
        let appliedDx = dx;
        // apply damping when trying to drag beyond bounds to create resistance
        if (index <= 0 && dx > 0) appliedDx = dx * 0.25;
        if (index >= maxIndex && dx < 0) appliedDx = dx * 0.25;
        const translate = base + appliedDx;
        // apply in rAF
        if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
        animationFrame.current = requestAnimationFrame(() => {
          if (trackRef.current) trackRef.current.style.transform = `translateX(${translate}px)`;
        });
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!pointerActive.current) return;
      pointerActive.current = false;
      // release capture
      try { (e.target as Element).releasePointerCapture?.((e as any).pointerId); } catch {}
      // restore transition
      if (trackRef.current) trackRef.current.style.transition = 'transform 350ms ease';

      const dx = lastX.current - startX.current;
      if (Math.abs(dx) >= THRESHOLD) {
        if (dx < 0) {
          // swipe left -> next only if not at end
          if (index < maxIndex) next();
          else if (trackRef.current && itemWidth) trackRef.current.style.transform = `translateX(-${index * itemWidth}px)`;
        } else {
          // swipe right -> prev only if not at start
          if (index > 0) prev();
          else if (trackRef.current && itemWidth) trackRef.current.style.transform = `translateX(-${index * itemWidth}px)`;
        }
      } else {
        // small move: reset to current index
        if (trackRef.current && itemWidth) {
          // short bounce animation on reset
          trackRef.current.style.transition = 'transform 220ms cubic-bezier(.2, .8, .3, 1.2)';
          trackRef.current.style.transform = `translateX(-${index * itemWidth}px)`;
          // restore main transition after animation
          window.setTimeout(() => {
            if (trackRef.current) trackRef.current.style.transition = 'transform 350ms ease';
          }, 240);
        }
      }

      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = null;
      }
    };

    el.addEventListener('pointerdown', onPointerDown as EventListener);
    window.addEventListener('pointermove', onPointerMove as EventListener);
    window.addEventListener('pointerup', onPointerUp as EventListener);
    window.addEventListener('pointercancel', onPointerUp as EventListener);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown as EventListener);
      window.removeEventListener('pointermove', onPointerMove as EventListener);
      window.removeEventListener('pointerup', onPointerUp as EventListener);
      window.removeEventListener('pointercancel', onPointerUp as EventListener);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [index, itemWidth, next, prev]);

  return (
    <div ref={containerRef} style={{ touchAction: 'pan-y' }} className={`relative ${className || ''}`}>
      {/* Arrows: moved slightly inside and responsive sizes/offsets for mobile */}
  <div className="absolute left-2 sm:-left-8 top-1/2 transform -translate-y-1/2 z-10">
        <button
          onClick={prev}
          aria-label="Anterior"
          aria-disabled={isPrevDisabled}
          disabled={isPrevDisabled}
          className={`bg-white/10 text-white p-2 sm:p-4 rounded-full shadow-lg border border-slate-700 transition-opacity duration-150 ${isPrevDisabled ? 'opacity-30 pointer-events-none cursor-not-allowed' : 'hover:bg-white/20'}`}
        >
          <ChevronLeft size={18} className="sm:!w-5 sm:!h-5" />
        </button>
      </div>

      <div className="overflow-hidden h-full">
        <div ref={trackRef} style={{ ...trackStyle, alignItems: 'center', height: '100%', minHeight: undefined }} className="h-full flex items-center min-h-[300px] sm:min-h-[380px] md:min-h-[420px]">
          {products.map((product, idx) => (
            <div
              key={product.id}
              style={{ width: itemWidth ? `${itemWidth}px` : `${100 / visible}%`, padding: 0, height: '100%', boxSizing: 'border-box', flex: '0 0 auto' }}
              className="h-full overflow-visible flex min-h-0 min-w-0 justify-center"
            >
              <div className="w-full h-full min-h-0 min-w-0 max-w-full">
                <RecentProductCard product={product} className="h-full w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

  <div className="absolute right-2 sm:-right-8 top-1/2 transform -translate-y-1/2 z-10">
        <button
          onClick={next}
          aria-label="Siguiente"
          aria-disabled={isNextDisabled}
          disabled={isNextDisabled}
          className={`bg-white/10 text-white p-2 sm:p-4 rounded-full shadow-lg border border-slate-700 transition-opacity duration-150 ${isNextDisabled ? 'opacity-30 pointer-events-none cursor-not-allowed' : 'hover:bg-white/20'}`}
        >
          <ChevronRight size={18} className="sm:!w-5 sm:!h-5" />
        </button>
      </div>
    </div>
  );
};

export default ProductsCarousel;
