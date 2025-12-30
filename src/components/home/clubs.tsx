/* eslint-disable prettier/prettier */
'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HyperText } from '../magicui/hyper-text';
import { Palette, BrainCircuit, CodeXml, Cpu, Gamepad2, BookOpenText } from 'lucide-react';

type ClubsProps = React.HTMLAttributes<HTMLElement>;

const clubList = [
  { title: 'Design', icon: Palette },
  { title: 'AI', icon: BrainCircuit },
  { title: 'Development', icon: CodeXml },
  { title: 'Hardware', icon: Cpu },
  { title: 'Gaming', icon: Gamepad2 },
  { title: 'Editorial', icon: BookOpenText },
];

const Clubs = ({ className, ...props }: ClubsProps) => {
  const targetRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end start'],
  });

  const xFastR = useTransform(scrollYProgress, [0, 1], ['5%', '-10%']);
  const xFastL = useTransform(scrollYProgress, [0, 1], ['-10%', '5%']);
  const ySlow = useTransform(scrollYProgress, [1, 0], ['5%', '-5%']);

  return (
    <section
      ref={targetRef}
      {...props}
      className={`relative overflow-hidden bg-[#dfe1d7] px-6 pb-16 md:px-24 ${className ?? ''}`}
    >
      {/* === Whole Section Parallax Wrapper === */}
      <motion.div style={{ y: ySlow }} className="will-change-transform">
        {/* === Strip 1 - Parallax Left === */}
        <div className="-mt-22 -ml-20 opacity-70">
          {Array.from({ length: 6 }, (_, i) => {
            const pt = i * 12.5;
            const xTransform = i % 2 === 0 ? xFastR : xFastL;
            const opacityClass = i % 2 === 0 ? 'opacity-[10%]' : 'opacity-[6%]';
            const textClass = i % 3 === 0 ? 'text-black' : 'text-yellow-800';
            return (
              <motion.div
                key={i}
                style={{ x: xTransform, paddingTop: `${pt}vh` }}
                className={`fixed text-[6vw] ${textClass} font-bold whitespace-nowrap lowercase ${opacityClass} will-change-transform`}
              >
                {Array.from({ length: 7 }, (_, j) => (
                  <span key={j} className="inline-block pr-8">
                    techclub
                  </span>
                ))}
              </motion.div>
            );
          })}
        </div>

        <div className="my-5" />

        {/* === Main Grid === */}
        <div className="grid grid-cols-1 gap-12 pt-32 lg:grid-cols-2">
          {/* Left text */}
          <div className="flex scale-125 items-center justify-center text-zinc-700">
            <p className="max-w-xl text-lg leading-5">
              The Tech Club isn&apos;t just about code. It&apos;s a canvas for innovation, design,
              and creation. Across hardware, AI, gaming, and more — we explore tech with a story, a
              purpose, and precision.
              <br />
              <br />
              <br />
              From wild prototypes to “totally intentional” bugs that became features, we turn
              caffeine and chaos into actual innovation.
            </p>
          </div>

          {/* Right list */}
          <div className="mx-auto flex max-w-xl scale-110 flex-col items-start gap-2 text-[#444]">
            {clubList.map(({ title, icon: Icon }, index) => (
              <React.Fragment key={title}>
                <div className="flex items-center gap-3 transition-transform hover:scale-110 hover:text-[#222]">
                  <Icon className="h-7 w-7" />
                  <span className="font-[family-name:var(--font-space-mono)] text-lg font-bold uppercase">
                    <HyperText className="text-xl">{title}</HyperText>
                  </span>
                </div>

                {index < clubList.length - 1 && <div className="h-px w-full bg-black/20" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Clubs;
