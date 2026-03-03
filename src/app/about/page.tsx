'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { GlareCard } from '@/components/ui/glare-card';
import Image from 'next/image';

// ─── Stat Counter ─────────────────────────────────────────────────────────────
function StatCounter({ end, suffix = '', label }: { end: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (1400 / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);

  return (
    <div ref={ref} className="flex flex-col items-start">
      <span className="font-mono text-4xl font-bold text-[#fac71e] tabular-nums md:text-5xl">
        {count}
        {suffix}
      </span>
      <span className="mt-1 font-mono text-[10px] tracking-[0.2em] text-zinc-600 uppercase">
        {label}
      </span>
    </div>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────
const MemberCard = ({
  member,
  role,
}: {
  member: { name: string; image: string; role?: string };
  role?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.85 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.45 }}
    className="flex flex-col items-center"
  >
    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-[#fac71e] bg-zinc-900 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
      <Image
        src={member.image}
        alt={member.name}
        width={96}
        height={96}
        className="h-full w-full object-cover"
        unoptimized
      />
    </div>
    <div className="mt-2 max-w-[80px] text-center sm:max-w-[100px]">
      <p className="font-mono text-[10px] leading-tight text-white sm:text-xs">{member.name}</p>
      {(role || member.role) && (
        <p className="mt-0.5 font-mono text-[9px] text-[#fac71e] sm:text-[11px]">
          {role || member.role}
        </p>
      )}
    </div>
  </motion.div>
);

// ─── Connector Lines ──────────────────────────────────────────────────────────
const VLine = ({ height = 'h-10' }: { height?: string }) => (
  <div className={`mx-auto w-px bg-[#fac71e]/60 ${height}`} />
);

const TJunction = () => (
  <div className="relative h-14 w-full">
    <div className="absolute top-0 left-1/2 h-7 w-px -translate-x-1/2 bg-[#fac71e]/60" />
    <div className="absolute top-7 right-1/4 left-1/4 h-px bg-[#fac71e]/60" />
    <div className="absolute top-7 left-1/4 h-7 w-px bg-[#fac71e]/60" />
    <div className="absolute top-7 right-1/4 h-7 w-px bg-[#fac71e]/60" />
  </div>
);

const FourWaySplit = () => (
  <div className="relative h-14 w-full">
    <div className="absolute top-0 left-1/2 h-7 w-px -translate-x-1/2 bg-[#fac71e]/60" />
    <div className="absolute top-7 right-[70px] left-[78px] h-px bg-[#fac71e]/60" />
    <div className="absolute top-7 left-[12.5%] h-7 w-px bg-[#fac71e]/60" />
    <div className="absolute top-7 left-[37.5%] h-7 w-px bg-[#fac71e]/60" />
    <div className="absolute top-7 left-[62%] h-7 w-px bg-[#fac71e]/60" />
    <div className="absolute top-7 left-[88.5%] h-7 w-px bg-[#fac71e]/60" />
  </div>
);

// ─── Role Pill ────────────────────────────────────────────────────────────────
const RolePill = ({ label }: { label: string }) => (
  <div className="rounded-full border border-[#fac71e]/40 bg-[#fac71e]/5 px-4 py-1.5">
    <p className="font-mono text-[10px] tracking-widest whitespace-nowrap text-[#fac71e] uppercase sm:text-xs">
      {label}
    </p>
  </div>
);

// ─── Developer Card ───────────────────────────────────────────────────────────
const DevCard = ({
  src,
  alt,
  name,
  role,
  title,
  delay,
}: {
  src: string;
  alt: string;
  name: string;
  role: string;
  title: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="group relative flex flex-col items-center border border-zinc-800 p-6 transition-colors duration-300 hover:border-[#fac71e]/40"
  >
    <div className="absolute bottom-0 left-0 h-px w-0 bg-[#fac71e] transition-all duration-300 group-hover:w-full" />
    <div className="relative mb-4 h-28 w-28 overflow-hidden rounded-full border-2 border-[#fac71e]/60 transition-colors duration-300 group-hover:border-[#fac71e]">
      <Image
        src={src}
        alt={alt}
        width={112}
        height={112}
        className="h-full w-full object-cover"
        unoptimized
      />
    </div>
    <h3 className="font-mono text-sm font-semibold text-white">{name}</h3>
    <p className="mt-1 text-center font-mono text-[11px] text-zinc-500">{title}</p>
    <p className="mt-2 font-mono text-xs text-[#fac71e]">{role}</p>
  </motion.div>
);

// ─── Team structure data ──────────────────────────────────────────────────────
const teamStructure = {
  president: { name: 'arghya sarkar', role: 'President', image: '/team/arghya.jpeg' },
  vicePresident: { name: 'ankush roy', role: 'Vice President', image: '/team/ankush.png' },
  mentors: [
    { name: 'anshuman tripathi', image: '/team/anshuman.jpeg' },
    { name: 'avanindra chakraborty', image: '/team/avanindra.jpeg' },
    { name: 'naitik chattaraj', image: '/team/naitik.jpeg' },
    { name: 'parthiv pal', image: '/team/parthiv.jpg' },
    { name: 'rishabh das', image: '/team/rishabh.jpeg' },
    { name: 'sampreet roy', image: '/team/sampreet.png' },
    { name: 'shameek dalal', image: '/team/shameek.jpg' },
    { name: 'soham sen', image: '/team/soham.jpg' },
    { name: 'soumili dey', image: '/team/soumili.jpg' },
  ],
  offstageExecutives: [
    { name: 'aryaka sikdar', image: '/team/aryaka.jpeg' },
    { name: 'swapnil basu', image: '/team/swapnil.JPG' },
  ],
  creativeHeads: [
    { name: 'adiya roy', role: 'Graphics', image: '/team/adiya.jpeg' },
    { name: 'aritro sen', role: 'PR Executive', image: '/team/aritro.jpg' },
    { name: 'niharika paul', role: 'Graphics', image: '/team/niharika.jpeg' },
    { name: 'prithuraj saha', role: 'Video', image: '/team/prithuraj.jpg' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
export default function AboutTechClub() {
  return (
    <div className="bg-black text-white">
      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>

      {/* ═══════════════════════════════════════════════
          SECTION 1 — ABOUT HEADER (compact, no hero)
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-zinc-900 pt-24 pb-16 md:pt-32 md:pb-20">
        {/* Grid bg */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(250,199,30,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(250,199,30,1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Orb */}
        <div
          className="pointer-events-none absolute -top-32 right-0 h-[500px] w-[500px] opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #fac71e 0%, transparent 70%)' }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">
          {/* Meta top row */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex items-center justify-between font-mono text-xs tracking-widest text-zinc-600 uppercase"
          >
            <span>Tech Club | DPSRPK</span>
            <span>Est. 2017</span>
          </motion.div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16 lg:gap-24">
            {/* Left — headline + description */}
            <div>
              {/* Label pill */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#fac71e]/30 bg-[#fac71e]/5 px-4 py-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#fac71e]" />
                <span className="font-mono text-[10px] tracking-[0.25em] text-[#fac71e] uppercase">
                  Who we are
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="font-mono text-5xl leading-none font-bold tracking-tight uppercase md:text-6xl lg:text-7xl"
              >
                About
                <br />
                <span className="text-[#fac71e]">Tech</span>
                <br />
                Club
              </motion.h1>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
                className="my-7 h-px origin-left bg-gradient-to-r from-[#fac71e] via-zinc-700 to-transparent"
              />

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.65 }}
                className="max-w-sm font-mono text-sm leading-relaxed text-zinc-400"
              >
                Where sleep schedules go to die, and bugs mysteriously disappear just before demo
                day. A community of <span className="text-white">builders</span>,{' '}
                <span className="text-white">breakers</span>, and{' '}
                <span className="text-[#fac71e]">accidental inventors</span> — powered by caffeine
                and curiosity.
              </motion.p>
            </div>

            {/* Right — stat grid + blurb cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-col justify-between gap-10"
            >
              {/* Stats */}
              <div className="flex flex-wrap gap-10 border-l border-zinc-800 pl-10">
                <StatCounter end={8} suffix="+" label="Years Running" />
                <StatCounter end={6} label="Departments" />
                <StatCounter end={150} suffix="+" label="Members" />
              </div>

              {/* Three blurb cards */}
              <div className="space-y-3">
                {[
                  {
                    num: '01',
                    text: "Turning perfectly good weekends into frantic hackathons. AI? Blockchain? Quantum pizza delivery? If it's trendy and barely stable — we're into it.",
                  },
                  {
                    num: '02',
                    text: 'Breaking production at 2AM and calling it a "learning experience." Declaring Figma wireframes done because you\'re out of coffee? You\'re one of us.',
                  },
                  {
                    num: '03',
                    text: "We debate hard — dark mode vs light mode, tabs vs spaces — and ship harder. That's the tech club way.",
                  },
                ].map(({ num, text }, i) => (
                  <motion.div
                    key={num}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 + i * 0.12 }}
                    className="group flex gap-4 border border-zinc-800/80 p-4 transition-colors hover:border-[#fac71e]/30"
                  >
                    <span className="shrink-0 pt-0.5 font-mono text-xs text-zinc-700 transition-colors group-hover:text-[#fac71e]/50">
                      {num}
                    </span>
                    <p className="font-mono text-sm leading-relaxed text-zinc-400">{text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Marquee strip */}
        <div className="relative mt-16 overflow-hidden border-t border-zinc-900 py-3">
          <div
            className="flex whitespace-nowrap"
            style={{ animation: 'marquee 22s linear infinite' }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-8 pr-8 font-mono text-[12px] tracking-[0.3em] text-zinc-600 uppercase"
              >
                <span>AI</span>
                <span className="text-[#fac71e]">◈</span>
                <span>Design</span>
                <span className="text-[#fac71e]">◈</span>
                <span>Robotics</span>
                <span className="text-[#fac71e]">◈</span>
                <span>Programming</span>
                <span className="text-[#fac71e]">◈</span>
                <span>Development</span>
                <span className="text-[#fac71e]">◈</span>
                <span>Gaming</span>
                <span className="text-[#fac71e]">◈</span>
                <span>Editorial</span>
                <span className="text-[#fac71e]">◈</span>
                <span>Innovation</span>
                <span className="text-[#fac71e]">◈</span>
                <span>Community</span>
                <span className="text-[#fac71e]">◈</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 2 — BOARD 2025-26
      ═══════════════════════════════════════════════ */}
      <section className="relative px-6 py-20 md:px-12 md:py-28">
        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(250,199,30,1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(250,199,30,1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        <div className="relative mx-auto max-w-7xl">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="mb-3 font-mono text-[10px] tracking-widest text-[#fac71e] uppercase">
                ◈ Leadership
              </p>
              <h2 className="font-mono text-4xl font-bold tracking-tight uppercase md:text-5xl">
                Tech Club Board
                <br />
                <span className="text-zinc-600">2025–26</span>
              </h2>
            </div>
            <p className="max-w-xs font-mono text-xs leading-relaxed text-zinc-600">
              Passionate minds crafting innovation, code, and design.
            </p>
          </motion.div>

          {/* Org chart */}
          <div className="flex flex-col items-center">
            <MemberCard member={teamStructure.president} role="President" />
            <VLine height="h-8" />
            <MemberCard member={teamStructure.vicePresident} role="Vice President" />
            <VLine height="h-8" />

            {/* ── Desktop layout ── */}
            <div className="relative hidden w-full lg:block">
              <TJunction />
              <div className="flex items-start justify-center gap-0">
                {/* Mentors */}
                <div className="flex w-1/2 flex-col items-center">
                  <RolePill label="Mentors" />
                  <VLine height="h-8" />
                  <div className="grid grid-cols-3 gap-x-10 gap-y-8">
                    {teamStructure.mentors.map((m, i) => (
                      <MemberCard key={i} member={m} />
                    ))}
                  </div>
                </div>

                {/* Right branch */}
                <div className="flex w-1/2 flex-col items-center">
                  <div className="relative h-14 w-full">
                    <div className="absolute top-0 right-[202px] left-[200px] h-px bg-[#fac71e]/60" />
                    <div className="absolute top-0 left-[200px] h-14 w-px bg-[#fac71e]/60" />
                    <div className="absolute top-0 right-[202px] h-14 w-px bg-[#fac71e]/60" />
                  </div>
                  <div className="flex w-full justify-center gap-20">
                    {teamStructure.offstageExecutives.map((exec, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <RolePill label="Offstage Executive" />
                        <VLine height="h-6" />
                        <MemberCard member={exec} />
                      </div>
                    ))}
                  </div>
                  <VLine height="h-10" />
                  <div className="w-full">
                    <FourWaySplit />
                    <div className="flex justify-between px-4">
                      {teamStructure.creativeHeads.map((head, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <RolePill
                            label={
                              head.role === 'Video'
                                ? 'Creative (Video)'
                                : head.role === 'Graphics'
                                  ? 'Creative (Graphics)'
                                  : 'PR Executive'
                            }
                          />
                          <VLine height="h-6" />
                          <MemberCard member={head} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Mobile layout ── */}
            <div className="w-full space-y-10 lg:hidden">
              <div className="flex flex-col items-center">
                <RolePill label="Mentors" />
                <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
                  {teamStructure.mentors.map((m, i) => (
                    <MemberCard key={i} member={m} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-6">
                <RolePill label="Offstage Executives" />
                <div className="flex gap-10">
                  {teamStructure.offstageExecutives.map((exec, i) => (
                    <MemberCard key={i} member={exec} />
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center">
                <RolePill label="Creative Team" />
                <div className="mt-6 grid grid-cols-2 gap-6">
                  {teamStructure.creativeHeads.map((head, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <span className="font-mono text-[9px] tracking-widest text-[#fac71e] uppercase">
                        {head.role}
                      </span>
                      <MemberCard member={head} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      </div>

      {/* ═══════════════════════════════════════════════
          SECTION 3 — THE BACKSTAGE (Developers)
      ═══════════════════════════════════════════════ */}
      <section className="relative px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-7xl">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
          >
            <div>
              <p className="mb-3 font-mono text-[10px] tracking-widest text-[#fac71e] uppercase">
                ◈ Behind the scenes
              </p>
              <h2 className="font-mono text-4xl font-bold tracking-tight uppercase md:text-5xl">
                The Backstage
              </h2>
            </div>
            <p className="max-w-xs font-mono text-xs leading-relaxed text-zinc-600">
              The people behind the website.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <DevCard
              src="/team/agnihotra.png"
              alt="Agnihotra Nath"
              name="Agnihotra Nath"
              title="Senior Member 2025-26"
              role="Design"
              delay={0}
            />
            <DevCard
              src="/team/adiya.jpeg"
              alt="Adiya Roy"
              name="Adiya Roy"
              title="Creative Head 2025-26"
              role="Design"
              delay={0.08}
            />
            <DevCard
              src="/team/naitik.jpeg"
              alt="Naitik Chattaraj"
              name="Naitik Chattaraj"
              title="Executive 2025-26"
              role="Backend"
              delay={0.16}
            />
            <DevCard
              src="/team/rishabh.jpeg"
              alt="Rishabh Das"
              name="Rishabh Das"
              title="Executive 2025-26"
              role="Frontend"
              delay={0.24}
            />
            <DevCard
              src="/team/biraja.jpeg"
              alt="Biraja Prasad Pradhan"
              name="Biraja Prasad Pradhan"
              title="Senior Member 2025-26"
              role="Basic Framework"
              delay={0.32}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
