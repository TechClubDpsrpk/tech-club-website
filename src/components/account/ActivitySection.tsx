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
          .select(
            `
            id,
            project_id,
            points,
            projects:project_id (title, total_points)
          `
          )
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching activity:', error);
          setLoading(false);
          return;
        }

        // Format the data
        const formattedData = data?.map((activity: any) => ({
          id: activity.id,
          project_id: activity.project_id,
          points: activity.points,
          project: Array.isArray(activity.projects)
            ? activity.projects[0]
            : activity.projects,
        })) || [];

        setActivities(formattedData);

        // Calculate total points
        const total = formattedData.reduce((sum, activity) => sum + activity.points, 0);
        setTotalPoints(total);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchActivity();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="relative h-10 w-10 animate-spin-slow">
          <Image
            src="/tc-logo.svg"
            alt="Loading"
            fill
            className="object-contain"
          />
        </div>
        <p className="text-sm text-gray-500 font-medium flex items-center justify-center">
          Loading your activity <LoadingDots />
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-black-700/50 bg-gradient-to-br from-black-800/60 to-black-900/60 p-6 shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy size={24} className="text-[#C9A227]" />
          <h2 className="text-2xl font-bold text-white">Your Activities</h2>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/50 px-4 py-2">
          <Image src="/tc-logo.svg" alt="Logo" width={18} height={18} />
          <span className="font-bold text-[#C9A227]">{totalPoints}</span>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-400">
            No quests completed yet. Visit the{' '}
            <a href="/quests" className="text-[#C9A227] hover:underline">
              quests page
            </a>{' '}
            to participate!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between rounded-lg border border-gray-700/30 bg-gray-800/20 px-4 py-3 hover:bg-gray-800/40 transition"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-white">{activity.project.title}</h3>
                <p className="text-xs text-gray-500">
                  Max {activity.project.total_points} points
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-green-500/20 border border-green-500/50 px-3 py-1">
                <Image src="/tc-logo.svg" alt="Logo" width={14} height={14} />
                <span className="font-bold text-green-300 text-sm">
                  {activity.points}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}