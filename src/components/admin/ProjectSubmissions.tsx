'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
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
          `
          id,
          user_id,
          project_id,
          github_link,
          drive_link,
          status,
          points_awarded,
          created_at,
          users:user_id (name, email),
          projects:project_id (title, total_points)
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        setError('Failed to fetch submissions');
        return;
      }

      // Format the data properly
      const formattedData = data?.map((sub: any) => ({
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
        body: JSON.stringify({
          submissionId,
          status: 'approved',
          points,
          projectId,
          userId
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      // Update local state
      setSubmissions(
        submissions.map((sub) =>
          sub.id === submissionId
            ? { ...sub, status: 'approved', points_awarded: points }
            : sub
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
        body: JSON.stringify({
          submissionId,
          status: 'rejected'
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setSubmissions(
        submissions.map((sub) =>
          sub.id === submissionId ? { ...sub, status: 'rejected' } : sub
        )
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
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="relative h-12 w-12 animate-spin-slow">
          <Image
            src="/tc-logo.svg"
            alt="Loading"
            fill
            className="object-contain"
          />
        </div>
        <p className="text-sm text-[#C9A227]/70 font-medium tracking-widest uppercase flex items-center justify-center">
          Fetching Submissions <LoadingDots />
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-500/50 bg-red-500/20 px-4 py-3 text-red-200">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-700/30 bg-gray-800/20 p-4">
          <p className="text-sm text-gray-400">Total Submissions</p>
          <p className="mt-1 text-2xl font-bold text-white">{submissions.length}</p>
        </div>
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-sm text-yellow-400">Pending Review</p>
          <p className="mt-1 text-2xl font-bold text-yellow-300">{pendingCount}</p>
        </div>
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <p className="text-sm text-green-400">Approved</p>
          <p className="mt-1 text-2xl font-bold text-green-300">{approvedCount}</p>
        </div>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="rounded-lg border border-gray-700/30 bg-gray-800/20 p-8 text-center">
          <p className="text-gray-400">No submissions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="border border-gray-700/30 rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === submission.id ? null : submission.id)
                }
                className="w-full px-4 py-4 hover:bg-gray-800/30 transition flex items-center justify-between text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">
                      {submission.user.name}
                    </h3>
                    <span className="text-sm text-gray-400">
                      {submission.project.title}
                    </span>
                    <div
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${submission.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : submission.status === 'approved'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                        }`}
                    >
                      {submission.status === 'pending' ? (
                        <AlertCircle size={12} />
                      ) : submission.status === 'approved' ? (
                        <CheckCircle size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                      {submission.status.charAt(0).toUpperCase() +
                        submission.status.slice(1)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{submission.user.email}</p>
                </div>
                <ChevronDown
                  size={20}
                  className={`text-gray-400 transition ${expandedId === submission.id ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {expandedId === submission.id && (
                <div className="border-t border-gray-700/30 bg-gray-800/20 px-4 py-4 space-y-4">
                  {/* Submission links */}
                  <div className="space-y-2">
                    {submission.github_link && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">GitHub:</span>
                        <a
                          href={submission.github_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View Repository
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                    {submission.drive_link && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Google Drive:</span>
                        <a
                          href={submission.drive_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View Files
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Project info */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Max Points:</span>
                    <span className="text-white font-medium">
                      {submission.project.total_points}
                    </span>
                  </div>

                  {/* Actions based on status */}
                  {submission.status === 'pending' ? (
                    <div className="pt-2 border-t border-gray-700/30 space-y-3">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Award Points (Max: {submission.project.total_points})
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={submission.project.total_points}
                          placeholder="Points to award"
                          value={pointsInput[submission.id] || ''}
                          onChange={(e) =>
                            setPointsInput({
                              ...pointsInput,
                              [submission.id]: e.target.value,
                            })
                          }
                          className="w-full border border-gray-700 bg-gray-900/60 p-2 rounded text-white text-sm focus:border-[#C9A227] focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleApprove(
                              submission.id,
                              submission.project_id,
                              submission.user_id
                            )
                          }
                          disabled={approving === submission.id}
                          className="flex-1 bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/50 px-3 py-2 rounded text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={16} />
                          {approving === submission.id ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleReject(submission.id)}
                          disabled={rejecting === submission.id}
                          className="flex-1 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/50 px-3 py-2 rounded text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <XCircle size={16} />
                          {rejecting === submission.id ? 'Rejecting...' : 'Reject'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-gray-700/30">
                      <p className="text-sm text-gray-400">
                        Points Awarded:{' '}
                        <span className="text-white font-medium">
                          {submission.points_awarded}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}