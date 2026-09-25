'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  Trophy,
  Medal,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  Save,
  ExternalLink,
  Trash2,
  Camera,
  Sparkles,
  Search,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  UserCheck,
  ChevronDown,
  Zap,
  Info,
  X,
} from 'lucide-react';
import { LoadingDots } from '@/components/ui/loading-dots';

export interface ClubUser {
  id: string;
  name: string;
  email: string;
  class?: string;
  section?: string;
  avatar_url?: string | null;
}

export interface ParticipantRanking {
  uid: string;
  vjudge_username: string;
  display_name?: string;
  avatar_url?: string | null;
  solved: number;
  penalty: number;
  rank: number;
  user_id?: string | null;
  user_name?: string | null;
  user_email?: string | null;
  points_awarded: number;
  awarded_at?: string | null;
}

export interface CPLeaderboardSnapshot {
  id: string;
  contest_id: string;
  contest_title: string;
  status: 'draft' | 'awarded';
  saved_by?: string;
  created_at: string;
  updated_at: string;
  participant_count?: number;
  mapped_count?: number;
  awarded_count?: number;
  rankings?: ParticipantRanking[];
}

function autoMatchParticipant(
  participant: { username: string; displayName?: string },
  users: ClubUser[]
): ClubUser | null {
  if (!users || users.length === 0) return null;

  const vName = (participant.displayName || '').trim().toLowerCase();
  const vUser = (participant.username || '').trim().toLowerCase();

  // 1. Exact match on name
  for (const u of users) {
    const uName = (u.name || '').trim().toLowerCase();
    if (vName && uName === vName) return u;
    if (vUser && uName === vUser) return u;
  }

  // 2. Exact match on email prefix
  for (const u of users) {
    const emailPrefix = (u.email || '').split('@')[0].toLowerCase();
    if (vUser && emailPrefix === vUser) return u;
    if (vName && emailPrefix === vName) return u;
  }

  // 3. Name containment
  if (vUser.length >= 4) {
    for (const u of users) {
      const uName = (u.name || '').toLowerCase();
      if (uName.includes(vUser) || vUser.includes(uName)) return u;
    }
  }

  return null;
}

export default function CPLeaderboardsManager() {
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [sqlMigration, setSqlMigration] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  const [leaderboards, setLeaderboards] = useState<CPLeaderboardSnapshot[]>([]);
  const [clubUsers, setClubUsers] = useState<ClubUser[]>([]);

  // Studio Mode: Viewing/Editing a snapshot
  const [activeSnapshot, setActiveSnapshot] = useState<CPLeaderboardSnapshot | null>(null);
  const [activeRankings, setActiveRankings] = useState<ParticipantRanking[]>([]);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);

  // Live Snapshotting Mode
  const [capturingLive, setCapturingLive] = useState(false);
  const [savingLive, setSavingLive] = useState(false);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [openUserDropdownRow, setOpenUserDropdownRow] = useState<string | null>(null);
  const [userFilterText, setUserFilterText] = useState('');
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [awardingPoints, setAwardingPoints] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Initial Fetch
  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/cp-leaderboards');
      const data = await res.json();

      if (data.tableMissing) {
        setTableMissing(true);
        setSqlMigration(data.sql || '');
      } else if (res.ok) {
        setTableMissing(false);
        setLeaderboards(data.leaderboards || []);
        setClubUsers(data.users || []);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch saved leaderboards' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error connecting to leaderboards API' });
    } finally {
      setLoading(false);
    }
  };

  // Open a specific snapshot for user mapping and points distribution
  const handleOpenSnapshot = async (id: string) => {
    setLoadingSnapshot(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/cp-leaderboards?id=${id}`);
      const data = await res.json();
      if (res.ok && data.leaderboard) {
        setActiveSnapshot(data.leaderboard);
        setActiveRankings(data.leaderboard.rankings || []);
        if (data.users) setClubUsers(data.users);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to load contest snapshot' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error loading snapshot' });
    } finally {
      setLoadingSnapshot(false);
    }
  };

  // Capture Live Contest Standings from VJudge
  const handleCaptureLiveContest = async () => {
    setCapturingLive(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/cp-leaderboards?activeContest=true');
      const data = await res.json();
      if (res.ok && data.rankings) {
        // Create an unsaved draft snapshot ready to edit or save
        const draft: CPLeaderboardSnapshot = {
          id: 'temp-live',
          contest_id: data.contest_id,
          contest_title: data.contest_title,
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          rankings: data.rankings,
        };
        setActiveSnapshot(draft);
        setActiveRankings(data.rankings);
        if (data.users) setClubUsers(data.users);
        setMessage({
          type: 'info',
          text: `Fetched live standings for ${data.contest_title}. Review mappings below and click "Save Snapshot".`,
        });
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Could not fetch live contest. Make sure contest ID and cookies are configured.',
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to capture live standings from VJudge' });
    } finally {
      setCapturingLive(false);
    }
  };

  // Save new live snapshot to Supabase
  const handleSaveLiveSnapshot = async () => {
    if (!activeSnapshot) return;
    setSavingLive(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/cp-leaderboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contest_id: activeSnapshot.contest_id,
          contest_title: activeSnapshot.contest_title,
          rankings: activeRankings,
        }),
      });
      const data = await res.json();
      if (data.tableMissing) {
        setTableMissing(true);
        setSqlMigration(data.sql || '');
      } else if (res.ok && data.leaderboard) {
        setActiveSnapshot(data.leaderboard);
        setActiveRankings(data.leaderboard.rankings || []);
        setMessage({ type: 'success', text: 'Contest snapshot saved successfully!' });
        fetchLeaderboards();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save snapshot' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Unexpected error while saving snapshot' });
    } finally {
      setSavingLive(false);
    }
  };

  // Update existing snapshot draft in Supabase
  const handleSaveDraftChanges = async () => {
    if (!activeSnapshot || activeSnapshot.id === 'temp-live') return;
    setSavingChanges(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/cp-leaderboards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeSnapshot.id,
          rankings: activeRankings,
          contest_title: activeSnapshot.contest_title,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Mappings & point values updated.' });
        fetchLeaderboards();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save changes' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update draft' });
    } finally {
      setSavingChanges(false);
    }
  };

  // Award Points to all mapped users
  const handleExecuteAward = async () => {
    if (!activeSnapshot) return;
    setAwardingPoints(true);
    setMessage(null);
    setShowAwardModal(false);

    try {
      // If still temporary live snapshot, save it first
      let snapId = activeSnapshot.id;
      if (snapId === 'temp-live') {
        const createRes = await fetch('/api/admin/cp-leaderboards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contest_id: activeSnapshot.contest_id,
            contest_title: activeSnapshot.contest_title,
            rankings: activeRankings,
          }),
        });
        const createData = await createRes.json();
        if (!createRes.ok || !createData.leaderboard) {
          throw new Error(createData.error || 'Failed to save snapshot before awarding');
        }
        snapId = createData.leaderboard.id;
        setActiveSnapshot(createData.leaderboard);
      }

      // Execute points award
      const res = await fetch('/api/admin/cp-leaderboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'award',
          snapshotId: snapId,
          rankings: activeRankings,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: 'success',
          text: `🎉 Points successfully awarded to ${data.awardedCount} participants! Points now reflect on the club Leaderboard.`,
        });
        // Refresh active snapshot
        handleOpenSnapshot(snapId);
        fetchLeaderboards();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to award points' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error occurred while awarding points' });
    } finally {
      setAwardingPoints(false);
    }
  };

  // Delete saved snapshot
  const handleDeleteSnapshot = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this saved leaderboard snapshot?')) return;
    try {
      const res = await fetch(`/api/admin/cp-leaderboards?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Snapshot deleted.' });
        if (activeSnapshot?.id === id) {
          setActiveSnapshot(null);
          setActiveRankings([]);
        }
        fetchLeaderboards();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to delete snapshot' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error deleting snapshot' });
    }
  };

  // Map participant to club user
  const handleMapUser = (uid: string, user: ClubUser | null) => {
    setActiveRankings((prev) =>
      prev.map((item) => {
        if (item.uid === uid) {
          return {
            ...item,
            user_id: user ? user.id : null,
            user_name: user ? user.name : null,
            user_email: user ? user.email : null,
          };
        }
        return item;
      })
    );
    setOpenUserDropdownRow(null);
    setUserFilterText('');
  };

  // Update points for a participant
  const handleUpdatePoints = (uid: string, points: number) => {
    setActiveRankings((prev) =>
      prev.map((item) => (item.uid === uid ? { ...item, points_awarded: Math.max(0, points) } : item))
    );
  };

  // Quick Preset Points Distribution
  const applyPreset = (preset: 'top3' | 'perProblem' | 'flat' | 'clear') => {
    setActiveRankings((prev) =>
      prev.map((item, index) => {
        let pts = 0;
        if (preset === 'top3') {
          pts = index === 0 ? 100 : index === 1 ? 75 : index === 2 ? 50 : item.solved > 0 ? 25 : 10;
        } else if (preset === 'perProblem') {
          pts = item.solved * 30 + (item.solved > 0 ? 10 : 0);
        } else if (preset === 'flat') {
          pts = 50;
        } else if (preset === 'clear') {
          pts = 0;
        }
        return { ...item, points_awarded: pts };
      })
    );
    setShowPresetMenu(false);
    setMessage({ type: 'info', text: `Applied "${preset}" point distribution preset.` });
  };

  // Run auto-match for any currently unmapped participants
  const runAutoMatchAll = () => {
    let matchedCount = 0;
    setActiveRankings((prev) =>
      prev.map((item) => {
        if (!item.user_id) {
          const matched = autoMatchParticipant(
            { username: item.vjudge_username, displayName: item.display_name },
            clubUsers
          );
          if (matched) {
            matchedCount++;
            return {
              ...item,
              user_id: matched.id,
              user_name: matched.name,
              user_email: matched.email,
            };
          }
        }
        return item;
      })
    );
    if (matchedCount > 0) {
      setMessage({
        type: 'success',
        text: `Auto-matched ${matchedCount} participant(s) with registered club members!`,
      });
    } else {
      setMessage({
        type: 'info',
        text: 'No new matches found with current club member names/emails.',
      });
    }
  };

  // Copy SQL Migration
  const copySql = () => {
    if (!sqlMigration) return;
    navigator.clipboard.writeText(sqlMigration);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Filtered rankings for studio view
  const filteredRankings = useMemo(() => {
    if (!searchQuery.trim()) return activeRankings;
    const q = searchQuery.toLowerCase();
    return activeRankings.filter(
      (r) =>
        r.vjudge_username.toLowerCase().includes(q) ||
        (r.display_name && r.display_name.toLowerCase().includes(q)) ||
        (r.user_name && r.user_name.toLowerCase().includes(q)) ||
        (r.user_email && r.user_email.toLowerCase().includes(q))
    );
  }, [activeRankings, searchQuery]);

  // Filtered club users for dropdown
  const filteredClubUsers = useMemo(() => {
    if (!userFilterText.trim()) return clubUsers.slice(0, 30);
    const q = userFilterText.toLowerCase();
    return clubUsers
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.class && u.class.toLowerCase().includes(q)) ||
          (u.section && u.section.toLowerCase().includes(q))
      )
      .slice(0, 30);
  }, [clubUsers, userFilterText]);

  // Statistics
  const stats = useMemo(() => {
    const total = activeRankings.length;
    const mapped = activeRankings.filter((r) => !!r.user_id).length;
    const totalPoints = activeRankings.reduce((sum, r) => sum + (Number(r.points_awarded) || 0), 0);
    const awarded = activeRankings.filter((r) => !!r.awarded_at).length;
    return { total, mapped, totalPoints, awarded };
  }, [activeRankings]);

  // 1. Render Missing Table Warning
  if (tableMissing) {
    return (
      <div className="space-y-6">
        <div className="rounded-sm border border-amber-500/30 bg-amber-500/[0.04] p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-amber-500/40 bg-amber-500/10 text-amber-400">
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-2">
              <h3 className="font-[family-name:var(--font-space-mono)] text-sm font-bold tracking-wider text-amber-400 uppercase">
                Database Table Setup Required
              </h3>
              <p className="text-sm text-zinc-300">
                To archive contest leaderboards and map participants to club members, the table{' '}
                <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-xs text-[#fac71e]">
                  tc_sec_cp_leaderboards
                </code>{' '}
                needs to be initialized in your Supabase database.
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-zinc-800 pt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-400 uppercase">
                SQL Migration Script
              </span>
              <button
                onClick={copySql}
                className="flex items-center gap-1.5 rounded-sm border border-[#fac71e]/30 bg-[#fac71e]/10 px-3 py-1 font-[family-name:var(--font-space-mono)] text-xs font-semibold text-[#fac71e] transition-colors hover:bg-[#fac71e]/20"
              >
                {copiedSql ? <Check size={12} /> : <Copy size={12} />}
                {copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}
              </button>
            </div>
            <pre className="max-h-56 overflow-x-auto rounded border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-300">
              {sqlMigration}
            </pre>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              onClick={fetchLeaderboards}
              className="flex items-center gap-2 rounded-sm bg-[#fac71e] px-6 py-2.5 font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-wider text-black uppercase transition-opacity hover:opacity-90"
            >
              <RefreshCw size={13} />
              Re-check Database
            </button>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-[family-name:var(--font-space-mono)] text-xs text-zinc-400 uppercase underline underline-offset-4 hover:text-white"
            >
              Open Supabase SQL Editor <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. Render Active Snapshot Studio
  if (activeSnapshot) {
    const isLiveDraft = activeSnapshot.id === 'temp-live';
    const isAwarded = activeSnapshot.status === 'awarded';

    return (
      <div className="space-y-6">
        {/* Top Studio Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setActiveSnapshot(null);
                setActiveRankings([]);
                fetchLeaderboards();
              }}
              className="flex items-center gap-1.5 rounded-sm border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 font-[family-name:var(--font-space-mono)] text-xs text-zinc-300 uppercase transition-colors hover:border-zinc-600 hover:text-white"
            >
              <ArrowLeft size={13} /> Back to Archives
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-white uppercase">{activeSnapshot.contest_title}</h2>
                <span
                  className={`rounded-sm px-2 py-0.5 font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-wider ${
                    isAwarded
                      ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border border-[#fac71e]/30 bg-[#fac71e]/10 text-[#fac71e]'
                  }`}
                >
                  {isAwarded ? 'Points Awarded ✓' : 'Draft Standings'}
                </span>
                {isLiveDraft && (
                  <span className="rounded-sm border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-[family-name:var(--font-space-mono)] text-[10px] text-sky-400 uppercase">
                    Live Capture (Unsaved)
                  </span>
                )}
              </div>
              <p className="mt-0.5 font-[family-name:var(--font-space-mono)] text-xs text-zinc-500">
                Contest #{activeSnapshot.contest_id} · Saved{' '}
                {new Date(activeSnapshot.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {isLiveDraft ? (
              <button
                onClick={handleSaveLiveSnapshot}
                disabled={savingLive}
                className="flex items-center gap-2 rounded-sm bg-[#fac71e] px-5 py-2 font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-wider text-black uppercase transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Save size={13} />
                {savingLive ? 'Saving…' : 'Save Snapshot'}
              </button>
            ) : (
              <button
                onClick={handleSaveDraftChanges}
                disabled={savingChanges}
                className="flex items-center gap-2 rounded-sm border border-zinc-700 bg-zinc-900 px-4 py-2 font-[family-name:var(--font-space-mono)] text-xs text-zinc-200 uppercase transition-colors hover:border-zinc-500 hover:text-white disabled:opacity-40"
              >
                <Save size={13} />
                {savingChanges ? 'Saving…' : 'Save Draft'}
              </button>
            )}

            <button
              onClick={() => setShowAwardModal(true)}
              disabled={stats.mapped === 0 || awardingPoints}
              className="flex items-center gap-2 rounded-sm bg-gradient-to-r from-[#fac71e] to-amber-500 px-5 py-2 font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-wider text-black uppercase transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Award size={14} />
              Award Points ({stats.mapped})
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {message && (
          <div
            className={`flex items-center gap-3 rounded-sm border px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400'
                : message.type === 'error'
                ? 'border-red-500/30 bg-red-500/[0.06] text-red-400'
                : 'border-sky-500/30 bg-sky-500/[0.06] text-sky-400'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 size={15} />
            ) : message.type === 'error' ? (
              <AlertTriangle size={15} />
            ) : (
              <Info size={15} />
            )}
            {message.text}
          </div>
        )}

        {/* Stats & Quick Presets Toolbar */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-sm border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-zinc-500 uppercase">
              Participants
            </p>
            <p className="mt-1 text-2xl font-bold text-white">{stats.total}</p>
          </div>

          <div className="rounded-sm border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-zinc-500 uppercase">
              Mapped to Club
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">{stats.mapped}</span>
              <span className="text-xs text-zinc-500">of {stats.total}</span>
            </div>
          </div>

          <div className="rounded-sm border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-zinc-500 uppercase">
              Points Ready to Award
            </p>
            <p className="mt-1 text-2xl font-bold text-[#fac71e]">{stats.totalPoints} XP</p>
          </div>

          <div className="rounded-sm border border-zinc-800 bg-zinc-950/60 p-4">
            <p className="font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-zinc-500 uppercase">
              Status
            </p>
            <p className="mt-1 text-sm font-semibold uppercase text-zinc-300">
              {stats.awarded > 0 ? `${stats.awarded} Distributed` : 'Pending Award'}
            </p>
          </div>
        </div>

        {/* Filtering & Presets Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative min-w-[280px] flex-1">
            <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by participant, handle, or club member…"
              className="w-full rounded-sm border border-zinc-800 bg-transparent py-2.5 pr-4 pl-9 text-xs text-white placeholder:text-zinc-600 focus:border-[#fac71e] focus:outline-none"
            />
          </div>

          {/* Action Tools: Auto-Match & Presets */}
          <div className="flex items-center gap-2">
            <button
              onClick={runAutoMatchAll}
              className="flex items-center gap-2 rounded-sm border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 font-[family-name:var(--font-space-mono)] text-xs text-zinc-300 uppercase transition-colors hover:border-[#fac71e] hover:text-white"
            >
              <Sparkles size={13} className="text-[#fac71e]" />
              Auto-Match
            </button>

            {/* Point Distribution Presets Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPresetMenu(!showPresetMenu)}
                className="flex items-center gap-2 rounded-sm border border-zinc-800 bg-zinc-900/60 px-4 py-2.5 font-[family-name:var(--font-space-mono)] text-xs text-zinc-300 uppercase transition-colors hover:border-zinc-600 hover:text-white"
              >
                <Zap size={13} className="text-[#fac71e]" />
                Point Presets
                <ChevronDown size={12} />
              </button>

            {showPresetMenu && (
              <div className="absolute right-0 z-30 mt-2 w-72 rounded-sm border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
                <p className="border-b border-zinc-800 px-3 py-2 font-[family-name:var(--font-space-mono)] text-[10px] tracking-wider text-zinc-500 uppercase">
                  Auto-Distribute Points
                </p>
                <div className="mt-1 space-y-1">
                  <button
                    onClick={() => applyPreset('top3')}
                    className="flex w-full flex-col items-start rounded px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-900"
                  >
                    <span className="font-semibold text-white">🏆 Tiered (Top 3 + Solvers)</span>
                    <span className="text-[11px] text-zinc-400">1st: 100, 2nd: 75, 3rd: 50, solved: 25, part: 10</span>
                  </button>
                  <button
                    onClick={() => applyPreset('perProblem')}
                    className="flex w-full flex-col items-start rounded px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-900"
                  >
                    <span className="font-semibold text-white">🧩 Per Problem Solved</span>
                    <span className="text-[11px] text-zinc-400">30 XP per solved problem + 10 XP bonus</span>
                  </button>
                  <button
                    onClick={() => applyPreset('flat')}
                    className="flex w-full flex-col items-start rounded px-3 py-2 text-left text-xs transition-colors hover:bg-zinc-900"
                  >
                    <span className="font-semibold text-white">🎯 Flat 50 XP to All</span>
                    <span className="text-[11px] text-zinc-400">Equal 50 XP awarded for participation</span>
                  </button>
                  <button
                    onClick={() => applyPreset('clear')}
                    className="flex w-full flex-col items-start rounded px-3 py-2 text-left text-xs text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <span className="font-semibold">Reset / Clear All</span>
                    <span className="text-[11px] text-zinc-500">Set all points to 0</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Standings & User Mapping Table */}
        <div className="overflow-x-auto rounded-sm border border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 font-[family-name:var(--font-space-mono)] text-[11px] tracking-widest text-zinc-400 uppercase">
              <tr>
                <th className="px-4 py-3.5 text-center">Rank</th>
                <th className="px-4 py-3.5">VJudge Participant</th>
                <th className="px-4 py-3.5 text-center">Solved</th>
                <th className="px-4 py-3.5 text-center">Penalty</th>
                <th className="px-4 py-3.5">Mapped Club Member</th>
                <th className="px-4 py-3.5 text-right">Award Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-xs">
              {filteredRankings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-500">
                    No participants match your filter.
                  </td>
                </tr>
              ) : (
                filteredRankings.map((p) => {
                  const isTop1 = p.rank === 1;
                  const isTop2 = p.rank === 2;
                  const isTop3 = p.rank === 3;
                  const isMapped = !!p.user_id;
                  const isDropdownOpen = openUserDropdownRow === p.uid;

                  return (
                    <tr
                      key={p.uid}
                      className="transition-colors hover:bg-zinc-900/30"
                    >
                      {/* Rank */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          {isTop1 ? (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fac71e]/20 text-[#fac71e] ring-1 ring-[#fac71e]/40">
                              <Medal size={14} />
                            </span>
                          ) : isTop2 ? (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-300/20 text-slate-300 ring-1 ring-slate-300/40">
                              <Medal size={14} />
                            </span>
                          ) : isTop3 ? (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-600/20 text-amber-500 ring-1 ring-amber-600/40">
                              <Medal size={14} />
                            </span>
                          ) : (
                            <span className="font-[family-name:var(--font-space-mono)] font-bold text-zinc-500">
                              #{p.rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* VJudge Participant */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.avatar_url ? (
                            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
                              <Image
                                src={`/api/avatar?url=${encodeURIComponent(p.avatar_url)}`}
                                alt={p.vjudge_username}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 font-[family-name:var(--font-space-mono)] text-xs font-bold text-zinc-400">
                              {p.vjudge_username.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-white">{p.vjudge_username}</p>
                            {p.display_name && p.display_name !== p.vjudge_username && (
                              <p className="text-[11px] text-zinc-500">{p.display_name}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Solved */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex min-w-[28px] items-center justify-center rounded bg-emerald-500/10 px-2 py-0.5 font-[family-name:var(--font-space-mono)] text-xs font-bold text-emerald-400">
                          {p.solved}
                        </span>
                      </td>

                      {/* Penalty */}
                      <td className="px-4 py-3 text-center font-[family-name:var(--font-space-mono)] text-zinc-400">
                        {p.penalty}m
                      </td>

                      {/* Mapped Club Member Selector */}
                      <td className="relative px-4 py-3">
                        {isMapped ? (
                          <div className="flex items-center justify-between gap-2 rounded-sm border border-emerald-500/30 bg-emerald-500/[0.04] px-3 py-1.5">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <UserCheck size={12} className="shrink-0 text-emerald-400" />
                                <span className="truncate font-medium text-white">{p.user_name}</span>
                              </div>
                              <p className="truncate text-[10px] text-zinc-400">{p.user_email}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setOpenUserDropdownRow(isDropdownOpen ? null : p.uid)}
                                className="text-[10px] text-zinc-400 hover:text-white"
                                title="Change mapping"
                              >
                                Change
                              </button>
                              <button
                                onClick={() => handleMapUser(p.uid, null)}
                                className="p-1 text-zinc-500 hover:text-red-400"
                                title="Unmap member"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setOpenUserDropdownRow(isDropdownOpen ? null : p.uid);
                              setUserFilterText('');
                            }}
                            className="flex w-full items-center justify-between rounded-sm border border-dashed border-zinc-700 bg-zinc-900/40 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-[#fac71e] hover:text-white"
                          >
                            <span className="flex items-center gap-1.5">
                              <Users size={12} className="text-zinc-500" />
                              Map to club member…
                            </span>
                            <ChevronDown size={12} />
                          </button>
                        )}

                        {/* Searchable Member Dropdown */}
                        {isDropdownOpen && (
                          <div className="absolute top-full left-4 z-40 mt-1 w-80 rounded-sm border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <input
                                type="text"
                                autoFocus
                                value={userFilterText}
                                onChange={(e) => setUserFilterText(e.target.value)}
                                placeholder="Search by name or email…"
                                className="w-full rounded-sm border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-[#fac71e] focus:outline-none"
                              />
                              <button
                                onClick={() => setOpenUserDropdownRow(null)}
                                className="p-1 text-zinc-500 hover:text-white"
                                title="Close"
                              >
                                <X size={13} />
                              </button>
                            </div>
                            <div className="max-h-52 overflow-y-auto divide-y divide-zinc-900">
                              {filteredClubUsers.length === 0 ? (
                                <p className="py-3 text-center text-xs text-zinc-500">No members found.</p>
                              ) : (
                                filteredClubUsers.map((u) => (
                                  <button
                                    key={u.id}
                                    onClick={() => handleMapUser(p.uid, u)}
                                    className="flex w-full items-center justify-between p-2 text-left text-xs transition-colors hover:bg-zinc-900"
                                  >
                                    <div className="min-w-0 pr-2">
                                      <p className="truncate font-semibold text-white">{u.name}</p>
                                      <p className="truncate text-[10px] text-zinc-400">{u.email}</p>
                                    </div>
                                    {u.class && (
                                      <span className="shrink-0 rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">
                                        {u.class}-{u.section || ''}
                                      </span>
                                    )}
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Points to Award */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <input
                            type="number"
                            min="0"
                            step="5"
                            value={p.points_awarded || 0}
                            onChange={(e) => handleUpdatePoints(p.uid, parseInt(e.target.value) || 0)}
                            className="w-20 rounded-sm border border-zinc-800 bg-transparent px-2.5 py-1 text-right font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#fac71e] focus:border-[#fac71e] focus:outline-none"
                          />
                          <span className="font-[family-name:var(--font-space-mono)] text-[10px] text-zinc-500 uppercase">
                            XP
                          </span>
                        </div>
                        {p.awarded_at && (
                          <p className="mt-1 text-[10px] text-emerald-400">Awarded ✓</p>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Confirmation Modal for Points Award */}
        {showAwardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-sm border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#fac71e]/40 bg-[#fac71e]/10 text-[#fac71e]">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-space-mono)] text-sm font-bold tracking-wider text-white uppercase">
                    Award Contest Points
                  </h3>
                  <p className="text-xs text-zinc-400">Confirm points distribution to club members</p>
                </div>
              </div>

              <div className="space-y-3 rounded-sm border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-300">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">Contest Title:</span>
                  <span className="font-semibold text-white">{activeSnapshot.contest_title}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">Mapped Members:</span>
                  <span className="font-semibold text-emerald-400">{stats.mapped} users</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500">Total Points to Distribute:</span>
                  <span className="font-bold text-[#fac71e]">{stats.totalPoints} XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Points Category:</span>
                  <span className="font-semibold text-zinc-300">Competitive Programming</span>
                </div>
              </div>

              <p className="mt-4 text-xs text-zinc-400">
                This will award points to each mapped member under their profile and immediately reflect on the club&apos;s
                main Leaderboard.
              </p>

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAwardModal(false)}
                  className="rounded-sm border border-zinc-800 px-4 py-2 font-[family-name:var(--font-space-mono)] text-xs text-zinc-400 uppercase transition-colors hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteAward}
                  disabled={awardingPoints}
                  className="flex items-center gap-2 rounded-sm bg-[#fac71e] px-6 py-2 font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-wider text-black uppercase transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  <Check size={14} />
                  {awardingPoints ? 'Distributing…' : 'Confirm & Award'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Render Leaderboard Archives List View
  return (
    <div className="space-y-8">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold uppercase text-white">Archived CP Standings & Awards</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Save copies of contest leaderboards, map participants to registered club users, and award points.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeaderboards}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-sm border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 font-[family-name:var(--font-space-mono)] text-xs text-zinc-300 uppercase transition-colors hover:border-zinc-600 hover:text-white disabled:opacity-40"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          <button
            onClick={handleCaptureLiveContest}
            disabled={capturingLive}
            className="flex items-center gap-2 rounded-sm bg-[#fac71e] px-5 py-2.5 font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-wider text-black uppercase transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Camera size={14} />
            {capturingLive ? 'Fetching VJudge…' : 'Snapshot Active Contest'}
          </button>
        </div>
      </div>

      {/* Message feedback */}
      {message && (
        <div
          className={`flex items-center gap-3 rounded-sm border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400'
              : message.type === 'error'
              ? 'border-red-500/30 bg-red-500/[0.06] text-red-400'
              : 'border-sky-500/30 bg-sky-500/[0.06] text-sky-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={15} />
          ) : message.type === 'error' ? (
            <AlertTriangle size={15} />
          ) : (
            <Info size={15} />
          )}
          {message.text}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center gap-4 py-12">
          <div className="relative h-5 w-5 animate-spin">
            <Image src="/tc-logo.svg" alt="Loading" fill className="object-contain" />
          </div>
          <p className="text-sm text-zinc-500">
            Loading archived leaderboards
            <LoadingDots />
          </p>
        </div>
      ) : leaderboards.length === 0 ? (
        <div className="rounded-sm border border-dashed border-zinc-800 p-12 text-center">
          <Trophy size={32} className="mx-auto mb-3 text-zinc-600" />
          <h3 className="font-[family-name:var(--font-space-mono)] text-sm font-semibold tracking-wider text-white uppercase">
            No Saved Contest Leaderboards Yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-zinc-400">
            Click &quot;Snapshot Active Contest&quot; above to capture the current VJudge contest standings, map
            participants to Tech Club members, and distribute XP.
          </p>
          <button
            onClick={handleCaptureLiveContest}
            disabled={capturingLive}
            className="mt-6 inline-flex items-center gap-2 rounded-sm bg-[#fac71e] px-6 py-2.5 font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-wider text-black uppercase transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Camera size={14} />
            {capturingLive ? 'Fetching…' : 'Capture Active Contest Now'}
          </button>
        </div>
      ) : (
        /* Saved Leaderboards Grid / List */
        <div className="grid grid-cols-1 gap-4">
          {leaderboards.map((lb) => {
            const isAwarded = lb.status === 'awarded';
            return (
              <div
                key={lb.id}
                onClick={() => handleOpenSnapshot(lb.id)}
                className="group flex flex-col justify-between gap-4 rounded-sm border border-zinc-800 bg-zinc-950/40 p-5 transition-all hover:border-zinc-700 hover:bg-zinc-900/30 sm:flex-row sm:items-center cursor-pointer"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white uppercase transition-colors group-hover:text-[#fac71e]">
                      {lb.contest_title}
                    </span>
                    <span
                      className={`rounded-sm px-2 py-0.5 font-[family-name:var(--font-space-mono)] text-[10px] font-bold uppercase tracking-wider ${
                        isAwarded
                          ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border border-[#fac71e]/30 bg-[#fac71e]/10 text-[#fac71e]'
                      }`}
                    >
                      {isAwarded ? 'Points Awarded ✓' : 'Draft Standings'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-[family-name:var(--font-space-mono)] text-xs text-zinc-500">
                    <span>Contest #{lb.contest_id}</span>
                    <span>•</span>
                    <span>{lb.participant_count || 0} Participants</span>
                    <span>•</span>
                    <span className="text-zinc-400">
                      {lb.mapped_count || 0} Mapped to Members
                    </span>
                    {lb.saved_by && (
                      <>
                        <span>•</span>
                        <span>Saved by {lb.saved_by}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>
                      {new Date(lb.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenSnapshot(lb.id);
                    }}
                    className="flex items-center gap-1.5 rounded-sm border border-zinc-800 bg-zinc-900 px-4 py-2 font-[family-name:var(--font-space-mono)] text-xs font-semibold text-zinc-200 uppercase transition-colors hover:border-[#fac71e] hover:text-[#fac71e]"
                  >
                    Open & Award <Award size={13} />
                  </button>

                  <button
                    onClick={(e) => handleDeleteSnapshot(lb.id, e)}
                    className="rounded-sm border border-zinc-800 p-2 text-zinc-500 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                    title="Delete snapshot"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
