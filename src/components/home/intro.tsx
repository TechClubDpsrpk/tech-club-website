'use client';
import React, { useEffect, useState } from 'react';
import { Rocket, Handshake, ChevronsUp } from 'lucide-react';
import { MagicCard } from '../magicui/magic-card';

type IntroProps = React.HTMLAttributes<HTMLElement>;

const features = [
  {
    icon: <Rocket className="h-8 w-8 text-white" />,
    title: 'Make Stuff',
    sub: 'Ideas, made real.',
    description:
      'We mess around with tech and build things that actually work. Sometimes it’s rough at first. We fix it. Then we fix it again.',
    gradientFrom: '#ffffff',
    gradientTo: '#999999',
  },
  {
    icon: <Handshake className="h-8 w-8 text-yellow-400" />,
    title: 'Build Together',
    sub: 'Nobody builds alone.',
    description:
      'Everyone brings something different. We talk, try, fail, rethink, and get it working — together. ',
    gradientFrom: '#facc15',
    gradientTo: '#fbbf24',
  },
  {
    icon: <ChevronsUp className="h-8 w-8 text-green-400" />,
    title: 'Level Up',
    sub: 'Less talk. More doing.',
    description:
      'Workshops, projects, experiments. If you’re curious and willing to try, you’ll pick things up fast.',
    gradientFrom: '#34d399',
    gradientTo: '#10b981',
  },
];

const Intro = ({ className, ...props }: IntroProps) => {
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleString());
  const [displayText, setDisplayText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const words = ['solutions', 'reality', 'impact'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const shouldDelete = isDeleting;

    if (!shouldDelete && displayText === currentWord) {
      setTimeout(() => setIsDeleting(true), 1500);
    } else if (shouldDelete && displayText === '') {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    } else {
      setTimeout(
        () => {
          setDisplayText((prev) =>
            shouldDelete ? prev.slice(0, -1) : currentWord.slice(0, prev.length + 1)
          );
        },
        shouldDelete ? 250 : 300
      );
    }
  }, [displayText, wordIndex, isDeleting, words]);

  return (
    <>
      {/* Floating header info (NOT observed) */}
      <div className="absolute flex w-full justify-between p-4 pb-0 font-[family-name:var(--font-space-mono)] text-sm text-zinc-500">
        <p>Est. 2017</p>
        <span suppressHydrationWarning>{currentTime}</span>
      </div>

      {/* THIS is what the navbar observes */}
      <section
        {...props}
        className={`min-h-screen bg-black px-6 pt-48 pb-32 text-white md:px-10 ${className ?? ''}`}
      >
        <div className="mx-auto max-w-7xl space-y-10 md:px-6 lg:px-24">
          <div className="flex flex-col space-y-4 md:space-y-6">
            <div className="lg:items-center lg:justify-between">
              <h2 className="text-5xl font-light md:text-6xl">
                Where{' '}
                <span className="font-[family-name:monospace] font-medium md:text-6xl">ideas</span>{' '}
                turn into{' '}
              </h2>
              <span className="font-[family-name:monospace] font-medium md:text-6xl">
                {displayText}.
              </span>
            </div>

            <p className="text-md max-w-3xl text-zinc-300">
              We’re a community of <span className="font-medium text-white">builders</span>,{' '}
              <span className="font-medium text-white">coders</span>,{' '}
              <span className="font-medium text-white">designers</span> and{' '}
              <span className="font-medium text-white">problem-solvers</span> who turn ideas into
              reality. From AI and robotics to apps and experiments, we learn by doing and create
              projects we’re proud of. If you like <span className="text-white">making</span>,{' '}
              <span className="text-white">breaking</span>,{' '}
              <span className="text-white">fixing</span>, and{' '}
              <span className="text-white">improving</span> — you’ll fit right in.
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
                className="h-56 rounded-lg"
              >
                <div className="flex h-full flex-col justify-between rounded-2xl p-6 shadow-md">
                  <div>
                    {feature.icon}
                    <h3 className="pt-3 text-xl font-semibold">{feature.title}</h3>
                    <h5 className="text-md pb-3 text-zinc-400">{feature.sub}</h5>
                    <p className="text-sm text-zinc-200">{feature.description}</p>
                  </div>
                </div>
              </MagicCard>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Intro;
