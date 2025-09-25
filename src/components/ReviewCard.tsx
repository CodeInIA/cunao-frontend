import React from 'react';

export const ReviewCard: React.FC<{ review: any; onOpen?: () => void }> = ({ review, onOpen }) => {
  const shortenName = (name?: string) => {
    if (!name) return 'Anónimo';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts.slice(1).map(p => p[0]).join('. ')}.`;
  };

  const productHref = review?.productSlug ? `/producto/${review.productSlug}` : (review?.productId ? `/product/${review.productId}` : '#');

  return (
    <div
      onClick={onOpen}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      className="bg-slate-800 rounded-lg text-white cursor-pointer hover:shadow-lg transition-shadow overflow-hidden w-full max-w-full box-border flex flex-col min-w-0"
    >
      {/* Cover image */}
  <div className="flex-none w-full h-72 sm:h-56 bg-slate-900">
        {review.photos && review.photos.length > 0 ? (
          <img src={review.photos[0]} alt={review.productTitle || 'imagen'} className="w-full max-w-full h-full object-cover block" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">Sin imagen</div>
        )}
      </div>

  <div className="p-4 flex-1 flex flex-col min-w-0">
        {/* Stars centered */}
        <div className="flex justify-center mb-2">
          {[1,2,3,4,5].map(n => (
            <span key={n} className={`text-spanish-yellow ${n <= (review.rating || 0) ? '' : 'opacity-40'}`}>★</span>
          ))}
        </div>

        {/* Product title + link */}
        {review.productTitle ? (
          <a
            onClick={(e) => e.stopPropagation()}
            href={productHref}
            className="text-sm text-slate-300 hover:text-yellow-400 block text-center font-medium whitespace-normal break-words max-w-full"
            title={review.productTitle}
          >
            {review.productTitle}
          </a>
        ) : null}

        {/* Review body */}
  <p className="text-slate-300 text-sm mt-3 mb-4 overflow-hidden break-words whitespace-normal max-w-full">{review.body}</p>

        <div className="mt-auto">
          <div className="border-t border-slate-700 mb-3" />
          <div className="text-slate-200 text-sm font-semibold text-center">{shortenName(review.authorName)}</div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
