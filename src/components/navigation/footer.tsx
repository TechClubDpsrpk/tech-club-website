import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AuroraText } from '../magicui/aurora-text';
import { FlickeringGrid } from '../magicui/flickering-grid';

const footerLinks = [
  {
    title: '(Tech Club)',
    links: [
      { label: 'Home', href: '/' },
      { label: 'About Us', href: '/about' },
    ],
  },
  {
    title: '(Resources)',
    links: [
      { label: 'Gallery', href: '/gallery' },
      { label: 'Announcements', href: '/announcements' },
      { label: 'Legacy', href: '/legacy' },
      { label: 'Contact Us', href: '/contact' },
    ],
  },
  {
    title: '(Socials)',
    links: [
      { label: 'Youtube', href: '/gallery' },
      { label: 'Facebook', href: '/announcements' },
      { label: 'Medium', href: '/legacy' },
    ],
  },
];

const Footer = () => {
  return (
    <div className="-pb-1 bottom-0 -z-10 flex w-screen flex-col justify-center overflow-hidden">
      <div className="flex flex-col gap-2 px-4 pt-10 md:flex-row md:px-24">
        {footerLinks.map((section) => (
          <div key={section.title} className="flex flex-col p-2 md:p-6">
            <p className="scale-z-105 font-[family-name:var(--font-vt)] text-xl font-medium text-zinc-100">
              {section.title}
            </p>

            {section.links.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="group relative inline-flex w-fit items-center py-1 text-sm text-zinc-400 transition-all duration-300 hover:text-[#fac924]"
              >
                <span className="relative inline-block transition-transform duration-300 group-hover:translate-x-1">
                  {label}
                  {/* underline effect */}
                  <span className="absolute -bottom-0.5 left-0 h-[1px] w-0 bg-[#fac924] transition-all duration-300 group-hover:w-full" />
                </span>

                <ArrowUpRight
                  className="ml-1 h-4 w-4 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                  strokeWidth={2}
                />
              </Link>
            ))}
          </div>
        ))}
      </div>
      <p className="-z-10 w-full text-left text-[20vw] leading-none font-bold tracking-tight">
        <AuroraText
          colors={['#fac924', '#e6b522', '#c09c2b', '#947d31', '#625a31', '#3c3b2d', '#1b1c22']}
        >
          Tech Club
        </AuroraText>
      </p>
      <div className="flex w-full flex-row items-center justify-between border-t border-zinc-800 px-4 py-2 text-left text-xs text-zinc-400">
        <p>©Tech Club, 2025</p>
        {/* <p>
          Design by{' '}
          <span className="font-[family-name:var(--font-instrument-serif)] text-lg text-white">
            Anshu, Agnihotra and Naitik
          </span>
        </p> */}
      </div>
      <div className="-z-10">
        <FlickeringGrid
          className="relative inset-0 -top-14 z-0 -mt-[785px] overflow-hidden [mask-image:radial-gradient(700px_circle_at_center,white,transparent)]"
          squareSize={4}
          gridGap={6}
          color="#FAC924"
          maxOpacity={0.5}
          flickerChance={0.1}
          height={800}
          width={1920}
        />
      </div>
    </div>
  );
};

export default Footer;
