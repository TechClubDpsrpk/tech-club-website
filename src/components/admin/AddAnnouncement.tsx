'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Announcement Heading"
        value={heading}
        onChange={(e) => setHeading(e.target.value)}
        className="w-full border border-gray-700 bg-gray-900/60 p-3 rounded-lg text-white placeholder-gray-400 focus:border-[#C9A227] focus:outline-none transition"
        required
      />

      <textarea
        placeholder="Description (Markdown supported: **bold**, *italic*, [links](url), etc.)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border border-gray-700 bg-gray-900/60 p-3 rounded-lg text-white placeholder-gray-400 focus:border-[#C9A227] focus:outline-none transition"
        required
        rows={6}
      />

      <input
        type="url"
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="w-full border border-gray-700 bg-gray-900/60 p-3 rounded-lg text-white placeholder-gray-400 focus:border-[#C9A227] focus:outline-none transition"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#C9A227] cursor-pointer text-black px-4 py-3 rounded-lg hover:bg-[#B8901E] focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:ring-offset-2 disabled:opacity-50 transition font-semibold"
      >
        {loading ? 'Adding...' : 'Add Announcement'}
      </button>
    </form>
  );
}