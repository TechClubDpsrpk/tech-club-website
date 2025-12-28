'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HyperText } from '../magicui/hyper-text';
import { Palette, BrainCircuit, CodeXml, Cpu, Gamepad2, BookOpenText } from 'lucide-react';
import { RetroGrid } from '../magicui/retro-grid';

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

  const xFast = useTransform(scrollYProgress, [0, 1], ['10%', '-15%']);
  const ySlow = useTransform(scrollYProgress, [1, 0], ['7.5%', '-7.5%']);

  return (
    <section
      ref={targetRef}
      {...props}
      className={`relative min-h-screen overflow-hidden bg-[#dfe1d7] px-6 pt-20 pb-24 md:px-24 ${className ?? ''}`}
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
          <span className="inline-block pr-16">TECH FOR EVERYONE →</span>
        </motion.div>

        <div className="my-5" />

        {/* === Main Grid === */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Left text */}
          <div className="flex items-center justify-center text-zinc-700">
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
          <div className="mx-auto flex max-w-xl scale-105 flex-col items-start gap-2 text-[#444]">
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
