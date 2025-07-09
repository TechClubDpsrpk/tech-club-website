'use client';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const navItems = [
  {
    title: 'Our Work',
    href: '#work',
    subtitle: 'Explore our award-winning projects',
  },
  {
    title: 'About Us',
    href: '#about',
    subtitle: 'Designing systems that scale',
  },
  {
    title: 'Join Us',
    href: '#join',
    subtitle: 'Collaborate. Innovate. Elevate.',
  },
];

export default function MenuButtonWithOverlay() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* === Menu Button === */}
      <div
        onClick={() => setIsOpen(true)}
        className="group relative flex cursor-pointer items-center gap-1 pr-2 font-[family-name:var(--font-space-mono)] text-sm transition-all duration-300 hover:text-[#fac924] md:pr-0"
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
            className="fixed inset-0 z-50 flex flex-col justify-between bg-black text-white"
          >
            {/* Close Button */}
            <div className="flex justify-end p-6">
              <button
                onClick={() => setIsOpen(false)}
                className="group flex items-center gap-2 text-sm tracking-wide transition hover:text-[#fac924]"
              >
                <span className="border-b border-white group-hover:border-[#fac924]">CLOSE</span>
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex flex-col items-start gap-12 px-10 font-[family-name:var(--font-instrument-serif)] text-5xl md:text-6xl">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(10px)' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="transition"
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="transition hover:text-[#fac924]"
                  >
                    {item.title} →
                  </Link>
                  <p className="mt-2 font-[family-name:var(--font-vt)] text-sm text-[#fac924]">
                    {item.subtitle}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="py-4 text-center text-xs text-[#fac924]">
              Delhi Public School Tech Club ©
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
