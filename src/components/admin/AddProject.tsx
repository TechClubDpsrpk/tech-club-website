'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { DEFAULT_NICHES } from '@/lib/constants';
import { Plus } from 'lucide-react';

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

export default function AddProject() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [totalPoints, setTotalPoints] = useState('');
  const [nicheList, setNicheList] = useState<string[]>(DEFAULT_NICHES);
  const [niche, setNiche] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customNicheInput, setCustomNicheInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCustomNiche = () => {
    const trimmed = customNicheInput.trim();
    if (!trimmed) return;
    if (!nicheList.includes(trimmed)) {
      setNicheList((prev) => [...prev, trimmed]);
    }
    setNiche(trimmed);
    setCustomNicheInput('');
    setShowAddCustom(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (imageUrl && !imageUrl.startsWith('http')) {
      alert('Please enter a valid image URL');
      setLoading(false);
      return;
    }

    if (!totalPoints || parseInt(totalPoints) <= 0) {
      alert('Please enter valid points (must be greater than 0)');
      setLoading(false);
      return;
    }

    if (!niche) {
      alert('Please select a niche');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          image_url: imageUrl || null,
          total_points: parseInt(totalPoints),
          niche,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project');
      }

      setTitle('');
      setDescription('');
      setImageUrl('');
      setTotalPoints('');
      setNiche('');
      alert('Project created successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <Field label="Project Title">
        <input
          type="text"
          placeholder="e.g. Build a CLI Tool"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          required
        />
      </Field>

      <Field label="Description">
        <textarea
          placeholder="Markdown supported"
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Total Points">
          <input
            type="number"
            placeholder="e.g. 100"
            value={totalPoints}
            onChange={(e) => setTotalPoints(e.target.value)}
            className={inputClass}
            required
            min="1"
          />
        </Field>

        <Field label="Niche">
          {/* Native select styled to match */}
          <select
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            required
            className="w-full rounded-sm border border-zinc-800 bg-black px-4 py-3 text-sm text-white transition-colors outline-none focus:border-[#fac71e] disabled:cursor-not-allowed"
          >
            <option value="" disabled className="text-zinc-600">
              Select a niche
            </option>
            {nicheList.map((n) => (
              <option key={n} value={n} className="bg-black text-white">
                {n}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Niche toggle pills — mirrors account page's niche selector */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.12em] text-zinc-400 uppercase">
            Or pick niche
          </p>
          <button
            type="button"
            onClick={() => setShowAddCustom(!showAddCustom)}
            className="flex items-center gap-1 font-[family-name:var(--font-space-mono)] text-xs text-[#fac71e] hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Niche
          </button>
        </div>

        {showAddCustom && (
          <div className="mb-4 flex gap-2">
            <input
              type="text"
              placeholder="Enter custom niche..."
              value={customNicheInput}
              onChange={(e) => setCustomNicheInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomNiche();
                }
              }}
              className="flex-1 rounded-sm border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-white outline-none focus:border-[#fac71e]"
            />
            <button
              type="button"
              onClick={handleAddCustomNiche}
              className="rounded-sm bg-[#fac71e] px-4 py-1.5 font-[family-name:var(--font-space-mono)] text-xs font-bold text-black uppercase"
            >
              Add
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {nicheList.map((n) => {
            const active = niche === n;
            return (
              <button
                type="button"
                key={n}
                onClick={() => setNiche(n)}
                className={`rounded-sm border px-3 py-2.5 text-left font-[family-name:var(--font-space-mono)] text-[10px] tracking-wider uppercase transition-colors ${active
                    ? 'border-[#fac71e] text-[#fac71e]'
                    : 'border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400'
                  }`}
              >
                {active && <span className="mr-2">✓</span>}
                {n}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setShowAddCustom(true)}
            className="flex items-center justify-center gap-1.5 rounded-sm border border-dashed border-zinc-800 px-3 py-2.5 font-[family-name:var(--font-space-mono)] text-[10px] tracking-wider text-zinc-500 uppercase transition-colors hover:border-[#fac71e] hover:text-[#fac71e]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add More
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-sm bg-[#fac71e] px-8 py-3 font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-widest text-black uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
      >
        {loading ? 'Creating…' : 'Create Project'}
      </button>
    </form>
  );
}
