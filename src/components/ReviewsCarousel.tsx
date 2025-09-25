import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReviewCard from './ReviewCard';

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

  const trackStyle: React.CSSProperties = {
    display: 'flex',
    transition: 'transform 350ms ease',
    transform: itemWidth ? `translateX(-${index * itemWidth}px)` : `translateX(-${index * (100 / visible)}%)`,
    width: itemWidth ? `${itemWidth * reviews.length}px` : `${(reviews.length * 100) / visible}%`,
  };

  if (reviews.length === 0) return null;

  return (
    <div ref={containerRef} className="relative">
      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
        <button onClick={prev} className="bg-white/10 text-white p-2 rounded-full border border-slate-700">◀</button>
      </div>
      <div className="overflow-hidden">
        <div ref={trackRef} style={trackStyle} className="flex gap-4">
          {reviews.map(r => (
            <div key={r._id} style={{ width: itemWidth ? `${itemWidth}px` : `${100 / visible}%`, flex: '0 0 auto' }} className="px-2">
              <ReviewCard review={r} />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
        <button onClick={next} className="bg-white/10 text-white p-2 rounded-full border border-slate-700">▶</button>
      </div>
    </div>
  );
};

export default ReviewsCarousel;
