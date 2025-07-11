'use client';
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { ParallaxImage } from './parallaxImage';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

const BlogSection = () => {
  const blogs = [
    {
      title: 'Inside the Tech Lab',
      image: '/1.jpg',
      description: 'A peek into how we experiment, break, and occasionally fix our tech stack.',
    },
    {
      title: 'AI + Robots = Chaos',
      image: '/2.jpg',
      description:
        'Documenting the hilarious and slightly terrifying moments from our latest AI robotics sprint.',
    },
  ];

  return (
    <section className="bg-black px-6 pb-24 text-white md:px-18 lg:px-42">
      <div className="mx-auto max-w-6xl space-y-20">
        {/* Heading */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <h2 className="text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
            Everything we can imagine
            <br />
            should be real
          </h2>
          <p className="max-w-md text-zinc-400">
            We’re building alongside pioneering minds, cracked engineers, and wildly creative
            thinkers — all shaping the future of how we build, learn, and experiment in tech.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {blogs.map((blog, index) => (
            <div key={index} className="group cursor-pointer space-y-4">
              <ParallaxImage src={blog.image} alt={blog.title} />

              <div className="flex items-center justify-between">
                {/* Title with animated underline */}
                <h3 className="relative inline-block text-lg font-semibold text-white transition-all duration-300 group-hover:text-[#FAC924] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-[#FAC924] after:transition-all after:duration-300 group-hover:after:w-full">
                  {blog.title}
                </h3>

                {/* Rotating arrow */}
                <ArrowRight className="h-5 w-5 text-[#FAC924] transition-transform duration-300 group-hover:-rotate-45" />
              </div>

              <p className="text-sm text-zinc-400">{blog.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
