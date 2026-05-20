interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, count, size = 'md' }: StarRatingProps) {
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <span key={s} className={s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}>
            ★
          </span>
        ))}
      </div>
      {count !== undefined && <span className="text-gray-400">({count})</span>}
    </div>
  );
}
