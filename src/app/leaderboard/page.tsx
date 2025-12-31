'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Medal } from 'lucide-react';
import Image from 'next/image';

type LeaderboardEntry = {
  id: string;
  name: string;
  email: string;
  class: string;
  section: string;
  avatarUrl?: string | null;
  total_points: number;
  rank: number;
};

const NICHES = [
  'All',
  'Robotics',
  'Development',
  'Competitive Programming',
  'AI',
  'Videography',
  'Graphics Designing',
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNiche, setSelectedNiche] = useState('All');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Fetch all users with their activity and project details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(
            `
            id,
            name,
            email,
            class,
            section,
            avatar_url,
            interested_niches,
            project_activity (points, project_id)
          `
          );

        if (userError) {
          console.error('Error fetching users:', userError);
          setLoading(false);
          return;
        }

        // Fetch all projects to get their niches
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id, niche');

        if (projectError) {
          console.error('Error fetching projects:', projectError);
          setLoading(false);
          return;
        }

        // Create a map of project id to niche
        const projectNicheMap = new Map(
          (projectData || []).map((p: any) => [p.id, p.niche])
        );

        // Process and rank users
        let entries = (userData || [])
          .map((user: any) => {
            let totalPoints = 0;

            // Calculate points filtered by niche if needed
            (user.project_activity || []).forEach((activity: any) => {
              const projectNiche = projectNicheMap.get(activity.project_id);
              if (selectedNiche === 'All' || projectNiche === selectedNiche) {
                totalPoints += activity.points;
              }
            });

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              class: user.class,
              section: user.section,
              avatarUrl: user.avatar_url,
              interested_niches: user.interested_niches || [],
              total_points: totalPoints,
            };
          })
          .filter((entry) => entry.total_points > 0)
          .sort((a, b) => b.total_points - a.total_points)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }));

        setLeaderboard(entries);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedNiche]);

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Medal size={20} className="text-yellow-400" />;
      case 2:
        return <Medal size={20} className="text-gray-400" />;
      case 3:
        return <Medal size={20} className="text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
      case 2:
        return 'bg-gradient-to-r from-black-400/20 to-black-500/20 border-black-400/50';
      case 3:
        return 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/50';
      default:
        return 'border-black-700/30 hover:bg-black-800/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-900 via-black-900 to-black px-4 pt-24 pb-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Trophy size={32} className="text-[#C9A227]" />
            <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
          </div>
          <p className="text-gray-400">
            Let's see who’s leading the pack! Here’s where we celebrate our top
            tech enthusiasts making waves in the club.
          </p>
        </div>

        {/* Niche Filter */}
        <div className="mb-8">
          <p className="mb-3 text-sm text-gray-400">Filter by niche:</p>
          <div className="flex flex-wrap gap-2">
            {NICHES.map((niche) => (
              <button
                key={niche}
                onClick={() => setSelectedNiche(niche)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedNiche === niche
                    ? 'bg-[#C9A227] text-black'
                    : 'border border-gray-700 text-gray-300 hover:border-[#C9A227] hover:text-[#C9A227]'
                }`}
              >
                {niche}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Loading leaderboard…</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-black-800/60 to-black-900/60 p-12 text-center shadow-xl backdrop-blur-xl">
            <p className="text-gray-400">
              No users with points yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.id}
                className={`border rounded-xl p-4 transition ${getRankBg(entry.rank)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Rank */}
                    <div className="flex items-center gap-2 min-w-[60px]">
                      {getMedalIcon(entry.rank)}
                      <span
                        className={`text-lg font-bold ${
                          entry.rank === 1
                            ? 'text-yellow-400'
                            : entry.rank === 2
                              ? 'text-gray-400'
                              : entry.rank === 3
                                ? 'text-orange-600'
                                : 'text-white'
                        }`}
                      >
                        #{entry.rank}
                      </span>
                    </div>

                    {/* Avatar and Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          entry.avatarUrl
                            ? ''
                            : 'bg-[#C9A227]/20 border border-[#C9A227]/50'
                        }`}
                      >
                        {entry.avatarUrl ? (
                          <img
                            src={entry.avatarUrl}
                            alt={entry.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <Trophy size={20} className="text-[#C9A227]" />
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">{entry.name}</h3>
                        <p className="text-xs text-gray-400">
                          {entry.class} - {entry.section}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Points Badge */}
                  <div className="flex items-center gap-2 rounded-full bg-black/30 border border-gray-700/50 px-4 py-2 ml-4">
                 <Image src="/tc-logo.svg" alt="Logo" width={16} height={16} />
                    <span className="font-bold text-white">{entry.total_points}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}