'use client';
import { useEffect, useRef } from 'react';
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;

    const scroll = new LocomotiveScroll({});

    return () => {
      scroll.destroy();
    };
  }, []);

  return (
    <div data-scroll-wrapper ref={wrapperRef} className="overflow-hidden">
      <div data-scroll-content ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
