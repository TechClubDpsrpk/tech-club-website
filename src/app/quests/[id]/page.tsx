'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { X, Github } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

type Project = {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  total_points: number;
  created_at: string;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    githubLink: '',
    driveLink: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      // Check authentication
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.user?.id) {
            setIsAuthenticated(true);
            setUserId(data.user.id);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }

      // Fetch project
      const { data: projectData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error || !projectData) {
        setLoading(false);
        return;
      }

      setProject(projectData);

      // Check if user already submitted
      if (userId) {
        const { data: submission } = await supabase
          .from('project_submissions')
          .select('id')
          .eq('user_id', userId)
          .eq('project_id', projectId)
          .single();

        if (submission) {
          setHasSubmitted(true);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [projectId, userId]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !userId) {
      showMsg('error', 'Please log in to participate');
      router.push('/login');
      return;
    }

    if (!formData.githubLink && !formData.driveLink) {
      showMsg('error', 'Please provide either a GitHub link or Google Drive link');
      return;
    }

    if (formData.githubLink && !formData.githubLink.includes('github.com')) {
      showMsg('error', 'Please enter a valid GitHub link');
      return;
    }

    if (formData.driveLink && !formData.driveLink.includes('drive.google.com')) {
      showMsg('error', 'Please enter a valid Google Drive link');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('project_submissions').insert({
        user_id: userId,
        project_id: projectId,
        github_link: formData.githubLink || null,
        drive_link: formData.driveLink || null,
        status: 'pending',
      });

      if (error) {
        if (error.message.includes('duplicate')) {
          showMsg('error', 'You have already submitted for this project');
        } else {
          showMsg('error', error.message);
        }
        return;
      }

      setFormData({ githubLink: '', driveLink: '' });
      setShowModal(false);
      setHasSubmitted(true);
      showMsg('success', 'Submission received! Awaiting admin review.');
    } catch (err) {
      showMsg('error', 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black pt-24">
        <p className="text-white">Loading project…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black pt-24">
        <p className="text-white">Project not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      {/* Toast */}
      {message && (
        <div
          className={`fixed top-8 right-4 rounded-lg border px-6 py-3 backdrop-blur-xl z-50 ${
            message.type === 'success'
              ? 'bg-green-500/20 border-green-500/50 text-green-200'
              : 'bg-red-500/20 border-red-500/50 text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mx-auto max-w-2xl px-4">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-6 text-gray-400 hover:text-white transition"
        >
          ← Back
        </button>

        {/* Header with title and points */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/50 px-4 py-2">
          <Image src="/tc-logo.svg" alt="Logo" width={20} height={20} />
            <span className="text-lg font-semibold text-[#C9A227]">
              {project.total_points} pts
            </span>
          </div>
        </div>

        {/* Project image */}
        {project.image_url && (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full rounded-lg object-cover mb-8 max-h-96"
          />
        )}

        {/* Description */}
        <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
          <ReactMarkdown>{project.description}</ReactMarkdown>
        </div>

        {/* Participate button */}
        {!hasSubmitted ? (
          <button
            onClick={() => {
              if (!isAuthenticated) {
                router.push('/login');
                return;
              }
              setShowModal(true);
            }}
            className="w-full bg-[#C9A227] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#B8901E] transition cursor-pointer"
          >
            Participate Now
          </button>
        ) : (
          <div className="w-full bg-green-500/20 border border-green-500/50 text-green-300 px-6 py-3 rounded-lg text-center font-semibold">
            ✓ Submitted
          </div>
        )}
      </div>

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-md rounded-2xl border border-[#C9A227]/50 bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-8 shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-white mb-6">Submit Your Work</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub Repository Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username/repo"
                  value={formData.githubLink}
                  onChange={(e) =>
                    setFormData({ ...formData, githubLink: e.target.value })
                  }
                  className="w-full border border-gray-700 bg-gray-900/60 p-3 rounded-lg text-white placeholder-gray-500 focus:border-[#C9A227] focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Google Drive Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={formData.driveLink}
                  onChange={(e) =>
                    setFormData({ ...formData, driveLink: e.target.value })
                  }
                  className="w-full border border-gray-700 bg-gray-900/60 p-3 rounded-lg text-white placeholder-gray-500 focus:border-[#C9A227] focus:outline-none transition"
                />
              </div>

              <p className="text-xs text-gray-400">
                * Please provide at least one link (GitHub or Google Drive)
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#C9A227] text-black px-4 py-3 rounded-lg font-semibold hover:bg-[#B8901E] disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}