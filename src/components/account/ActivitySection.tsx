'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy } from 'lucide-react';
import Image from 'next/image';
import { LoadingDots } from '@/components/ui/loading-dots';

type ProjectActivity = {
  id: string;
  project_id: string;
  points: number;
  project: {
    title: string;
    total_points: number;
  };
};

interface ActivitySectionProps {
  userId: string;
}

export default function ActivitySection({ userId }: ActivitySectionProps) {
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data, error } = await supabase
          .from('project_activity')
          .select(`id, project_id, points, projects:project_id (title, total_points)`)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching activity:', error);
          setLoading(false);
          return;
        }

        const formattedData =
          data?.map((activity: any) => ({
            id: activity.id,
            project_id: activity.project_id,
            points: activity.points,
            project: Array.isArray(activity.projects) ? activity.projects[0] : activity.projects,
          })) || [];

        setActivities(formattedData);
        setTotalPoints(formattedData.reduce((sum, a) => sum + a.points, 0));
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchActivity();
  }, [userId]);

  if (loading) {
    return (
      <div className="border-t border-zinc-800 pt-8">
        <div className="flex items-center gap-4 py-10">
          <div className="relative h-5 w-5 animate-spin">
            <Image src="/tc-logo.svg" alt="Loading" fill className="object-contain" />
          </div>
          <p className="text-sm text-zinc-500">
            Loading your activity
            <LoadingDots />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-zinc-800 pt-8">
      {/* Section header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={14} className="text-[#fac71e]" />
          <span className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-zinc-400 uppercase">
            Your Activities
          </span>
        </div>

        {/* Total points — soft pill */}
        <div className="flex items-center gap-2 rounded-sm border border-[#fac71e]/20 bg-[#fac71e]/[0.06] px-3 py-1.5">
          <Image src="/tc-logo.svg" alt="TC" width={14} height={14} />
          <span className="text-base font-bold text-[#fac71e]">{totalPoints}</span>
          <span className="font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-[#fac71e]/60 uppercase">
            pts
          </span>
        </div>
      </div>

      {/* Empty state */}
      {activities.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No quests completed yet.{' '}
          <a
            href="/quests"
            className="text-[#fac71e] underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            Visit quests
          </a>{' '}
          to participate.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-900">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-center justify-between py-4">
              {/* Left — title + max pts */}
              <div>
                <p className="text-sm font-medium text-white">{activity.project.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  out of {activity.project.total_points} pts
                </p>
              </div>

              {/* Right — earned points pill */}
              <div className="flex items-center gap-2 rounded-sm border border-[#fac71e]/20 bg-[#fac71e]/[0.06] px-3 py-1.5">
                <Image src="/tc-logo.svg" alt="TC" width={12} height={12} />
                <span className="text-sm font-bold text-[#fac71e]">{activity.points}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
