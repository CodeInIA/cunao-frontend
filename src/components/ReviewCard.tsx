import React from 'react';
import { Check } from 'lucide-react';
import { getWebPImageUrl } from '../utils/imageUtils';

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
        {(() => {
          // Prefer review photos (user uploaded). If missing, fallback to product/variant image
          const photoFromReview = review.photos && review.photos.length > 0 ? review.photos[0] : null;
          const fallback = review.imageUrl || review.productImage || review.product_image || null;
          const src = photoFromReview || fallback;
          if (src) {
            // normalize/optimize URL when possible
            const url = getWebPImageUrl(src as any);
            return <img src={url} alt={review.productTitle || 'imagen'} className="w-full max-w-full h-full object-cover block" />;
          }
          return <div className="w-full h-full flex items-center justify-center text-slate-500">Sin imagen</div>;
        })()}
      </div>

  <div className="p-4 flex-1 flex flex-col min-w-0">
        {/* Stars centered */}
        <div className="flex justify-center mb-2">
          {[1,2,3,4,5].map(n => (
            <span key={n} className={`text-spanish-yellow ${n <= (review.rating || 0) ? '' : 'opacity-40'}`}>★</span>
          ))}
        </div>

        {/* Product info row: talla / color / cantidad (sutil) */}
        {(() => {
          const size = review.size || review.talla || review.productSize || review.product_size;
          const color = review.color || review.colour || review.productColor || review.product_color;
          const qty = review.quantity || review.qty || review.cantidad || review.amount;
          const parts: string[] = [];
          if (size) parts.push(`Talla ${size}`);
          if (color) parts.push(`Color ${typeof color === 'string' ? color : String(color)}`);
          if (qty != null) parts.push(`${qty}x`);
          if (parts.length === 0) return null;
          return (
            <div className="text-center mt-1">
              <div className="text-xs text-slate-400/90 truncate" title={parts.join(' · ')}>
                {parts.join(' · ')}
              </div>
            </div>
          );
        })()}

        {/* Product title + link (restaurado) */}
        {review.productTitle ? (
          <a
            onClick={(e) => e.stopPropagation()}
            href={productHref}
            className="text-sm text-slate-300 hover:text-yellow-400 block text-center font-medium whitespace-normal break-words max-w-full mt-1"
            title={review.productTitle}
          >
            {review.productTitle}
          </a>
        ) : null}

        {/* Review body: limitar a 1 línea con ellipsis (tarjeta) */}
  <p
    className="text-slate-300 text-sm mt-3 mb-4 break-words max-w-full"
    style={{
      display: '-webkit-box',
      WebkitLineClamp: 1,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'normal'
    }}
  >
    {review.body}
  </p>

        <div className="mt-auto">
          <div className="border-t border-slate-700 mb-3" />
          <div className="flex items-center justify-center gap-2">
              <div className="flex items-center gap-1 text-sm text-slate-300">
                <Check className="w-4 h-4 text-spanish-yellow" />
                <span className="font-medium">Compra verificada</span>
              </div>
          </div>
          <div className="text-slate-200 text-sm font-semibold text-center mt-2">{shortenName(review.authorName)}</div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
