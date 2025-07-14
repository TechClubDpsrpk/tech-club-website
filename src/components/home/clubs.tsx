'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { HyperText } from '../magicui/hyper-text';
import { Palette, Brain, Code, Cpu, Gamepad2, BookOpenText } from 'lucide-react';

const clubList = [
  { title: 'Design', icon: Palette },
  { title: 'AI', icon: Brain },
  { title: 'Development', icon: Code },
  { title: 'Hardware', icon: Cpu },
  { title: 'Gaming', icon: Gamepad2 },
  { title: 'Editorial', icon: BookOpenText },
];

const Clubs = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start end', 'end start'],
  });

  const xFast = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);
  const ySlow = useTransform(scrollYProgress, [1, 0], ['30%', '-30%']); // 20% = slower effect

  return (
    <section
      ref={targetRef}
      className="relative min-h-screen overflow-hidden bg-[#dfe1d7] px-6 pt-24 pb-24 md:px-24"
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

        {/* === Spacer === */}
        <div className="my-16" />

        {/* === Main Grid === */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* === Left Text === */}
          <div className="text-md flex items-center justify-center text-zinc-700">
            <p className="max-w-xl leading-5">
              The Tech Club isn&apos;t just about code. It&apos;s a canvas for innovation, design,
              and creation. Across hardware, AI, gaming, and more — we explore tech with a story, a
              purpose, and precision. Every club is a lens into the future we&apos;re building.{' '}
              <br />
              <br />
              From wild prototypes to “totally intentional” bugs that became features, we turn
              caffeine and chaos into actual innovation. Whether you&apos;re designing pixels,
              training rogue AIs, or just pretending to debug while vibing to Lo-fi — this is where
              tech gets personal, loud, and just a bit too ambitious (in the best way).
            </p>
          </div>

          {/* === Right Club List === */}
          <div className="mx-auto flex w-md max-w-xl flex-col items-start gap-2 text-black">
            {clubList.map(({ title, icon: Icon }, index) => (
              <React.Fragment key={title}>
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-[#333]" />
                  <span className="font-[family-name:var(--font-space-mono)] text-sm font-bold uppercase">
                    <HyperText>{title}</HyperText>
                  </span>
                </div>
                {index < clubList.length - 1 && (
                  <div className="h-[1px] w-full bg-black opacity-20" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Clubs;
