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
  const [visible, setVisible] = React.useState(() => Math.min(getVisibleCount(typeof window !== 'undefined' ? window.innerWidth : 1024), maxVisible));
  const [index, setIndex] = React.useState(0);
  const trackRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onResize = () => setVisible(Math.min(getVisibleCount(window.innerWidth), maxVisible));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [maxVisible]);

  React.useEffect(() => setIndex(0), [products.length, visible]);

  const maxIndex = Math.max(0, products.length - visible);
  const prev = () => setIndex(i => Math.max(0, i - 1));
  const next = () => setIndex(i => Math.min(maxIndex, i + 1));

  const trackStyle: React.CSSProperties = {
    display: 'flex',
    transition: 'transform 350ms ease',
    transform: `translateX(-${index * (100 / visible)}%)`,
    width: `${(products.length * 100) / visible}%`
  };

  return (
    <div className={`relative ${className || ''}`}>
      <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 z-50">
        <button onClick={prev} aria-label="Anterior" className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full shadow-lg border border-slate-700">
          <ChevronLeft size={22} />
        </button>
      </div>

      <div className="overflow-hidden h-full">
        <div ref={trackRef} style={{ ...trackStyle, alignItems: 'stretch', height: '100%' }} className="h-full">
          {products.map(product => (
            <div key={product.id} style={{ flex: `0 0 ${100 / visible}%`, padding: '0', height: '100%', boxSizing: 'border-box', maxWidth: visible >= 4 ? 320 : '100%' }} className="h-full overflow-visible flex min-h-0">
              <div className="w-full h-full min-h-0 px-3">
                <RecentProductCard product={product} className="h-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 z-50">
        <button onClick={next} aria-label="Siguiente" className="bg-white/10 hover:bg-white/20 text-white p-4 rounded-full shadow-lg border border-slate-700">
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
};

export default ProductsCarousel;
