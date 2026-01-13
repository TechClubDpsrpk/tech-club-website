'use client';
import React from 'react';
import { ParallaxImage } from './parallaxImage';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const BlogSection = () => {
  const blogs = [
    {
      title: 'Our Legacy',
      image: '/1.jpg',
      description:
        "A reflection on the club's historical achievements, highlighting their lasting impact and inspirational role in guiding future endeavors.",
      href: '/legacy',
    },
    {
      title: 'Inside the Gallery',
      image: '/2.jpg',
      description:
        'Take a peek at what working for the Tech Club actually looks like, with images from various competitions and events, featuring and taken by our Club members.',
      href: '/gallery',
    },
  ];

  return (
    <section className="max-h-[110vh] bg-black px-6 pt-10 pb-24 text-white md:px-16">
      <div className="mx-auto max-w-6xl space-y-16">
        {/* Heading */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <h2 className="pr-20 text-4xl leading-tight font-bold md:text-6xl">
            Capturing the Journey
            <br />
            That Defines Us
          </h2>
          <p className="ml-[105px] max-w-md text-right text-zinc-400">
            The Tech Club has made significant progress and is dedicated to continuing its efforts
            to advance further. This highlights the hard work and commitment placed into the club's
            development.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 gap-14 md:grid-cols-2">
          {blogs.map((blog, index) => (
            <div key={index} className="group cursor-pointer space-y-4">
              <ParallaxImage src={blog.image} alt={blog.title} />

              <Link key={index} href={blog.href} className="flex items-center justify-between">
                {/* Title with animated underline */}
                <h3 className="relative inline-block text-lg font-semibold text-white transition-all duration-300 group-hover:text-[#FAC924] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[#FAC924] after:transition-all after:duration-300 group-hover:after:w-full">
                  {blog.title}
                </h3>

                {/* Rotating arrow */}
                <ArrowRight className="h-5 w-5 text-[#FAC924] transition-transform duration-300 group-hover:-rotate-45" />
              </Link>

              <p className="text-sm text-zinc-400">{blog.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
