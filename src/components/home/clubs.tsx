'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LineShadowText } from '../magicui/line-shadow-text';
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

  return (
    <section
      ref={targetRef}
      className="relative min-h-screen overflow-hidden bg-[#dfe1d7] px-6 py-20"
    >
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
        <div className="flex items-center justify-center text-lg text-black">
          <p className="max-w-xl leading-relaxed">
            The Tech Club isn't just about code. It's a canvas for innovation, design, and creation.
            Across hardware, AI, gaming, and more — we explore tech with a story, a purpose, and
            precision. Every club is a lens into the future we're building.
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
    </section>
  );
};

export default Clubs;
