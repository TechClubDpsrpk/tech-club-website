'use client';
import { useScroll, useTransform, motion } from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [height, setHeight] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [bulletColors, setBulletColors] = useState<boolean[]>([]);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
    setIsDark(document.documentElement.classList.contains('dark'));
    setBulletColors(Array(data.length).fill(false));

    const vh = window.innerHeight * 0.17;
    const handleScroll = () => {
      const newColors = itemRefs.current.map((itemDiv) => {
        if (itemDiv) {
          const rect = itemDiv.getBoundingClientRect();
          return rect.top < vh;
        }
        return false;
      });
      setBulletColors(newColors);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref, data.length]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 10%', 'end 40%'],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const defaultColor = isDark ? '#1F2937' : '#E5E7EB';

  return (
    <div className="w-full font-sans md:px-10" ref={containerRef}>
      <div className="mx-auto w-full py-12 text-center">
        <h2 className="mb-4 text-center text-3xl font-bold text-black md:text-6xl dark:text-white">
          Our Legacy
        </h2>
        <p className="text-md mt-10 text-center text-neutral-700 md:text-base dark:text-neutral-500">
          From small beginnings to steady momentum, scroll through the years that built this place.
        </p>
      </div>
      <div ref={ref} className="relative mx-auto max-w-7xl pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className="flex justify-start pt-10 md:gap-10 md:pt-40"
          >
            <div className="sticky top-40 z-40 flex max-w-xs flex-col items-center self-start md:w-full md:flex-row lg:max-w-sm">
              <div className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white md:left-3 dark:bg-black">
                <motion.div
                  className="h-4 w-4 rounded-full border border-neutral-300 p-2 dark:border-neutral-700"
                  animate={{ backgroundColor: bulletColors[index] ? '#eab308' : defaultColor }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <h3 className="hidden font-[family-name:var(--font-space-mono)] text-xl font-bold text-neutral-500 md:block md:pl-20 md:text-5xl dark:text-neutral-500">
                {item.title}
              </h3>
            </div>

            <div className="relative w-full pr-4 pl-20 md:pl-4">
              <h3 className="mb-4 block text-left font-[family-name:var(--font-space-mono)] text-2xl font-bold text-neutral-500 md:hidden dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}{' '}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + 'px',
          }}
          className="absolute top-0 left-8 w-[2px] overflow-hidden bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] md:left-8 dark:via-neutral-700"
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0 w-[2px] rounded-full bg-gradient-to-t from-yellow-500 from-[0%] via-orange-500 via-[10%] to-transparent"
          />
        </div>
      </div>
    </div>
  );
};
