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
    const { error } = await supabase.from('announcements').insert({
      heading,
      description,
      image_url: imageUrl || null,
    });

    if (error) {
      alert(error.message);
    } else {
      setHeading('');
      setDescription('');
      setImageUrl('');
      alert('Announcement added!');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-xl shadow-md">
      <input
        type="text"
        placeholder="Heading"
        value={heading}
        onChange={(e) => setHeading(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      <div>
        <textarea
          placeholder="Description (Markdown supported: **bold**, *italic*, [links](url), etc.)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border p-2 rounded"
          required
          rows={6}
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 Tip: Use **text** for bold, *text* for italic, [text](url) for links
        </p>
      </div>

      <input
        type="url"
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-[#C9A227] cursor-pointer text-white px-4 py-2 rounded-xl hover:bg-[#B8901E] focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:ring-offset-2 disabled:opacity-50 transition-[2s]"
      >
        {loading ? 'Adding...' : 'Add Announcement'}
      </button>
    </form>
  );
}