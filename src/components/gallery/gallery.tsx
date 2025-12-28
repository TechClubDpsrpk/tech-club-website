/* eslint-disable @next/next/no-img-element */
import { BlurFade } from '@/components/magicui/blur-fade';
import Image from 'next/image';

const images = Array.from({ length: 9 }, (_, i) => {
  const isLandscape = i % 2 === 0;
  const width = isLandscape ? 800 : 600;
  const height = isLandscape ? 600 : 800;
  return `https://picsum.photos/seed/${i + 1}/${width}/${height}`;
});

export function BlurFadeGallery() {
  return (
    <section id="photos">
      <div className="columns-2 gap-4 p-4 pt-20 sm:columns-3">
        {images.map((imageUrl, idx) => (
          <BlurFade key={imageUrl} delay={0.25 + idx * 0.05} inView>
            <Image
              width={800}
              height={600}
              className="mb-4 size-full rounded-sm object-contain"
              src={imageUrl}
              alt={`Random stock image ${idx + 1}`}
            />
          </BlurFade>
        ))}
      </div>
    </section>
  );
}
