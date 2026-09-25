'use client';

import { useState, useEffect } from 'react';
import { Trophy, ExternalLink, ChevronDown, ChevronUp, RefreshCw, Medal } from 'lucide-react';
import Image from 'next/image';

type Problem = {
    num: string;
    title: string;
    pid?: number;
};

type LeaderboardItem = {
    uid: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    solved: number;
    penalty: number;
    rank: number;
};

export default function CPContestsSection() {
    const [loading, setLoading] = useState(false);
    const [contest, setContest] = useState<{ live?: boolean; title: string; problems: Problem[]; id: string; password?: string } | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);
    const [leaderboardError, setLeaderboardError] = useState('');
    const [showLeaderboard, setShowLeaderboard] = useState(true);
    const [error, setError] = useState('');
    const [imageErrors, setImageErrors] = useState<{ [username: string]: boolean }>({});

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
        setLeaderboardLoading(true);
        setLeaderboardError('');
        try {
            const res = await fetch('/api/vjudge/leaderboard');
            if (res.ok) {
                const data = await res.json();
                const participants = data.participants || data.data?.participants || {};
                const submissions = data.submissions || data.data?.submissions || [];

                const processedLeaderboard: LeaderboardItem[] = Object.entries(participants).map(([uid, participantData]: any) => {
                    let username = uid;
                    let displayName = '';
                    let avatarUrl: string | null = null;

                    if (Array.isArray(participantData)) {
                        username = participantData[0] || uid;
                        displayName = participantData[1] || '';
                        avatarUrl = participantData[2] || null;
                    } else if (typeof participantData === 'object' && participantData !== null) {
                        username = participantData.username || participantData.name || uid;
                        displayName = participantData.displayName || '';
                        avatarUrl = participantData.avatarUrl || participantData.avatar || null;
                    } else if (typeof participantData === 'string') {
                        username = participantData;
                    }

                    if (avatarUrl) {
                        if (avatarUrl.startsWith('//')) {
                            avatarUrl = `https:${avatarUrl}`;
                        } else if (avatarUrl.startsWith('/')) {
                            avatarUrl = `https://vjudge.net${avatarUrl}`;
                        }
                    }

                    // Match submissions by user ID (both string and number safe)
                    const userSubmissions = submissions.filter((s: any) => String(s[0]) === String(uid));

                    // Solved distinct problems (status 1 = Accepted)
                    const solvedProblems = new Set(
                        userSubmissions.filter((s: any) => Number(s[2]) === 1).map((s: any) => s[1])
                    );

                    // Compute penalty minutes (ICPC style)
                    let penaltyMinutes = 0;
                    const problemAttempts: { [probId: string]: { solved: boolean; wrongAttempts: number; acTime: number } } = {};
                    for (const sub of userSubmissions) {
                        const probId = String(sub[1]);
                        if (!problemAttempts[probId]) {
                            problemAttempts[probId] = { solved: false, wrongAttempts: 0, acTime: 0 };
                        }
                        if (!problemAttempts[probId].solved) {
                            if (Number(sub[2]) === 1) {
                                problemAttempts[probId].solved = true;
                                problemAttempts[probId].acTime = Math.floor(Number(sub[3] || 0) / 60);
                            } else {
                                problemAttempts[probId].wrongAttempts += 1;
                            }
                        }
                    }
                    for (const p of Object.values(problemAttempts)) {
                        if (p.solved) {
                            penaltyMinutes += p.acTime + (p.wrongAttempts * 20);
                        }
                    }

                    return {
                        uid,
                        username,
                        displayName: displayName || username,
                        avatarUrl,
                        solved: solvedProblems.size,
                        penalty: penaltyMinutes,
                        rank: 0,
                    };
                }).sort((a, b) => {
                    if (b.solved !== a.solved) return b.solved - a.solved;
                    return a.penalty - b.penalty;
                });

                setLeaderboard(processedLeaderboard.map((item, index) => ({ ...item, rank: index + 1 })));
            } else {
                setLeaderboardError('Could not load standings from VJudge.');
            }
        } catch (err) {
            console.error('Leaderboard fetch error:', err);
            setLeaderboardError('An error occurred while loading standings.');
        } finally {
            setLeaderboardLoading(false);
        }
    };

    const isNoLiveContest = contest?.live === false;

    const getRankMedal = (rank: number) => {
        switch (rank) {
            case 1:
                return <Medal size={18} className="text-yellow-400 inline shrink-0" />;
            case 2:
                return <Medal size={18} className="text-gray-300 inline shrink-0" />;
            case 3:
                return <Medal size={18} className="text-amber-600 inline shrink-0" />;
            default:
                return null;
        }
    };

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
                            className="px-6 py-2 rounded-lg border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227]/10 transition cursor-pointer"
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

                {/* Leaderboard Section - Only displayed when contest is live or active */}
                {!isNoLiveContest && !loading && !error && (
                    <div className="border-t border-white/10 pt-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Trophy size={22} className="text-[#C9A227]" />
                                <h3 className="text-xl font-bold text-white">Standings & Leaderboard</h3>
                                {leaderboard.length > 0 && (
                                    <span className="text-xs bg-[#C9A227]/10 text-[#C9A227] px-2.5 py-0.5 rounded-full border border-[#C9A227]/20 font-mono">
                                        {leaderboard.length} {leaderboard.length === 1 ? 'participant' : 'participants'}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={fetchLeaderboard}
                                    disabled={leaderboardLoading}
                                    title="Refresh Standings"
                                    className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-[#C9A227]/40 transition disabled:opacity-50"
                                >
                                    <RefreshCw size={15} className={leaderboardLoading ? 'animate-spin text-[#C9A227]' : ''} />
                                </button>
                                <button
                                    onClick={() => setShowLeaderboard(!showLeaderboard)}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 hover:text-[#C9A227] transition-colors py-1.5 px-3 rounded-lg border border-white/10 hover:border-[#C9A227]/30"
                                >
                                    {showLeaderboard ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    {showLeaderboard ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        {showLeaderboard && (
                            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                                {leaderboardLoading && leaderboard.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                                        <Image
                                            src="/tc-logo_circle.svg"
                                            alt="Loading"
                                            width={36}
                                            height={36}
                                            className="animate-spin opacity-80"
                                        />
                                        <p className="text-sm text-gray-400">Loading standings...</p>
                                    </div>
                                ) : leaderboardError && leaderboard.length === 0 ? (
                                    <div className="text-center py-10 px-4">
                                        <p className="text-sm text-red-400 mb-3">{leaderboardError}</p>
                                        <button
                                            onClick={fetchLeaderboard}
                                            className="px-4 py-1.5 text-xs rounded-lg border border-[#C9A227] text-[#C9A227] hover:bg-[#C9A227]/10 transition"
                                        >
                                            Retry Loading Leaderboard
                                        </button>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-[#C9A227]/10 text-[#C9A227] text-xs uppercase tracking-wider border-b border-[#C9A227]/20">
                                                <tr>
                                                    <th className="px-6 py-4 w-20">Rank</th>
                                                    <th className="px-6 py-4">User</th>
                                                    <th className="px-6 py-4 text-center w-28">Solved</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {leaderboard.length > 0 ? (
                                                    leaderboard.map((entry) => (
                                                        <tr
                                                            key={entry.username}
                                                            className={`text-sm transition-colors hover:bg-white/[0.03] ${
                                                                entry.rank === 1
                                                                    ? 'bg-yellow-500/[0.04]'
                                                                    : entry.rank === 2
                                                                    ? 'bg-gray-400/[0.03]'
                                                                    : entry.rank === 3
                                                                    ? 'bg-amber-600/[0.03]'
                                                                    : ''
                                                            }`}
                                                        >
                                                            <td className="px-6 py-4 font-bold">
                                                                <div className="flex items-center gap-1.5">
                                                                    {getRankMedal(entry.rank)}
                                                                    <span
                                                                        className={
                                                                            entry.rank === 1
                                                                                ? 'text-yellow-400 font-extrabold'
                                                                                : entry.rank === 2
                                                                                ? 'text-gray-300 font-bold'
                                                                                : entry.rank === 3
                                                                                ? 'text-amber-500 font-bold'
                                                                                : 'text-gray-400'
                                                                        }
                                                                    >
                                                                        #{entry.rank}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    {entry.avatarUrl && !imageErrors[entry.username] ? (
                                                                        <img
                                                                            src={`/api/avatar?url=${encodeURIComponent(entry.avatarUrl)}`}
                                                                            alt={entry.username}
                                                                            onError={() =>
                                                                                setImageErrors((prev) => ({
                                                                                    ...prev,
                                                                                    [entry.username]: true,
                                                                                }))
                                                                            }
                                                                            className="w-8 h-8 rounded-full object-cover border border-white/10"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-8 h-8 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/30 flex items-center justify-center text-[#C9A227] font-bold text-xs">
                                                                            {(entry.username || '?').charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <span className="text-white font-medium block">
                                                                            {entry.displayName || entry.username}
                                                                        </span>
                                                                        {entry.displayName && entry.displayName !== entry.username && (
                                                                            <span className="text-xs text-gray-500 block">
                                                                                @{entry.username}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="inline-block px-3 py-1 bg-[#C9A227]/20 border border-[#C9A227]/30 rounded-full text-[#C9A227] font-bold text-sm">
                                                                    {entry.solved}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={3} className="px-6 py-10 text-center text-gray-500 italic">
                                                            No submissions recorded yet for this contest. Be the first to solve a problem!
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

