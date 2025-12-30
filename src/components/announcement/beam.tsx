'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TracingBeam } from '@/components/ui/tracing-beam';
import { twMerge } from 'tailwind-merge';
import { Trash, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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

      if (!data?.user?.id) {
        setIsAdmin(false);
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();

      setIsAdmin(userData?.is_admin || false);
    } catch (error) {
      console.error('Error checking admin:', error);
      setIsAdmin(false);
    }
  };

  const loadAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnnouncements(data);
    }

    setLoading(false);
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
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting announcement: ' + error.message);
    } else {
      setAnnouncements(announcements.filter((a) => a.id !== id));
    }
    setDeletingId(null);
  };

  if (loading) {
    return <p className="mt-10 text-center">Loading announcements…</p>;
  }

  if (!announcements.length) {
    return <p className="mt-10 text-center">No announcements yet</p>;
  }

  return (
    <TracingBeam className="px-6">
      <div className="relative mx-auto max-w-2xl pt-4 antialiased">
        {announcements.map((a) => (
          <div key={a.id} className="mb-10 relative">
            {/* Date badge */}
            <h2 className="mb-4 w-fit rounded-full bg-black px-4 py-1 font-[family-name:var(--font-vt)] text-white">
              {formatDate(a.created_at)}
            </h2>

            {/* Heading */}
            <div className="flex items-start justify-between">
              <p
                className={twMerge(
                  'mb-4 font-[family-name:var(--font-space-mono)] text-xl flex-1'
                )}
              >
                {a.heading}
              </p>
              
              {/* Delete button (admin only) - top right */}
              {isAdmin && (
                <button
                  onClick={() => handleDelete(a.id)}
                  disabled={deletingId === a.id}
                  onMouseEnter={() => setHoverId(a.id)}
                  onMouseLeave={() => setHoverId(null)}
                  className="ml-4 flex items-center justify-center rounded-lg bg-red-500/20 border border-red-500/50 p-2 text-red-400 hover:bg-red-500/30 disabled:opacity-50 transition-all flex-shrink-0"
                  title="Delete announcement"
                >
                  {hoverId === a.id ? (
                    <Trash2 size={16} />
                  ) : (
                    <Trash size={16} />
                  )}
                </button>
              )}
            </div>

            {/* Content */}
            <div className="prose prose-sm dark:prose-invert text-sm">
              {a.image_url && (
                <img
                  src={a.image_url}
                  alt="announcement"
                  className="mb-10 rounded-lg object-cover"
                />
              )}

              <ReactMarkdown>{a.description}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </TracingBeam>
  );
}