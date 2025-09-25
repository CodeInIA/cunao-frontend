import React from 'react';

export const ReviewCard: React.FC<{ review: any }> = ({ review }) => {
  const shortenName = (name: string) => {
    if (!name) return 'Anónimo';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts.slice(1).map(p => p[0]).join('. ')}.`;
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg text-white">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{shortenName(review.authorName)}</div>
        <div className="text-spanish-yellow font-bold">{review.rating}★</div>
      </div>
      <p className="text-slate-300 mb-2">{review.body}</p>
      <div className="grid grid-cols-3 gap-2">
        {(review.photos || []).slice(0,3).map((p: string, idx: number) => (
          <img key={idx} src={p} className="w-full h-20 object-cover rounded" alt={`foto-${idx}`} />
        ))}
      </div>
    </div>
  );
};

export default ReviewCard;
