'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const NICHES = [
  'Robotics',
  'Development',
  'Competitive Programming',
  'AI',
  'Videography',
  'Graphics Designing',
];

export default function AddProject() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [totalPoints, setTotalPoints] = useState('');
  const [niche, setNiche] = useState('');
  const [loading, setLoading] = useState(false);

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

    const { error } = await supabase.from('projects').insert({
      title,
      description,
      image_url: imageUrl || null,
      total_points: parseInt(totalPoints),
      niche,
    });

    if (error) {
      alert(error.message);
    } else {
      setTitle('');
      setDescription('');
      setImageUrl('');
      setTotalPoints('');
      setNiche('');
      alert('Project created successfully!');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Project Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border border-gray-700 bg-gray-900/60 p-3 rounded-lg text-white placeholder-gray-400 focus:border-[#C9A227] focus:outline-none transition"
        required
      />

      <textarea
        placeholder="Project Description (Markdown supported)"
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

      <input
        type="number"
        placeholder="Total Points for this project"
        value={totalPoints}
        onChange={(e) => setTotalPoints(e.target.value)}
        className="w-full border border-gray-700 bg-gray-900/60 p-3 rounded-lg text-white placeholder-gray-400 focus:border-[#C9A227] focus:outline-none transition"
        required
        min="1"
      />

      <select
        value={niche}
        onChange={(e) => setNiche(e.target.value)}
        className="w-full border border-gray-700 bg-gray-900/60 p-3 rounded-lg text-white focus:border-[#C9A227] focus:outline-none transition"
        required
      >
        <option value="">Select a Niche</option>
        {NICHES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#C9A227] cursor-pointer text-black px-4 py-3 rounded-lg hover:bg-[#B8901E] focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:ring-offset-2 disabled:opacity-50 transition font-semibold"
      >
        {loading ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  );
}