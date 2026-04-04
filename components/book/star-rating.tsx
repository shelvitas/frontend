"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number | null;
  onChange: (rating: number | null) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export const StarRating = ({
  value,
  onChange,
  size = "md",
  readOnly = false,
}: StarRatingProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue ?? value ?? 0;
  const starSize = sizeMap[size];

  const handleClick = (rating: number) => {
    if (readOnly) return;
    // Clicking the same rating clears it
    onChange(value === rating ? null : rating);
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLButtonElement>,
    starIndex: number,
  ) => {
    if (readOnly) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = e.clientX - rect.left < rect.width / 2;
    setHoverValue(starIndex - (isLeftHalf ? 0.5 : 0));
  };

  return (
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => setHoverValue(null)}
      role="radiogroup"
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        let fillPercent = 0;
        if (displayValue >= starIndex) {
          fillPercent = 100;
        } else if (displayValue >= starIndex - 0.5) {
          fillPercent = 50;
        }

        return (
          <button
            key={starIndex}
            type="button"
            className={`relative ${readOnly ? "cursor-default" : "cursor-pointer"}`}
            onClick={() =>
              handleClick(
                hoverValue ?? starIndex,
              )
            }
            onMouseMove={(e) => handleMouseMove(e, starIndex)}
            disabled={readOnly}
            aria-label={`${starIndex} star${starIndex > 1 ? "s" : ""}`}
          >
            {/* Background star (empty) */}
            <Star className={`${starSize} text-secondary`} />

            {/* Filled overlay */}
            {fillPercent > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercent}%` }}
              >
                <Star
                  className={`${starSize} fill-shelvitas-orange text-shelvitas-orange`}
                />
              </div>
            )}
          </button>
        );
      })}

      {/* Display value */}
      {value !== null && value > 0 && (
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
};
