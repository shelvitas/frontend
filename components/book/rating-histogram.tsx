"use client";

import { Star } from "lucide-react";

interface RatingHistogramProps {
  histogram: Record<string, number>;
  avgRating: number | null;
  ratingsCount: number;
}

export const RatingHistogram = ({
  histogram,
  avgRating,
  ratingsCount,
}: RatingHistogramProps) => {
  const maxCount = Math.max(...Object.values(histogram), 1);

  // Group half-stars into full stars for display (e.g. 4.5+5.0 → "5")
  const bars = [5, 4, 3, 2, 1].map((star) => {
    const low =
      histogram[`${star - 0.5}.0`] ??
      histogram[`${(star - 0.5).toFixed(1)}`] ??
      0;
    const high = histogram[`${star}.0`] ?? histogram[`${star.toFixed(1)}`] ?? 0;
    return { star, count: low + high };
  });

  return (
    <div className="flex items-start gap-6">
      {/* Average */}
      <div className="text-center">
        <p className="text-4xl font-bold">
          {avgRating ? avgRating.toFixed(1) : "—"}
        </p>
        <div className="mt-1 flex items-center justify-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={`star-${i + 1}`}
              className={`h-3.5 w-3.5 ${
                avgRating && i < Math.round(avgRating)
                  ? "fill-shelvitas-orange text-shelvitas-orange"
                  : "text-secondary"
              }`}
            />
          ))}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {ratingsCount.toLocaleString()} rating{ratingsCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Bars */}
      <div className="flex-1 space-y-1">
        {bars.map((bar) => (
          <div key={bar.star} className="flex items-center gap-2">
            <span className="w-3 text-right text-xs text-muted-foreground">
              {bar.star}
            </span>
            <div className="h-2.5 flex-1 rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-shelvitas-orange transition-all"
                style={{
                  width: `${(bar.count / maxCount) * 100}%`,
                }}
              />
            </div>
            <span className="w-6 text-right text-xs text-muted-foreground">
              {bar.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
