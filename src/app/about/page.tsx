'use client';

import React from 'react';
import { GlareCard } from '@/components/ui/glare-card';
import Image from 'next/image';

export default function AboutTechClub() {
  return (
    <section className="flex min-h-screen flex-col items-center rounded-xl bg-black px-6 py-24 text-white md:px-18 lg:px-42">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Glare Card with Logo */}
        <GlareCard className="flex items-center justify-center bg-[#202225]">
          <Image
            src={'/card.svg'}
            alt="Tech Club Logo"
            width={512}
            height={512}
            className="h-96 w-96 rounded-full object-cover transition-transform duration-500 hover:scale-110"
            style={{ transformStyle: 'preserve-3d' }}
          />
        </GlareCard>

        {/* Heading */}
        <h1 className="mt-10 font-[family-name:var(--font-vt)] text-4xl font-extrabold tracking-tight md:text-5xl">
          About Tech Club
        </h1>

        {/* Description */}
        <p className="mt-6 font-[family-name:var(--font-space-mono)] text-sm leading-relaxed text-zinc-400">
          Welcome to Tech Club — where sleep schedules go to die, and bugs mysteriously disappear
          just before demo day. We&apos;re a group of caffeine-powered keyboard mashers who claim to
          &quot;innovate,&quot; &quot;build,&quot; and &quot;collaborate&quot; — mostly by arguing
          over dark mode vs. light mode.
        </p>

        <p className="mt-4 font-[family-name:var(--font-space-mono)] text-sm text-zinc-400">
          We specialize in turning perfectly good weekends into frantic hackathons and pretending to
          understand what half the buzzwords actually mean. AI? Blockchain? Quantum pizza delivery?
          Sure, why not. If it&apos;s trendy and barely stable, we&apos;re into it.
        </p>

        <p className="mt-4 font-[family-name:var(--font-space-mono)] text-sm text-zinc-400">
          If you&apos;ve ever broken production at 2AM and called it a &quot;learning
          experience,&quot; or declared a figma wireframe &quot;done&quot; because you&apos;re out
          of coffee — congratulations, you&apos;re one of us.
        </p>
      </div>
    </section>
  );
}
