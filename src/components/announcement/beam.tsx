'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { TracingBeam } from '@/components/ui/tracing-beam';
import { twMerge } from 'tailwind-merge';

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

  useEffect(() => {
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

    loadAnnouncements();
  }, []);

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
          <div key={a.id} className="mb-10">
            {/* Date badge */}
            <h2 className="mb-4 w-fit rounded-full bg-black px-4 py-1 font-[family-name:var(--font-vt)] text-white">
              {formatDate(a.created_at)}
            </h2>

            {/* Heading */}
            <p
              className={twMerge(
                'mb-4 font-[family-name:var(--font-space-mono)] text-xl'
              )}
            >
              {a.heading}
            </p>

            {/* Content */}
            <div className="prose prose-sm dark:prose-invert text-sm">
              {a.image_url && (
                <img
                  src={a.image_url}
                  alt="announcement"
                  className="mb-10 rounded-lg object-cover"
                />
              )}

              <p>{a.description}</p>
            </div>
          </div>
        ))}
      </div>
    </TracingBeam>
  );
}
