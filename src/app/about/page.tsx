'use client';

import React from 'react';
import { GlareCard } from '@/components/ui/glare-card';
import Image from 'next/image';
import { motion } from 'framer-motion';

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

const MemberCard = ({
  member,
  role,
}: {
  member: { name: string; image: string; role?: string };
  role?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center"
  >
    <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-yellow-400 bg-gray-800 sm:h-20 sm:w-20 sm:border-3 lg:h-24 lg:w-24 lg:border-4">
      <Image
        src={member.image}
        alt={member.name}
        width={96}
        height={96}
        className="h-full w-full object-cover"
        unoptimized
      />
    </div>
    <div className="mt-1 max-w-[80px] text-center sm:mt-2 sm:max-w-[100px]">
      <p className="font-[family-name:var(--font-space-mono)] text-[10px] leading-tight text-white sm:text-xs lg:text-sm">
        {member.name}
      </p>
      {(role || member.role) && (
        <p className="font-[family-name:var(--font-vt)] text-[10px] text-yellow-400 sm:text-[12px] lg:text-sm">
          {role || member.role}
        </p>
      )}
    </div>
  </motion.div>
);

const VerticalLine = ({ height = 'h-12' }: { height?: string }) => (
  <div className={`mx-auto w-0.5 bg-yellow-400 ${height}`} />
);

const VerticalLineMobile = ({ height = 'h-6' }: { height?: string }) => (
  <div className={`mx-auto w-0.5 bg-yellow-400 ${height}`} />
);

const TJunction = () => (
  <div className="relative h-16 w-full">
    <div className="absolute top-0 left-1/2 h-8 w-0.5 -translate-x-1/2 bg-yellow-400" />
    <div className="absolute top-8 right-1/4 left-1/4 h-0.5 bg-yellow-400" />
    <div className="absolute top-8 left-1/4 h-8 w-0.5 bg-yellow-400" />
    <div className="absolute top-8 right-1/4 h-8 w-0.5 bg-yellow-400" />
  </div>
);

const FourWaySplit = () => (
  <div className="relative h-16 w-full">
    <div className="absolute top-0 left-1/2 h-8 w-0.5 -translate-x-1/2 bg-yellow-400" />
    <div className="absolute top-8 right-[70px] left-[78px] h-0.5 bg-yellow-400" />
    <div className="absolute top-8 left-[12.5%] h-8 w-0.5 bg-yellow-400" />
    <div className="absolute top-8 left-[37.5%] h-8 w-0.5 bg-yellow-400" />
    <div className="absolute top-8 left-[62%] h-8 w-0.5 bg-yellow-400" />
    <div className="absolute top-8 left-[88.5%] h-8 w-0.5 bg-yellow-400" />
  </div>
);

export default function AboutTechClub() {
  return (
    <>
      <section className="flex min-h-screen flex-col items-center rounded-xl px-6 pt-24 pb-16 text-white md:px-18 lg:px-42">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
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

          <h1 className="mt-16 mb-8 font-[family-name:monospace] text-5xl font-medium tracking-tight md:text-6xl">
            About Tech Club
          </h1>

          <p className="mt-6 font-[family-name:var(--font-space-mono)] leading-relaxed text-zinc-300">
            Welcome to Tech Club — where sleep schedules go to die, and bugs mysteriously disappear
            just before demo day. We&apos;re a group of caffeine-powered keyboard mashers who claim
            to &quot;innovate,&quot; &quot;build,&quot; and &quot;collaborate&quot; — mostly by
            arguing over dark mode vs. light mode.
          </p>

          <p className="mt-4 font-[family-name:var(--font-space-mono)] text-[15px] text-zinc-300">
            We specialize in turning perfectly good weekends into frantic hackathons and pretending
            to understand what half the buzzwords actually mean. AI? Blockchain? Quantum pizza
            delivery? Sure, why not. If it&apos;s trendy and barely stable, we&apos;re into it.
          </p>

          <p className="mt-4 font-[family-name:var(--font-space-mono)] text-zinc-300">
            If you&apos;ve ever broken production at 2AM and called it a &quot;learning
            experience,&quot; or declared a figma wireframe &quot;done&quot; because you&apos;re out
            of coffee — congratulations, you&apos;re one of us.
          </p>
        </div>
      </section>
      <section className="min-h-screen px-6 pt-24 pb-20 text-white md:px-18 lg:px-42">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center sm:mb-12">
            <h2 className="font-[family-name:monospace] text-4xl font-medium tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
              TECH CLUB BOARD 2025–26
            </h2>
            <p className="mt-2 font-[family-name:var(--font-space-mono)] text-xs text-zinc-400 sm:mt-4 sm:text-sm lg:text-base">
              Passionate minds crafting innovation, code, and design.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center space-y-0 sm:mt-16">
            <MemberCard member={teamStructure.president} role="President" />
            <VerticalLine height="h-4" />
            <VerticalLineMobile height="h-1" />

            <MemberCard member={teamStructure.vicePresident} role="Vice President" />
            <VerticalLine height="h-4" />
            <VerticalLineMobile height="h-1" />

            {/* Desktop Layout */}
            <div className="relative hidden w-full lg:block">
              <TJunction />

              <div className="flex items-start justify-center">
                <div className="flex w-1/2 flex-col items-center">
                  <div className="rounded-full border-2 border-yellow-400 bg-gray-900 px-6 py-2">
                    <p className="text-md font-[family-name:var(--font-vt)] text-yellow-400">
                      MENTORS
                    </p>
                  </div>
                  <VerticalLine height="h-8" />

                  <div className="grid grid-cols-3 gap-x-12 gap-y-8">
                    {teamStructure.mentors.map((mentor, idx) => (
                      <MemberCard key={idx} member={mentor} />
                    ))}
                  </div>
                </div>

                <div className="flex w-1/2 flex-col items-center">
                  <div className="relative h-16 w-full">
                    <div className="absolute top-0 right-[202px] left-[200px] h-0.5 bg-yellow-400" />
                    <div className="absolute top-0 left-[200px] h-16 w-0.5 bg-yellow-400" />
                    <div className="absolute top-0 right-[202px] h-16 w-0.5 bg-yellow-400" />
                  </div>

                  <div className="flex w-full justify-center gap-24">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full border-2 border-yellow-400 bg-gray-900 px-4 py-2">
                        <p className="font-[family-name:var(--font-vt)] text-sm whitespace-nowrap text-yellow-400">
                          OFFSTAGE EXECUTIVE
                        </p>
                      </div>
                      <VerticalLine height="h-6" />
                      <MemberCard member={teamStructure.offstageExecutives[0]} />
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="rounded-full border-2 border-yellow-400 bg-gray-900 px-4 py-2">
                        <p className="font-[family-name:var(--font-vt)] text-sm whitespace-nowrap text-yellow-400">
                          OFFSTAGE EXECUTIVE
                        </p>
                      </div>
                      <VerticalLine height="h-8" />
                      <MemberCard member={teamStructure.offstageExecutives[1]} />
                    </div>
                  </div>

                  <VerticalLine height="h-12" />

                  <div className="w-full">
                    <FourWaySplit />

                    <div className="flex justify-between px-4">
                      {teamStructure.creativeHeads.map((head, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <div className="rounded-full border-2 border-yellow-400 bg-gray-900 px-3 py-2">
                            <p className="font-[family-name:var(--font-vt)] text-[11px] whitespace-nowrap text-yellow-400">
                              {head.role === 'Video'
                                ? 'CREATIVE HEAD (VIDEO)'
                                : head.role === 'Graphics'
                                  ? 'CREATIVE HEAD (GRAPHICS)'
                                  : 'PR EXECUTIVE'}
                            </p>
                          </div>
                          <VerticalLine height="h-8" />
                          <MemberCard member={head} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="w-full space-y-8 lg:hidden">
              <div className="flex flex-col items-center">
                <div className="rounded-full border-2 border-yellow-400 bg-gray-900 px-4 py-1.5 sm:px-6 sm:py-2">
                  <p className="font-[family-name:var(--font-vt)] text-xs font-bold text-yellow-400 sm:text-sm">
                    MENTORS
                  </p>
                </div>
                <VerticalLineMobile height="h-6" />

                <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 sm:gap-x-8">
                  {teamStructure.mentors.map((mentor, idx) => (
                    <MemberCard key={idx} member={mentor} />
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <div className="rounded-full border-2 border-yellow-400 bg-gray-900 px-3 py-1.5 sm:px-4 sm:py-2">
                  <p className="font-[family-name:var(--font-vt)] text-xs font-bold text-yellow-400 sm:text-sm">
                    OFFSTAGE EXECUTIVES
                  </p>
                </div>
                <div className="flex gap-8 sm:gap-12">
                  {teamStructure.offstageExecutives.map((exec, idx) => (
                    <MemberCard key={idx} member={exec} />
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="rounded-full border-2 border-yellow-400 bg-gray-900 px-3 py-1.5 sm:px-4 sm:py-2">
                  <p className="font-[family-name:var(--font-vt)] text-xs font-bold text-yellow-400 sm:text-sm">
                    CREATIVE TEAM
                  </p>
                </div>
                <VerticalLineMobile height="h-6" />

                <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                  {teamStructure.creativeHeads.map((head, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="mb-2 rounded-full border border-yellow-400 bg-gray-900 px-2 py-1">
                        <p className="text-center font-[family-name:var(--font-vt)] text-[8px] font-bold text-yellow-400 sm:text-[10px]">
                          {head.role === 'Video'
                            ? 'VIDEO'
                            : head.role === 'Graphics'
                              ? 'GRAPHICS'
                              : 'PR'}
                        </p>
                      </div>
                      <MemberCard member={head} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developers Section - Separate */}
      <section className="min-h-[50vh] px-6 py-20 text-white md:px-18 lg:px-42">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-[family-name:monospace] text-4xl font-medium tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
              THE BACKSTAGE
            </h2>
            <p className="mt-4 font-[family-name:var(--font-space-mono)] text-xs text-zinc-400 sm:text-sm lg:text-base">
              The people behind the website
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {/* Agnihotra Das */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="flex flex-col items-center rounded-2xl border-2 border-yellow-400 bg-gray-900/50 p-6 backdrop-blur-sm transition-all hover:scale-105 hover:border-yellow-300 hover:shadow-xl hover:shadow-yellow-400/20"
            >
              <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-yellow-400">
                <Image
                  src="/team/agnihotra.png"
                  alt="Agnihotra Nath"
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              <h3 className="font-[family-name:var(--font-space-mono)] text-lg font-semibold text-white">
                Agnihotra Nath
              </h3>
              <p className="font-[family-name:var(--font-vt)] text-[15px] text-zinc-400 text-center">
                Senior Member 2025-26
              </p>
              <p className="mt-2 font-[family-name:var(--font-vt)] text-sm text-yellow-400">
                Design
              </p>
            </motion.div>

            {/* Adiya Roy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col items-center rounded-2xl border-2 border-yellow-400 bg-gray-900/50 p-6 backdrop-blur-sm transition-all hover:scale-105 hover:border-yellow-300 hover:shadow-xl hover:shadow-yellow-400/20"
            >
              <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-yellow-400">
                <Image
                  src="/team/adiya.jpeg"
                  alt="Adiya Roy"
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              <h3 className="font-[family-name:var(--font-space-mono)] text-lg font-semibold text-white">
                Adiya Roy
              </h3>
              <p className="font-[family-name:var(--font-vt)] text-[15px] text-zinc-400 text-center">
                Creative Head 2025-26
              </p>
              <p className="mt-2 font-[family-name:var(--font-vt)] text-sm text-yellow-400">
                Design
              </p>
            </motion.div>

            {/* Naitik Chattaraj */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center rounded-2xl border-2 border-yellow-400 bg-gray-900/50 p-6 backdrop-blur-sm transition-all hover:scale-105 hover:border-yellow-300 hover:shadow-xl hover:shadow-yellow-400/20"
            >
              <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-yellow-400">
                <Image
                  src="/team/naitik.jpeg"
                  alt="Naitik Chattaraj"
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              <h3 className="font-[family-name:var(--font-space-mono)] text-lg font-semibold text-white">
                Naitik Chattaraj
              </h3>
              <p className="font-[family-name:var(--font-vt)] text-[15px] text-center text-zinc-400">
                Executive 2025-26
              </p>
              <p className="mt-2 font-[family-name:var(--font-vt)] text-sm text-yellow-400">
                Backend
              </p>
            </motion.div>

            {/* Rishabh Das */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center rounded-2xl border-2 border-yellow-400 bg-gray-900/50 p-6 backdrop-blur-sm transition-all hover:scale-105 hover:border-yellow-300 hover:shadow-xl hover:shadow-yellow-400/20"
            >
              <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-yellow-400">
                <Image
                  src="/team/rishabh.jpeg"
                  alt="Rishabh Das"
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              <h3 className="font-[family-name:var(--font-space-mono)] text-lg font-semibold text-white">
                Rishabh Das
              </h3>
              <p className="font-[family-name:var(--font-vt)] text-[15px] text-center text-zinc-400">
                Executive 2025-26
              </p>
              <p className="mt-2 font-[family-name:var(--font-vt)] text-sm text-yellow-400">
                Frontend
              </p>
            </motion.div>

            {/* Biraja */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col items-center rounded-2xl border-2 border-yellow-400 bg-gray-900/50 p-6 backdrop-blur-sm transition-all hover:scale-105 hover:border-yellow-300 hover:shadow-xl hover:shadow-yellow-400/20"
            >
              <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border-4 border-yellow-400">
                <Image
                  src="/team/biraja.jpeg"
                  alt="Biraja Prasad Pradhan"
                  width={128}
                  height={128}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              <h3 className="font-[family-name:var(--font-space-mono)] text-lg font-semibold text-white">
                Biraja Prasad Pradhan
              </h3>
              <p className="font-[family-name:var(--font-vt)] text-[15px] text-center text-zinc-400">
                Senior Member 2025-26
              </p>
              <p className="mt-2 font-[family-name:var(--font-vt)] text-sm text-yellow-400">
                Basic Framework
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}