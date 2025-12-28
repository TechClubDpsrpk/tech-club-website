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
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded shadow-md">
      <input
        type="text"
        placeholder="Heading"
        value={heading}
        onChange={(e) => setHeading(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border p-2 rounded"
        required
      />

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
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Adding...' : 'Add Announcement'}
      </button>
    </form>
  );
}
