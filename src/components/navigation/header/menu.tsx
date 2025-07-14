'use client';
import { useState } from 'react';
import { Cross, Menu, X, XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const navItems = [
  {
    title: 'Home',
    href: '/',
    subtitle: '(Back to Base)',
  },
  {
    title: 'Core Team',
    href: '/core-team',
    subtitle: '(Brains behind the magic)',
  },
  {
    title: 'Portfolio',
    href: '/portfolio',
    subtitle: '(Crafted with precision)',
  },
  {
    title: 'Gallery',
    href: '/gallery',
    subtitle: '(Pixels with a purpose)',
  },
  {
    title: 'Announcements',
    href: '/announcements',
    subtitle: '(Stay in the loop)',
  },
  {
    title: 'Legacy',
    href: '/legacy',
    subtitle: '(Built to last)',
  },
  {
    title: 'About Us',
    href: '/about',
    subtitle: '(Who we are & why we build)',
  },
  {
    title: 'Contact Us',
    href: '/contact',
    subtitle: '(Let’s talk tech)',
  },
];

export default function MenuButtonWithOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* === Menu Button === */}
      <div
        onClick={() => setIsOpen(true)}
        className="group relative mr-2 flex cursor-pointer items-center gap-1 font-[family-name:var(--font-space-mono)] text-sm transition-all duration-300 hover:text-[#fac924] md:mr-0"
      >
        <Menu className="h-4 w-4" />
        <p>MENU</p>
        <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#fac924] transition-all duration-300 group-hover:w-full"></span>
      </div>

      {/* === Fullscreen Overlay === */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex touch-pan-y flex-col justify-between overflow-y-auto bg-black text-white"
          >
            {/* Close Button */}
            <div className="flex justify-end p-6">
              <button onClick={() => setIsOpen(false)} className="">
                <div className="group relative mr-2 flex cursor-pointer items-center gap-1 font-[family-name:var(--font-space-mono)] text-sm transition-all duration-300 hover:text-[#fac924] md:mr-0">
                  <XIcon className="h-4 w-4" />
                  <p>CLOSE</p>
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#fac924] transition-all duration-300 group-hover:w-full"></span>
                </div>
              </button>
            </div>

            {/* === Menu Grid === */}
            <div className="grid grid-cols-1 gap-y-4 px-10 font-[family-name:var(--font-instrument-serif)] text-4xl md:grid-cols-2 md:gap-y-9 md:text-5xl">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block transition hover:text-[#fac924]"
                  >
                    {item.title} →
                  </Link>
                  <p className="mt-1 hidden font-[family-name:var(--font-vt)] text-sm text-[#fac924] md:block">
                    {item.subtitle}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="py-4 text-center text-xs text-[#fac924]">
              ©Anshu, Designed for the Tech Club, 2025
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
