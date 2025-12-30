import React from 'react';
import { Timeline } from '@/components/ui/timeline';

function LegacyTimeline() {
  const data = [
    {
      title: '2017',
      content: (
        <div>
          <p className="mb-8 text-xs font-normal text-neutral-800 md:text-sm dark:text-neutral-200">
            Tech Club was founded by a handful of enthusiasts who believed coding could be more than
            just syntax — it could be art, innovation, and expression.
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-300">
            Initial sessions were held in dusty labs with whiteboards and borrowed projectors. No
            logo. No website. Just raw passion.
          </p>
        </div>
      ),
    },
    {
      title: '2018',
      content: (
        <div>
          <p className="mb-4 text-xs text-neutral-800 md:text-sm dark:text-neutral-200">
            Club grew from 5 to 40+ members. Hosted its first intra-school hackathon, inspiring
            juniors to look beyond textbooks.
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-300">
            Tech started becoming culture — club stickers appeared on laptops, and sessions became
            standing-room only.
          </p>
        </div>
      ),
    },
    {
      title: '2020',
      content: (
        <div>
          <p className="mb-4 text-xs text-neutral-800 md:text-sm dark:text-neutral-200">
            Despite lockdown, the club thrived online. Members ran webinars, bootcamps, and
            Discord-based collab nights.
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-300">
            The pandemic didn’t stop the code — it made the community stronger.
          </p>
        </div>
      ),
    },
    {
      title: '2023',
      content: (
        <div>
          <p className="mb-4 text-xs text-neutral-800 md:text-sm dark:text-neutral-200">
            The year the club turned professional. GitHub repos were spun. Portfolio sites built.
            UI/UX started being taken seriously.
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-300">
            Tech Club wasn’t just a club anymore — it became a movement.
          </p>
        </div>
      ),
    },
    {
      title: '2025',
      content: (
        <div>
          <p className="mb-4 text-xs text-yellow-600 md:text-sm dark:text-yellow-400">
            Now with a new Discord server and website up and running, the Tech Club finally laid the
            foundation for an ever-expanding community of tech enthusiasts, learners and
            participants, to maintain the school's excellence in the technological domain.
          </p>
          <p className="text-xs text-neutral-600 dark:text-neutral-300">
            We conducted workshops, won trophies, and had succeeded in establishing DPS Ruby Park's
            tech scene.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="relative w-full overflow-x-hidden">
      <Timeline data={data} />
    </div>
  );
}

const LegacyPage = () => {
  return (
    <div className="mt-32 px-6 md:px-24 lg:px-32">
      <LegacyTimeline />
    </div>
  );
};

export default LegacyPage;
