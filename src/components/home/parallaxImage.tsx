'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

interface ParallaxImageProps {
  src: string;
  alt: string;
}

export const ParallaxImage: React.FC<ParallaxImageProps> = ({ src, alt }) => {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);

  return (
    <div ref={ref} className="relative h-[300px] overflow-hidden shadow-lg">
      <motion.div style={{ y }} className="h-full w-full overflow-hidden">
        <div className="relative h-full w-full">
          <Image src={src} fill className="object-cover" alt={alt} priority />
        </div>
      </motion.div>
    </div>
  );
};
