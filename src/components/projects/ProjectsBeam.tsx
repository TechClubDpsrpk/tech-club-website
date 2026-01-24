'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { TracingBeam } from '@/components/ui/tracing-beam';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import { Trash, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { LoadingDots } from '@/components/ui/loading-dots';

type Project = {
  id: string;
  title: string;
  description: string;
  image_url?: string | null;
  total_points: number;
  created_at: string;
};

function formatDate(date: string) {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTruncatedText(text: string, wordLimit: number = 10): string {
  const words = text.split(/\s+/);
  if (words.length <= wordLimit) {
    return text;
  }
  return words.slice(0, wordLimit).join(' ') + '...';
}

export function ProjectsBeam() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  useEffect(() => {
    checkAdmin();
    loadProjects();
  }, []);

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });

      if (!response.ok) {
        setIsAdmin(false);
        return;
      }

      const data = await response.json();

      if (!data?.user?.id) {
        setIsAdmin(false);
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", data.user.id)
        .single();

      setIsAdmin(userData?.is_admin || false);
    } catch (error) {
      console.error("Error checking admin:", error);
      setIsAdmin(false);
    }
  };

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProjects(data);
    }

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      alert("Only admins can delete quests");
      return;
    }

    if (!confirm("Are you sure you want to delete this quest?")) {
      return;
    }

    setDeletingId(id);
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error deleting quest: " + error.message);
    } else {
      setProjects(projects.filter((p) => p.id !== id));
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="relative h-16 w-16 animate-spin-slow">
          <Image
            src="/tc-logo.svg"
            alt="Loading"
            fill
            className="object-contain"
          />
        </div>
        <p className="text-xl font-bold text-[#C9A227] tracking-widest uppercase flex items-center justify-center">
          Loading Quests <LoadingDots />
        </p>
      </div>
    );
  }

  if (!projects.length) {
    return <p className="mt-10 text-center">No quests available yet</p>;
  }

  return (
    <TracingBeam className="px-6">
      <div className="relative mx-auto max-w-2xl pt-4 antialiased">
        {projects.map((project) => (
          <div key={project.id} className="mb-10">
            {/* Date badge */}
            <h2 className="mb-4 w-fit rounded-full bg-black px-4 py-1 font-[family-name:var(--font-vt)] text-white">
              {formatDate(project.created_at)}
            </h2>

            {/* Heading with points */}
            <div className="flex items-start justify-between mb-4">
              <p
                className={twMerge(
                  'font-[family-name:var(--font-space-mono)] text-xl flex-1'
                )}
              >
                {project.title}
              </p>
              <div className="ml-4 flex items-center gap-1 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/50 px-3 py-1 flex-shrink-0">
                <Image src="/tc-logo.svg" alt="Logo" width={16} height={16} />
                <span className="text-sm font-semibold text-[#C9A227]">
                  {project.total_points}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="prose prose-sm dark:prose-invert text-sm">
              {project.image_url && (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="mb-10 rounded-lg object-cover"
                />
              )}

              <ReactMarkdown>{getTruncatedText(project.description)}</ReactMarkdown>
            </div>

            {/* Buttons */}
            <div className="mt-4 flex gap-3">
              <Link href={`/quests/${project.id}`}>
                <button className="rounded-lg bg-[#C9A227] text-black px-4 py-2 font-semibold hover:bg-[#B8901E] transition">
                  Learn More
                </button>
              </Link>

              {isAdmin && (
                <button
                  onClick={() => handleDelete(project.id)}
                  disabled={deletingId === project.id}
                  onMouseEnter={() => setHoverId(project.id)}
                  onMouseLeave={() => setHoverId(null)}
                  className="flex items-center justify-center rounded-lg bg-red-500/20 border border-red-500/50 p-2 text-red-400 hover:bg-red-500/30 disabled:opacity-50 transition-all flex-shrink-0 hover:cursor-pointer"
                  title="Delete quest"
                >
                  {hoverId === project.id ? (
                    <Trash2 size={16} />
                  ) : (
                    <Trash size={16} />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </TracingBeam>
  );
}