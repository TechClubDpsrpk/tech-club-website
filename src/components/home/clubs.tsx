'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HyperText } from '../magicui/hyper-text';
import { Palette, Brain, Code, Cpu, Gamepad2, BookOpenText } from 'lucide-react';

type ClubsProps = React.HTMLAttributes<HTMLElement>;

const clubList = [
  { title: 'Design', icon: Palette },
  { title: 'AI', icon: Brain },
  { title: 'Development', icon: Code },
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

  const xFast = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);
  const ySlow = useTransform(scrollYProgress, [1, 0], ['30%', '-30%']);

  return (
    <section
      ref={targetRef}
      {...props}
      className={`relative min-h-screen overflow-hidden bg-[#dfe1d7] px-6 pt-24 pb-24 md:px-24 ${className ?? ''}`}
    >
      {/* === Whole Section Parallax Wrapper === */}
      <motion.div style={{ y: ySlow }} className="will-change-transform">
        {/* === Strip 1 - Parallax Left === */}
        <motion.div
          style={{ x: xFast }}
          className="text-[10vw] font-bold whitespace-nowrap text-black uppercase italic"
        >
          <span className="inline-block pr-16">TECH FOR EVERYONE →</span>
          <span className="inline-block pr-16">TECH FOR EVERYONE →</span>
          <span className="inline-block pr-16">TECH FOR EVERYONE →</span>
        </motion.div>

        <div className="my-16" />

        {/* === Main Grid === */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left text */}
          <div className="flex items-center justify-center text-zinc-700">
            <p className="max-w-xl leading-5">
              The Tech Club isn&apos;t just about code. It&apos;s a canvas for innovation, design,
              and creation. Across hardware, AI, gaming, and more — we explore tech with a story, a
              purpose, and precision.
              <br />
              <br />
              From wild prototypes to “totally intentional” bugs that became features, we turn
              caffeine and chaos into actual innovation.
            </p>
          </div>

          {/* Right list */}
          <div className="mx-auto flex max-w-xl flex-col items-start gap-2 text-black">
            {clubList.map(({ title, icon: Icon }, index) => (
              <React.Fragment key={title}>
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-[#333]" />
                  <span className="font-[family-name:var(--font-space-mono)] text-sm font-bold uppercase">
                    <HyperText>{title}</HyperText>
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
