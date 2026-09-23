'use client';

import { useEffect, useState } from 'react';
import { TracingBeam } from '@/components/ui/tracing-beam';
import { twMerge } from 'tailwind-merge';
import { Trash, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { LoadingDots } from '@/components/ui/loading-dots';

type Announcement = {
  id: string;
  heading: string;
  description: string;
  image_url?: string | null;
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

export function Beam() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  useEffect(() => {
    checkAdmin();
    loadAnnouncements();
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

      if (!data?.user) {
        setIsAdmin(false);
        return;
      }

      const userRoles = data.user.roles || [];
      const isUserAdmin = data.user.is_admin || userRoles.length > 0;
      setIsAdmin(isUserAdmin);
    } catch (error) {
      console.error('Error checking admin:', error);
      setIsAdmin(false);
    }
  };

  const loadAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const { announcements: data } = await res.json();
        setAnnouncements(data || []);
      }
    } catch (e) {
      console.error('Failed to load announcements:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      alert('Only admins can delete announcements');
      return;
    }

    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    setDeletingId(id);
    const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert('Error deleting announcement: ' + (data.error || 'Failed to delete'));
    } else {
      setAnnouncements(announcements.filter((a) => a.id !== id));
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-[100vh]">
        <div className="mx-auto mb-8 max-w-4xl px-4">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-white">Announcements</h1>
            <p className="text-md mt-6 text-center text-neutral-300 md:text-lg">
              Latest insights and updates from our community
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center mt-[10%] space-y-4">
          <div className="relative h-20 w-20 animate-spin-slow">
            <Image
              src="/tc-logo.svg"
              alt="Loading"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xl font-bold text-[#C9A227] tracking-widest uppercase flex items-center justify-center">
            Broadcasting <LoadingDots />
          </p>
        </div>
      </div>
    );
  }

  if (!announcements.length) {
    return (
      <div className="min-h-[100vh]">
        <div className="mx-auto mb-8 max-w-4xl px-4">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-white">Announcements</h1>
            <p className="text-md mt-6 text-center text-neutral-300 md:text-lg">
              Latest insights and updates from our community
            </p>
          </div>
        </div>
        <p className="mt-[20%] text-center text-xl md:mt-[10%] md:text-3xl">No announcements yet</p>
        <p className="mt-1 text-center text-lg text-neutral-300">Stay Tuned!</p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto mb-8 max-w-4xl px-4">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-white">Announcements</h1>
          <p className="text-md mt-6 text-center text-neutral-300 md:text-lg">
            Latest insights and updates from our community
          </p>
        </div>
      </div>
      <TracingBeam className="px-6">
        <div className="relative mx-auto max-w-2xl pt-4 antialiased">
          {announcements.map((a) => (
            <div key={a.id} className="relative mb-10">
              {/* Date badge */}
              <h2 className="mb-2 w-fit rounded-full bg-black py-1 font-mono text-sm text-neutral-400">
                {formatDate(a.created_at)}
              </h2>

              {/* Heading */}
              <div className="flex items-start justify-between">
                <p className={twMerge('mb-4 flex-1 text-xl md:text-3xl')}>{a.heading}</p>

                {/* Delete button (admin only) - top right */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                    onMouseEnter={() => setHoverId(a.id)}
                    onMouseLeave={() => setHoverId(null)}
                    className="ml-4 flex flex-shrink-0 items-center justify-center rounded-lg border border-red-500/50 bg-red-500/20 p-2 text-red-400 transition-all hover:bg-red-500/30 disabled:opacity-50"
                    title="Delete announcement"
                  >
                    {hoverId === a.id ? <Trash2 size={16} /> : <Trash size={16} />}
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="prose prose-sm dark:prose-invert text-sm">
                {a.image_url && (
                  <img
                    src={a.image_url}
                    alt="announcement"
                    className="mb-10 rounded-md object-cover"
                  />
                )}

                <ReactMarkdown className="text-base">{a.description}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </TracingBeam>
    </>
  );
}
