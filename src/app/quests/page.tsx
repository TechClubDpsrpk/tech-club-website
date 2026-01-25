import Link from 'next/link';
import { ProjectsBeam } from '@/components/projects/ProjectsBeam';
import CPContestsSection from '@/components/projects/CPContestsSection';
import { Trophy } from 'lucide-react';

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Quests</h1>
            <p className="text-gray-400">
              Contribute to exciting quests and earn points
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="flex items-center gap-2 rounded-lg bg-[#C9A227] text-black px-4 py-2 font-semibold hover:bg-[#B8901E] transition cursor-pointer"
          >
            <Trophy size={18} />
          </Link>
        </div>
      </div>
      <div className="mt-12">
        <ProjectsBeam />
      </div>
      <CPContestsSection />
    </div>
  );
}