'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

// ── shared input style matching account page ──────────────────────────────────
const inputClass =
  'w-full rounded-sm border border-zinc-800 bg-transparent px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#fac71e] disabled:cursor-not-allowed disabled:text-zinc-700';

const Field = ({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <div className="mb-2 flex items-center gap-2">
      <span className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.12em] text-zinc-400 uppercase">
        {label}
      </span>
      {optional && (
        <span className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-600">
          optional
        </span>
      )}
    </div>
    {children}
  </div>
);

export default function AddAnnouncement() {
  const [heading, setHeading] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (imageUrl && !imageUrl.startsWith('http')) {
      alert('Please enter a valid image URL');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          heading,
          description,
          image_url: imageUrl || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create announcement');
      }

      setHeading('');
      setDescription('');
      setImageUrl('');
      alert('Announcement added successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Field label="Heading">
        <input
          type="text"
          placeholder="Announcement title"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className={inputClass}
          required
        />
      </Field>

      <Field label="Description">
        <textarea
          placeholder="Markdown supported: **bold**, *italic*, [links](url)…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} resize-none`}
          required
          rows={6}
        />
      </Field>

      <Field label="Image URL" optional>
        <input
          type="url"
          placeholder="https://…"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={loading}
        className="rounded-sm bg-[#fac71e] px-8 py-3 font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-widest text-black uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
      >
        {loading ? 'Publishing…' : 'Publish Announcement'}
      </button>
    </form>
  );
}
