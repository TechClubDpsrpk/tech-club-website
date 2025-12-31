'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { TracingBeam } from '@/components/ui/tracing-beam';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

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

  useEffect(() => {
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

    loadProjects();
  }, []);

  if (loading) {
    return <p className="mt-10 text-center">Loading quests…</p>;
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

            {/* Learn More button - only this is clickable */}
            <Link href={`/projects/${project.id}`}>
              <button className="mt-4 rounded-lg bg-[#C9A227] text-black px-4 py-2 font-semibold hover:bg-[#B8901E] transition">
                Learn More
              </button>
            </Link>
          </div>
        ))}
      </div>
    </TracingBeam>
  );
}