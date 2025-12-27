'use client';

import React from 'react';
import { motion } from 'framer-motion';

const teamStructure = {
  president: { name: 'arghya Sarkar', role: 'President', image: '/team/arghya.jpeg' },
  vicePresident: { name: 'ankush Roy', role: 'Vice President', image: '/team/ankush.jpg' },
  mentors: [
    { name: 'anshuman tripathi', image: '/team/anshuman.jpg' },
    { name: 'avanindra chakraborty', image: '/team/avanindra.jpg' },
    { name: 'naitik chattaraj', image: '/team/naitik.jpeg' },
    { name: 'parthiv pal', image: '/team/parthiv.jpg' },
    { name: 'rishabh das', image: '/team/rishabh.jpeg' },
    { name: 'sampreet roy', image: '/team/sampreet.jpg' },
    { name: 'shameek dalal', image: '/team/shameek.jpg' },
    { name: 'soham sen', image: '/team/soham.jpg' },
    { name: 'soumili dey', image: '/team/soumili.jpg' },
  ],
  offstageExecutives: [
    { name: 'aryaka sikdar', image: '/team/aryaka.jpeg' },
    { name: 'swapnil basu', image: '/team/swapnil.jpg' },
  ],
  creativeHeads: [
    { name: 'adiya roy', role: 'Graphics', image: '/team/adiya.jpeg' },
    { name: 'aritro sen', role: 'PR Executive', image: '/team/aritro.jpg' },
    { name: 'niharika paul', role: 'Graphics', image: '/team/niharika.jpg' },
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
      <img
        src={member.image}
        alt={member.name}
        className="h-full w-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=fbbf24&color=000&size=96`;
        }}
      />
    </div>
    <div className="mt-1 max-w-[80px] text-center sm:mt-2 sm:max-w-[100px]">
      <p className="font-[family-name:var(--font-space-mono)] text-[10px] leading-tight font-semibold text-white sm:text-xs lg:text-sm">
        {member.name}
      </p>
      {(role || member.role) && (
        <p className="font-[family-name:var(--font-vt)] text-[8px] text-yellow-400 sm:text-[10px] lg:text-xs">
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

// T-junction connector component
const TJunction = () => (
  <div className="relative h-16 w-full">
    {/* Vertical line coming down */}
    <div className="absolute top-0 left-1/2 h-8 w-0.5 -translate-x-1/2 bg-yellow-400" />
    {/* Horizontal line */}
    <div className="absolute top-8 right-1/4 left-1/4 h-0.5 bg-yellow-400" />
    {/* Left vertical line going down */}
    <div className="absolute top-8 left-1/4 h-8 w-0.5 bg-yellow-400" />
    {/* Right vertical line going down */}
    <div className="absolute top-8 right-1/4 h-8 w-0.5 bg-yellow-400" />
  </div>
);

// Four-way split connector for creative heads
const FourWaySplit = () => (
  <div className="relative h-16 w-full">
    {/* Vertical line coming down */}
    <div className="absolute top-0 left-1/2 h-8 w-0.5 -translate-x-1/2 bg-yellow-400" />
    {/* Horizontal line spanning all four positions */}
    <div className="absolute top-8 right-0 left-0 h-0.5 bg-yellow-400" />
    {/* Four vertical lines going down */}
    <div className="absolute top-8 left-[12.5%] h-8 w-0.5 bg-yellow-400" />
    <div className="absolute top-8 left-[37.5%] h-8 w-0.5 bg-yellow-400" />
    <div className="absolute top-8 left-[62.5%] h-8 w-0.5 bg-yellow-400" />
    <div className="absolute top-8 left-[87.5%] h-8 w-0.5 bg-yellow-400" />
  </div>
);

export default function TechClubTeamsPage() {
  return (
    <section className="min-h-screen px-6 py-24 text-white md:px-18 lg:px-42">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center sm:mb-12">
          <h2 className="font-[family-name:var(--font-vt)] text-2xl leading-tight font-extrabold tracking-tight sm:text-4xl lg:text-6xl">
            TECH CLUB BOARD 2025–26
          </h2>
          <p className="mt-2 font-[family-name:var(--font-space-mono)] text-xs text-zinc-400 sm:mt-4 sm:text-sm lg:text-base">
            Passionate minds crafting innovation, code, and design.
          </p>
        </div>

        {/* Flowchart Structure */}
        <div className="mt-8 flex flex-col items-center space-y-0 sm:mt-16">
          {/* President */}
          <MemberCard member={teamStructure.president} role="President" />
          <VerticalLine height="h-4" />
          <VerticalLineMobile height="h-1" />

          {/* Vice President */}
          <MemberCard member={teamStructure.vicePresident} role="Vice President" />
          <VerticalLine height="h-2" />
          <VerticalLineMobile height="h-1" />

          {/* Split into two branches - Desktop */}
          <div className="relative hidden w-full lg:block">
            {/* T-Junction connecting to two branches */}
            <TJunction />

            <div className="flex items-start justify-center">
              {/* Left Branch - Mentors */}
              <div className="flex w-1/2 flex-col items-center">
                <div className="rounded-full border-2 border-yellow-400 bg-gray-900 px-6 py-2">
                  <p className="font-[family-name:var(--font-vt)] text-sm font-bold text-yellow-400">
                    MENTORS
                  </p>
                </div>
                <VerticalLine height="h-8" />

                {/* Mentors Grid - 3x3 */}
                <div className="grid grid-cols-3 gap-x-12 gap-y-8">
                  {teamStructure.mentors.map((mentor, idx) => (
                    <MemberCard key={idx} member={mentor} />
                  ))}
                </div>
              </div>

              {/* Right Branch - Executives */}
              <div className="flex w-1/2 flex-col items-center">
                {/* Offstage Executives with T-junction */}
                <div className="relative h-16 w-full">
                  {/* Horizontal line for two executives */}
                  <div className="absolute top-0 right-1/4 left-1/4 h-0.5 bg-yellow-400" />
                  {/* Left executive line */}
                  <div className="absolute top-0 left-1/4 h-16 w-0.5 bg-yellow-400" />
                  {/* Right executive line */}
                  <div className="absolute top-0 right-1/4 h-16 w-0.5 bg-yellow-400" />
                </div>

                <div className="flex w-full justify-center gap-24">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full border-2 border-yellow-400 bg-gray-900 px-4 py-2">
                      <p className="font-[family-name:var(--font-vt)] text-xs font-bold whitespace-nowrap text-yellow-400">
                        OFFSTAGE EXECUTIVE
                      </p>
                    </div>
                    <VerticalLine height="h-8" />
                    <MemberCard member={teamStructure.offstageExecutives[0]} />
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="rounded-full border-2 border-yellow-400 bg-gray-900 px-4 py-2">
                      <p className="font-[family-name:var(--font-vt)] text-xs font-bold whitespace-nowrap text-yellow-400">
                        OFFSTAGE EXECUTIVE
                      </p>
                    </div>
                    <VerticalLine height="h-8" />
                    <MemberCard member={teamStructure.offstageExecutives[1]} />
                  </div>
                </div>

                <VerticalLine height="h-12" />

                {/* Four-way split for creative heads */}
                <div className="w-full">
                  <FourWaySplit />

                  {/* Creative Heads Row */}
                  <div className="flex justify-between px-4">
                    {teamStructure.creativeHeads.map((head, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="rounded-full border-2 border-yellow-400 bg-gray-900 px-3 py-2">
                          <p className="font-[family-name:var(--font-vt)] text-[10px] font-bold whitespace-nowrap text-yellow-400">
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

          {/* Mobile/Tablet Layout */}
          <div className="w-full space-y-8 lg:hidden">
            {/* Mentors Section */}
            <div className="flex flex-col items-center">
              <div className="rounded-full border-2 border-yellow-400 bg-gray-900 px-4 py-1.5 sm:px-6 sm:py-2">
                <p className="font-[family-name:var(--font-vt)] text-xs font-bold text-yellow-400 sm:text-sm">
                  MENTORS
                </p>
              </div>
              <VerticalLineMobile height="h-6" />

              {/* Mentors Grid - Responsive */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 sm:gap-x-8">
                {teamStructure.mentors.map((mentor, idx) => (
                  <MemberCard key={idx} member={mentor} />
                ))}
              </div>
            </div>

            {/* Offstage Executives */}
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

            {/* Creative Heads & PR */}
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
  );
}
