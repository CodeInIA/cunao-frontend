import React from 'react';

export const ReviewCard: React.FC<{ review: any; onOpen?: () => void }> = ({ review, onOpen }) => {
  const shortenName = (name: string) => {
    if (!name) return 'Anónimo';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts.slice(1).map(p => p[0]).join('. ')}.`;
  };

  return (
    <div onClick={onOpen} role={onOpen ? 'button' : undefined} tabIndex={onOpen ? 0 : undefined} className="bg-slate-800 p-4 rounded-lg text-white cursor-pointer hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="min-w-0">
          <div className="font-semibold">{shortenName(review.authorName)}</div>
          {review.productTitle ? (
            <a onClick={(e) => e.stopPropagation()} href={review.productSlug ? `/producto/${review.productSlug}` : `/product/${review.productId}`} className="text-xs text-slate-400 hover:text-yellow-400 block truncate" title={`Ver ${review.productTitle}`}>
              {review.productTitle}
            </a>
          ) : null}
        </div>
        <div className="text-spanish-yellow font-bold">{review.rating}★</div>
      </div>
      <p className="text-slate-300 mb-3 line-clamp-3">{review.body}</p>

      {/* Main square (reduced size) */}
      <div className="mb-2 flex justify-center">
        {review.photos && review.photos.length > 0 ? (
          <div className="relative w-36 h-36 rounded overflow-hidden bg-slate-900">
            <img src={review.photos[0]} alt="main" className="absolute inset-0 w-full h-full object-contain p-2" />
          </div>
        ) : (
          <div className="w-36 h-36 rounded bg-slate-900 flex items-center justify-center text-slate-500">Sin imagen</div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2">
        {(review.photos || []).slice(1,6).map((p: string, idx: number) => (
          <div key={idx} className="w-12 h-12 bg-slate-900 rounded overflow-hidden flex items-center justify-center">
            <img src={p} alt={`thumb-${idx}`} className="w-full h-full object-contain p-1" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewCard;
