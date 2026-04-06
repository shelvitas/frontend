"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const ProgressBar = () => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start progress on route change
    setLoading(true);
    setProgress(30);

    const timer1 = setTimeout(() => setProgress(60), 100);
    const timer2 = setTimeout(() => setProgress(80), 300);
    const timer3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
    }, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-0.5">
      <div
        className="relative h-full bg-shelvitas-green transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute right-0 top-[-1px] h-[4px] w-6 translate-x-1 rounded-full bg-white/50 shadow-[0_0_6px_1px_rgba(0,224,84,0.4)] blur-[2px]" />
      </div>
    </div>
  );
};
