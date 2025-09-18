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
  if (width >= 1024) return 4;
  if (width >= 768) return 2;
  return 1;
}

const ProductsCarousel: React.FC<Props> = ({ products, maxVisible = 4, className }) => {
  const [visible, setVisible] = React.useState<number>(() => maxVisible);
  const [index, setIndex] = React.useState(0);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = React.useState<number>(0);

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

  // calcular ancho por item en px para forzar exactamente `visible` items en vista
  const itemWidth = visible > 0 && containerWidth > 0 ? Math.floor(containerWidth / visible) : undefined;

  const trackStyle: React.CSSProperties = {
    display: 'flex',
    transition: 'transform 350ms ease',
    transform: itemWidth ? `translateX(-${index * itemWidth}px)` : `translateX(-${index * (100 / visible)}%)`,
    width: itemWidth ? `${itemWidth * products.length}px` : `${(products.length * 100) / visible}%`
  };

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      {/* Arrows: moved slightly inside and responsive sizes/offsets for mobile */}
      <div className="absolute left-2 sm:-left-8 top-1/2 transform -translate-y-1/2 z-50">
        <button onClick={prev} aria-label="Anterior" className="bg-white/10 hover:bg-white/20 text-white p-2 sm:p-4 rounded-full shadow-lg border border-slate-700">
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

      <div className="absolute right-2 sm:-right-8 top-1/2 transform -translate-y-1/2 z-50">
        <button onClick={next} aria-label="Siguiente" className="bg-white/10 hover:bg-white/20 text-white p-2 sm:p-4 rounded-full shadow-lg border border-slate-700">
          <ChevronRight size={18} className="sm:!w-5 sm:!h-5" />
        </button>
      </div>
    </div>
  );
};

export default ProductsCarousel;
