'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ExternalLink, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import { LoadingDots } from '@/components/ui/loading-dots';

type Submission = {
  id: string;
  user_id: string;
  project_id: string;
  github_link: string | null;
  drive_link: string | null;
  status: 'pending' | 'approved' | 'rejected';
  points_awarded: number;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  project: {
    title: string;
    total_points: number;
  };
};

const inputClass =
  'w-full rounded-sm border border-zinc-800 bg-transparent px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#fac71e]';

export default function ProjectSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [pointsInput, setPointsInput] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('project_submissions')
        .select(
          `id, user_id, project_id, github_link, drive_link, status, points_awarded, created_at,
           users:user_id (name, email),
           projects:project_id (title, total_points)`
        )
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to fetch submissions');
        return;
      }

      const formattedData =
        data?.map((sub: any) => ({
          id: sub.id,
          user_id: sub.user_id,
          project_id: sub.project_id,
          github_link: sub.github_link,
          drive_link: sub.drive_link,
          status: sub.status,
          points_awarded: sub.points_awarded,
          created_at: sub.created_at,
          user: Array.isArray(sub.users) ? sub.users[0] : sub.users,
          project: Array.isArray(sub.projects) ? sub.projects[0] : sub.projects,
        })) || [];

      setSubmissions(formattedData);
    } catch (err) {
      setError('An error occurred while fetching submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string, projectId: string, userId: string) => {
    const points = parseInt(pointsInput[submissionId] || '0');
    if (points <= 0) {
      alert('Please enter valid points');
      return;
    }

    setApproving(submissionId);
    try {
      const response = await fetch('/api/submissions/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, status: 'approved', points, projectId, userId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setSubmissions(
        submissions.map((sub) =>
          sub.id === submissionId ? { ...sub, status: 'approved', points_awarded: points } : sub
        )
      );
      setPointsInput({ ...pointsInput, [submissionId]: '' });
      setExpandedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve submission');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (submissionId: string) => {
    if (!confirm('Are you sure you want to reject this submission?')) return;

    setRejecting(submissionId);
    try {
      const response = await fetch('/api/submissions/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, status: 'rejected' }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setSubmissions(
        submissions.map((sub) => (sub.id === submissionId ? { ...sub, status: 'rejected' } : sub))
      );
      setExpandedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject submission');
    } finally {
      setRejecting(null);
    }
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const approvedCount = submissions.filter((s) => s.status === 'approved').length;

  if (loading) {
    return (
      <div className="flex items-center gap-4 py-10">
        <div className="relative h-5 w-5 animate-spin">
          <Image src="/tc-logo.svg" alt="Loading" fill className="object-contain" />
        </div>
        <p className="text-sm text-zinc-500">
          Fetching submissions
          <LoadingDots />
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="flex items-center gap-3 rounded-sm border border-red-500/30 bg-red-500/[0.06] px-4 py-3">
          <AlertCircle size={13} className="shrink-0 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: submissions.length, color: 'text-white' },
          { label: 'Pending', value: pendingCount, color: 'text-[#fac71e]' },
          { label: 'Approved', value: approvedCount, color: 'text-emerald-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-sm border border-zinc-800 p-4">
            <p className="mb-1 font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-zinc-500 uppercase">
              {label}
            </p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {submissions.length === 0 ? (
        <p className="text-sm text-zinc-500">No submissions yet.</p>
      ) : (
        <ul className="divide-y divide-zinc-900">
          {submissions.map((submission) => (
            <li key={submission.id} className="overflow-hidden">
              {/* Row header — toggle */}
              <button
                onClick={() => setExpandedId(expandedId === submission.id ? null : submission.id)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:bg-zinc-950"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-white">{submission.user.name}</span>
                    <span className="text-sm text-zinc-500">{submission.project.title}</span>

                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 font-[family-name:var(--font-space-mono)] text-[10px] tracking-wider uppercase ${
                        submission.status === 'pending'
                          ? 'border border-[#fac71e]/20 bg-[#fac71e]/[0.06] text-[#fac71e]'
                          : submission.status === 'approved'
                            ? 'border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400'
                            : 'border border-red-500/20 bg-red-500/[0.06] text-red-400'
                      }`}
                    >
                      {submission.status === 'pending' ? (
                        <AlertCircle size={10} />
                      ) : submission.status === 'approved' ? (
                        <CheckCircle size={10} />
                      ) : (
                        <XCircle size={10} />
                      )}
                      {submission.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600">{submission.user.email}</p>
                </div>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-zinc-500 transition-transform ${
                    expandedId === submission.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Expanded panel */}
              {expandedId === submission.id && (
                <div className="space-y-5 border-t border-zinc-900 pt-5 pb-6">
                  {/* Links */}
                  <div className="space-y-3">
                    {submission.github_link && (
                      <div className="flex items-center justify-between">
                        <span className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-500 uppercase">
                          GitHub
                        </span>
                        <a
                          href={submission.github_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 font-[family-name:var(--font-space-mono)] text-xs text-[#fac71e] transition-opacity hover:opacity-70"
                        >
                          View Repository <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                    {submission.drive_link && (
                      <div className="flex items-center justify-between">
                        <span className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-500 uppercase">
                          Google Drive
                        </span>
                        <a
                          href={submission.drive_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 font-[family-name:var(--font-space-mono)] text-xs text-[#fac71e] transition-opacity hover:opacity-70"
                        >
                          View Files <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-500 uppercase">
                        Max Points
                      </span>
                      <span className="text-sm font-medium text-white">
                        {submission.project.total_points}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {submission.status === 'pending' ? (
                    <div className="space-y-4 border-t border-zinc-900 pt-4">
                      <div>
                        <label className="mb-2 block font-[family-name:var(--font-space-mono)] text-xs tracking-[0.12em] text-zinc-400 uppercase">
                          Award Points{' '}
                          <span className="text-zinc-600">
                            (max {submission.project.total_points})
                          </span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={submission.project.total_points}
                          placeholder="Points to award"
                          value={pointsInput[submission.id] || ''}
                          onChange={(e) =>
                            setPointsInput({ ...pointsInput, [submission.id]: e.target.value })
                          }
                          className={inputClass}
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            handleApprove(submission.id, submission.project_id, submission.user_id)
                          }
                          disabled={approving === submission.id}
                          className="flex flex-1 items-center justify-center gap-2 rounded-sm border border-emerald-500/30 bg-emerald-500/[0.06] px-4 py-2.5 font-[family-name:var(--font-space-mono)] text-xs text-emerald-400 uppercase transition-colors hover:bg-emerald-500/10 disabled:opacity-40"
                        >
                          <CheckCircle size={13} />
                          {approving === submission.id ? 'Approving…' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(submission.id)}
                          disabled={rejecting === submission.id}
                          className="flex flex-1 items-center justify-center gap-2 rounded-sm border border-red-500/30 bg-red-500/[0.06] px-4 py-2.5 font-[family-name:var(--font-space-mono)] text-xs text-red-400 uppercase transition-colors hover:bg-red-500/10 disabled:opacity-40"
                        >
                          <XCircle size={13} />
                          {rejecting === submission.id ? 'Rejecting…' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-zinc-900 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-500 uppercase">
                          Points Awarded
                        </span>
                        <div className="flex items-center gap-2 rounded-sm border border-[#fac71e]/20 bg-[#fac71e]/[0.06] px-3 py-1.5">
                          <Image src="/tc-logo.svg" alt="TC" width={12} height={12} />
                          <span className="text-sm font-bold text-[#fac71e]">
                            {submission.points_awarded}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
