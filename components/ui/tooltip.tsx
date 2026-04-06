"use client";

import { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
}

export const Tooltip = ({ content, children, side = "top" }: TooltipProps) => {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div
          className={`absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-sm bg-foreground px-2 py-1 text-[10px] font-medium text-background shadow-lg ${
            side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
