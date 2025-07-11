'use client';
import React from 'react';
import { Rocket, Handshake, Book } from 'lucide-react';
import { MagicCard } from '../magicui/magic-card';

const features = [
  {
    icon: <Rocket className="h-8 w-8 text-white" />,
    title: 'Ambitious Projects',
    description:
      "We start with a simple idea and somehow end up building a robot that may or may not follow commands. It's fine, it's innovation. Probably.",
    gradientFrom: '#ffffff',
    gradientTo: '#999999',
  },
  {
    icon: <Handshake className="h-8 w-8 text-yellow-400" />,
    title: 'Chaotic Collaboration',
    description:
      'We work together. Sometimes we even agree on things. Mostly, we just argue over tabs vs spaces — but hey, teamwork!',
    gradientFrom: '#facc15', // Tailwind yellow-400
    gradientTo: '#fbbf24',
  },
  {
    icon: <Book className="h-8 w-8 text-green-400" />,
    title: 'Learning (Sort of)',
    description:
      "You'll learn new skills, break things, fix them again, and pretend that's how it was supposed to work. Growth!",
    gradientFrom: '#34d399', // Tailwind green-400
    gradientTo: '#10b981',
  },
];

const Intro = () => {
  return (
    <section className="min-h-screen bg-black px-6 pt-48 pb-32 text-white md:px-10">
      <div className="mx-auto max-w-6xl space-y-10 md:px-6 lg:px-24">
        <div className="flex flex-col space-y-4 md:space-y-6">
          {/* Header + Tagline on same line */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-left text-5xl font-bold md:text-6xl">
              We are{' '}
              <span className="font-[family-name:var(--font-instrument-serif)] font-normal italic">
                DPSTechies
              </span>
            </h2>
            <p className="mt-2 font-[family-name:var(--font-vt)] text-sm text-white md:mt-0 md:text-base">
              *masters of tech, apprentices in common sense*
            </p>
          </div>

          {/* Description */}
          <p className="max-w-2xl text-left text-base text-sm text-zinc-300">
            We come together to <span className="font-medium text-white">innovate</span>,{' '}
            <span className="font-medium text-white">collaborate</span>, and pretend we know what
            we’re doing. Whether you’re obsessed with AI, code, robots, or just making things look
            cool, this is the perfect place to overcommit, under-caffeinate, and accidentally invent
            the future.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, idx) => (
            <MagicCard
              key={idx}
              gradientFrom={feature.gradientFrom}
              gradientTo={feature.gradientTo}
              gradientColor="#262626"
              gradientOpacity={0.8}
              gradientSize={200}
            >
              <div
                key={idx}
                className="flex h-full flex-col justify-between rounded-2xl p-6 shadow-md"
              >
                <div>
                  <div>{feature.icon}</div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-zinc-300">{feature.description}</p>
                </div>
              </div>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Intro;
