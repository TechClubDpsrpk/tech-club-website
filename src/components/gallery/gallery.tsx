/* eslint-disable @next/next/no-img-element */
'use client';

import { BlurFade } from '@/components/magicui/blur-fade';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { LoadingDots } from '@/components/ui/loading-dots';

interface GDriveImage {
  id: string;
  name: string;
  mimeType: string;
}

export function BlurFadeGallery() {
  const [images, setImages] = useState<GDriveImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch('/api/gdrive-images');

        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }

        const data = await response.json();
        setImages(data.images || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load images');
        console.error('Error fetching images:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  if (loading) {
    return (
      <section id="photos" className="min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="relative h-16 w-16 animate-spin-slow">
            <Image
              src="/tc-logo.svg"
              alt="Loading"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xl font-bold text-[#C9A227] tracking-widest uppercase flex items-center justify-center">
            Developing Gallery <LoadingDots />
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="photos" className="min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-lg text-red-600 mb-2">Error loading images</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return (
      <section id="photos" className="min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-lg text-gray-600">No images found in Google Drive folder</p>
        </div>
      </section>
    );
  }

  return (
    <section id="photos">
      <div className="columns-2 gap-4 p-4 pt-20 sm:columns-3">
        {images.map((image, idx) => (
          <BlurFade key={image.id} delay={0.25 + idx * 0.05} inView>
            <img
              className="mb-4 size-full rounded-sm object-contain"
              src={`/api/gdrive-image/${image.id}`}
              alt={image.name}
              loading="lazy"
            />
          </BlurFade>
        ))}
      </div>
    </section>
  );
}