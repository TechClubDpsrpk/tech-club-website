'use client';
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import EmblaCarousel from './hero/EmblaCarousel';
import { EmblaOptionsType } from 'embla-carousel';
import './hero/embla.css';

const OPTIONS: EmblaOptionsType = { loop: true };
const SLIDE_COUNT = 5;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

const Hero = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Slower scroll effect
  const ySlow = useTransform(scrollYProgress, [1, 0], ['30%', '-30%']);

  return (
    <div className="flex min-h-[calc(100vh-128px)] flex-col" ref={containerRef}>
      <div className="h-20" />

      {/* 🔁 Nested motion divs for fade-in + scroll parallax */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(12px)', y: 50 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-grow items-center justify-center"
      >
        <motion.div style={{ y: ySlow }} className="w-full">
          <EmblaCarousel slides={SLIDES} options={OPTIONS} />
        </motion.div>
      </motion.div>

      {/* 📦 CTA section */}
      <div className="z-10 flex flex-shrink-0 flex-col items-center justify-between gap-4 bg-zinc-800 p-8 md:flex-row">
        <p className="font-semibold text-white md:max-w-md">
          Welcome to our school tech club – where we pretend to fix things we broke ourselves. It's
          chaotic brilliance at its finest.
        </p>

        <button className="group relative flex w-full items-center justify-center overflow-hidden border border-transparent bg-yellow-500 px-6 py-3 font-[family-name:var(--font-space-mono)] text-sm text-black hover:border-[#fac924] hover:bg-black hover:text-[#fac924] hover:underline md:w-96">
          <span className="relative z-10 flex items-center gap-2">
            JOIN US <ArrowRight width={16} height={16} />
          </span>
        </button>
      </div>
    </div>
  );
};

export default Hero;
