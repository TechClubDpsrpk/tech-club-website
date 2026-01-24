'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { TracingBeam } from '@/components/ui/tracing-beam';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';
import { LoadingDots } from '@/components/ui/loading-dots';

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
      <div className="min-h-screen bg-black pt-24 pb-16 flex flex-col">
        <div className="mx-auto mb-8 max-w-4xl px-4">
          <div>
            <h1 className="mb-2 text-center text-4xl font-bold text-white">Blogs</h1>
            <p className="text-md mt-6 text-center text-neutral-300 md:text-lg">
              Latest insights and updates from our community
            </p>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-16 w-16 animate-spin-slow">
              <Image
                src="/tc-logo.svg"
                alt="Loading"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-xl font-medium text-[#C9A227] tracking-widest uppercase flex items-center justify-center">
              Fetching Stories <LoadingDots />
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black pt-24 pb-16">
        <div className="mx-auto mb-8 max-w-4xl px-4">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-white">Blogs</h1>
            <p className="text-md mt-6 text-center text-neutral-300 md:text-lg">
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
        <div className="mx-auto mb-8 max-w-4xl px-4">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-white">Blogs</h1>
            <p className="text-md mt-6 text-center text-neutral-300 md:text-lg">
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
      <div className="mx-auto mb-8 max-w-4xl px-4">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-white">Blogs</h1>
          <p className="text-md mt-6 text-center text-neutral-300 md:text-lg">
            Latest insights and updates from our community
          </p>
        </div>
      </div>
      <TracingBeam className="px-6">
        <div className="relative mx-auto max-w-2xl pt-5 antialiased">
          {posts.map((post, index) => (
            <div key={index} className="relative mb-10 pb-8">
              {/* Title */}
              <div className="mb-4">
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={twMerge('mb-2 block text-xl hover:underline md:text-[27px]')}
                >
                  {post.title}
                </a>
                {/* Author byline */}
                {post.author && <p className="mb-3 text-lg text-gray-400">by {post.author}</p>}

                {/* Date badge */}
                <h2 className="mb-2 w-fit rounded-full bg-black pl-1 font-mono text-sm text-white">
                  {formatDate(post.pubDate)}
                </h2>

                {/* Categories */}
                {post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.categories.slice(0, 3).map((cat, i) => (
                      <span key={i} className="rounded-md bg-gray-800 px-4 py-1 text-xs">
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="prose prose-sm dark:prose-invert text-base">
                {post.thumbnail && (
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="mb-4 w-full rounded-lg object-cover"
                  />
                )}

                <p className="mb-4 text-gray-300">{post.description}</p>

                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link inline-flex items-center gap-1 font-semibold text-white no-underline hover:text-[#FAC924]"
                >
                  Read on Medium
                  <ArrowRight
                    size={16}
                    className="-rotate-[35deg] transition-transform duration-300 group-hover/link:-rotate-45"
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
