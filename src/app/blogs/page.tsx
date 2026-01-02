'use client';

import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { TracingBeam } from '@/components/ui/tracing-beam';
import { twMerge } from 'tailwind-merge';

interface BlogPost {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  thumbnail?: string;
  author: string;
  categories: string[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function Blogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
          'https://medium.com/feed/@techclubdpsrpk'
        )}`
      );
      const data = await response.json();

      if (data.status === 'ok') {
        const formattedPosts = data.items.map((item: any) => {
          // Remove HTML tags from description
          let cleanDesc = item.description.replace(/<[^>]*>/g, '').trim();
          
          let extractedAuthor = null;

          // Match: By John Doe / by John Doe / -by John Doe
          const authorRegex = /^\s*(?:[-–]\s*)?by\s+([A-Za-z]+)\s+([A-Za-z]+)/i;



          const authorMatch = cleanDesc.match(authorRegex);

          if (authorMatch) {
            extractedAuthor = `${authorMatch[1]} ${authorMatch[2]}`.trim();
            cleanDesc = cleanDesc.replace(authorRegex, '').trim();
          }
          return {
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            description: cleanDesc.substring(0, 200) + '...',
            thumbnail: item.thumbnail || item.enclosure?.link,
            author: extractedAuthor,
            categories: item.categories || [],
          };
        });
        setPosts(formattedPosts);
      } else {
        setError('Failed to fetch blog posts');
      }
    } catch (err) {
      setError('Error loading blog posts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Blogs</h1>
            <p className="text-gray-400">
              Latest insights and updates from our community
            </p>
          </div>
        </div>
        <p className="mt-10 text-center text-white">Loading blog posts…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Blogs</h1>
            <p className="text-gray-400">
              Latest insights and updates from our community
            </p>
          </div>
        </div>
        <p className="mt-10 text-center text-red-400">{error}</p>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Blogs</h1>
            <p className="text-gray-400">
              Latest insights and updates from our community
            </p>
          </div>
        </div>
        <p className="mt-10 text-center text-white">No blog posts yet</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Blogs</h1>
          <p className="text-gray-400">
            Latest insights and updates from our community
          </p>
        </div>
      </div>
      <TracingBeam className="px-6">
        <div className="relative mx-auto max-w-2xl pt-4 antialiased">
          {posts.map((post, index) => (
            <div key={index} className="mb-10 relative">
              {/* Date badge */}
              <h2 className="mb-4 w-fit rounded-full bg-black px-4 py-1 font-[family-name:var(--font-vt)] text-white">
                {formatDate(post.pubDate)}
              </h2>

              {/* Title */}
              <div className="mb-4">
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={twMerge(
                    'font-[family-name:var(--font-space-mono)] text-xl hover:underline block mb-2'
                  )}
                >
                  {post.title}
                </a>
                
                {/* Author byline */}
                {post.author && (
                  <p className="text-sm text-gray-500 mb-3">by {post.author}</p>
                )}
                
                {/* Categories */}
                {post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.categories.slice(0, 3).map((cat, i) => (
                      <span
                        key={i}
                        className="text-xs bg-black/50 px-3 py-1 rounded-full"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="prose prose-sm dark:prose-invert text-sm">
                {post.thumbnail && (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="mb-4 rounded-lg object-cover w-full"
                  />
                )}

                <p className="text-gray-300 mb-4">
                  {post.description}
                </p>

                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold group/link no-underline"
                >
                  Read on Medium
                  <ExternalLink
                    size={16}
                    className="group-hover/link:translate-x-1 transition-transform"
                  />
                </a>
              </div>
            </div>
          ))}
        </div>
      </TracingBeam>
    </div>
  );
}