'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';

const teamMembers = [
  { name: 'Arghya Sarkar', role: 'President' },
  { name: 'Ankush Roy', role: 'Vice President' },
  { name: 'Swapnil Basu', role: 'Offstage Executive' },
  { name: 'Aryaka Sikdar', role: 'Offstage Executive' },
  { name: 'Prithuraj Saha', role: 'Creative Head (Video)' },
  { name: 'Aditya Roy', role: 'Creative Head (Graphics)' },
  { name: 'Niharika Paul', role: 'Creative Head (Graphics)' },
  { name: 'Aritro Sen', role: 'PR Executive' },
  { name: 'Anshuman Tripathi', role: 'Mentor' },
  { name: 'Parthiv Pal', role: 'Mentor' },
  { name: 'Soham Sen', role: 'Mentor' },
  { name: 'Soumili Dey', role: 'Mentor' },
  { name: 'Rishabh Das', role: 'Mentor' },
  { name: 'Avanindra Chakraborty', role: 'Mentor' },
  { name: 'Anshu', role: 'Selected (Cracker Team)' },
  { name: 'Biraja Prasad Pradhan', role: 'Source Code Owner' },
];

export default function TechClubTeamsPage() {
  return (
    <section className="mt-64 bg-black px-6 pb-24 text-white md:px-18 lg:px-42">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="font-[family-name:var(--font-vt)] text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
            Tech Club 2025–26 Team
          </h2>
          <p className="mt-4 font-[family-name:var(--font-space-mono)] text-zinc-400">
            Passionate minds crafting innovation, code, and design.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 -space-y-40 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.05, ease: 'easeOut' }}
            >
              <CardContainer className="inter-var">
                <CardBody className="group/card relative h-auto w-full rounded-lg border border-black/[0.1] bg-gray-50 p-3 dark:border-white/[0.2] dark:bg-black dark:hover:shadow-2xl dark:hover:shadow-yellow-400/[0.1]">
                  <CardItem
                    translateZ="50"
                    className="font-[family-name:var(--font-space-mono)] text-lg font-bold text-neutral-600 dark:text-white"
                  >
                    {member.name}
                  </CardItem>
                  <CardItem
                    as="p"
                    translateZ="30"
                    className="mt-1 font-[family-name:var(--font-vt)] text-sm text-neutral-500 dark:text-neutral-300"
                  >
                    {member.role}
                  </CardItem>
                  <CardItem translateZ="80" className="mt-4 w-full">
                    <img
                      src={`https://picsum.photos/400/200?random=${index}`}
                      alt={member.name}
                      className="h-48 w-full rounded-md object-cover group-hover/card:shadow-xl"
                    />
                  </CardItem>
                </CardBody>
              </CardContainer>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
