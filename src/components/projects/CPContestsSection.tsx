'use client';

import { useState, useEffect } from 'react';
import { Trophy, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

type Problem = {
    num: string;
    title: string;
    pid: number;
};

type RankEntry = {
    vjudge_username: string;
    solved: number;
    penalty: number;
    rank: number;
};

export default function CPContestsSection() {
    const [loading, setLoading] = useState(false);
    const [contest, setContest] = useState<{ live?: boolean; title: string; problems: Problem[]; id: string; password?: string } | null>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchContestData();
    }, []);

    const fetchContestData = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/vjudge/contest');
            if (res.ok) {
                const data = await res.json();
                setContest(data);
                if (data.live !== false) {
                    fetchLeaderboard();
                }
            } else {
                setError('Failed to fetch contest data. Ensure organiser account is valid.');
            }
        } catch (err) {
            setError('An error occurred while fetching contest data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch('/api/vjudge/leaderboard');
            if (res.ok) {
                const data = await res.json();
                const participants = data.participants || {};
                const submissions = data.submissions || [];

                const processedLeaderboard = Object.entries(participants).map(([uid, participantData]: any) => {
                    // VJudge participant data is an array: [username, displayName, avatarUrl, ...]
                    const username = Array.isArray(participantData) ? participantData[0] : participantData;
                    const avatarUrl = Array.isArray(participantData) ? participantData[2] : null;

                    const userSubmissions = submissions.filter((s: any) => s[0] === parseInt(uid));
                    const solvedProblems = new Set(userSubmissions.filter((s: any) => s[2] === 1).map((s: any) => s[1]));
                    return {
                        username,
                        avatarUrl,
                        solved: solvedProblems.size,
                        rank: 0
                    };
                }).sort((a, b) => b.solved - a.solved);

                setLeaderboard(processedLeaderboard.map((item, index) => ({ ...item, rank: index + 1 })));
            }
        } catch (err) {
            console.error('Leaderboard fetch error:', err);
        }
    };

    const isNoLiveContest = contest?.live === false;

    return (
        <div className="mx-auto max-w-4xl px-4 mt-12">
            <div className="relative overflow-hidden rounded-3xl border border-[#C9A227]/30 bg-black/50 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white">
                        {loading ? 'Fetching Contest...' : (isNoLiveContest ? 'CP Contests' : (contest?.title || 'CP Contest'))}
                    </h2>
                    {contest?.password && !isNoLiveContest && (
                        <p className="text-gray-400 text-sm mt-2">
                            Password: <span className="text-[#C9A227] font-mono">{contest.password}</span>
                        </p>
                    )}
                </div>

                {error ? (
                    <div className="text-center py-12">
                        <p className="text-red-400 mb-4">{error}</p>
                        <button
                            onClick={fetchContestData}
                            className="px-6 py-2 rounded-lg border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227]/10"
                        >
                            Retry
                        </button>
                    </div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Image
                            src="/tc-logo_circle.svg"
                            alt="Loading"
                            width={60}
                            height={60}
                            className="animate-spin"
                        />
                        <p className="text-gray-400">
                            Fetching problems from VJudge
                            <span className="inline-flex ml-1">
                                <span className="animate-pulse-dot">.</span>
                                <span className="animate-pulse-dot animation-delay-200">.</span>
                                <span className="animate-pulse-dot animation-delay-400">.</span>
                            </span>
                        </p>
                    </div>
                ) : isNoLiveContest ? (
                    <div className="text-center py-16 border border-white/5 rounded-2xl bg-white/5">
                        <Trophy size={48} className="text-[#C9A227]/20 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No active contests</h3>
                        <p className="text-gray-400 max-w-sm mx-auto">
                            There are no contests live right now. Check back later or join our discord for announcements.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {contest?.problems.map((problem) => (
                            <a
                                key={problem.num}
                                href={`https://vjudge.net/contest/${contest.id}#problem/${problem.num}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all border-l-4 border-l-[#C9A227]"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-black text-[#C9A227]/30 group-hover:text-[#C9A227]/50 transition-colors">
                                        {problem.num}
                                    </span>
                                    <span className="text-white font-medium group-hover:text-[#C9A227] transition-colors">
                                        {problem.title}
                                    </span>
                                </div>
                                <ExternalLink size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                            </a>
                        ))}
                    </div>
                )}

                {/* Leaderboard Toggle */}
                <div className="border-t border-white/10 pt-6">
                    <button
                        onClick={() => setShowLeaderboard(!showLeaderboard)}
                        className="flex items-center gap-2 text-white font-bold hover:text-[#C9A227] transition-colors mx-auto"
                    >
                        {showLeaderboard ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        {showLeaderboard ? 'Hide Standings' : 'View Standings'}
                    </button>

                    {showLeaderboard && (
                        <div className="mt-6 overflow-hidden rounded-xl border border-white/5 bg-black/40">
                            <table className="w-full text-left">
                                <thead className="bg-[#C9A227]/10 text-[#C9A227] text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Rank</th>
                                        <th className="px-6 py-4">User</th>
                                        <th className="px-6 py-4 text-center">Solved</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {leaderboard.length > 0 ? (
                                        leaderboard.map((entry) => (
                                            <tr key={entry.username} className="text-sm text-gray-300">
                                                <td className="px-6 py-4 font-bold">#{entry.rank}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {entry.avatarUrl ? (
                                                            <img
                                                                src={entry.avatarUrl}
                                                                alt={entry.username}
                                                                className="w-8 h-8 rounded-full"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-[#C9A227]/20 flex items-center justify-center text-[#C9A227] font-bold text-xs">
                                                                {entry.username.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span>{entry.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-block px-3 py-1 bg-[#C9A227]/20 border border-[#C9A227]/30 rounded-full text-[#C9A227] font-bold">
                                                        {entry.solved}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">
                                                Leaderboard is empty or still loading...
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
