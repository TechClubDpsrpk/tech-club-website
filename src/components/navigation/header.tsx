import Image from 'next/image';
import React from 'react';
import { LinearBlur } from 'progressive-blur';
import RotatingWord from './header/rotatingWord';
import MenuButtonWithOverlay from './header/menu';
import Link from 'next/link';

const Header = () => {
  return (
    <nav className="z-50">
      <LinearBlur
        // The resolution of the blur. Higher values will result in a more detailed blur, but will be more computationally expensive. Default is 8.
        steps={8}
        // The blur radius of the blur in pixels at the peak of the gradient. Default is 64.
        strength={64}
        // How much of the blur is falloff. 0 means no falloff, 100 means the entire blur is falloff. Default is 100.
        falloffPercentage={100}
        // The tint applied to the blur. This can be any valid CSS color. Default is transparent.
        tint="rgba(0, 0, 0, 0.6)"
        // You can pass any div props to the component. Useful for positioning.
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 30,
        }}
        side="top"
        className="h-18"
      />
      <div className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-4 py-4 md:px-6">
        {/* Left Section: Logo + Text */}
        <Link href="/" className="flex items-center">
          <Image src="/DPS_Logo.svg" alt="Logo" width={32} height={32} className="rounded-full" />
          <p className="hidden pl-4 font-bold lg:block">DPSRPK | Tech Club</p>
        </Link>

        {/* Center Section: Tagline */}
        <div className="hidden items-center justify-center text-center sm:block">
          <p className="text-md z-50 font-[family-name:var(--font-instrument-serif)]">
            {'An Award-Winning '}
            <span className="text-xl">
              <RotatingWord />
            </span>
            {' Club'}
          </p>
        </div>

        {/* Right Section: Menu */}
        {/* <div className="group relative flex cursor-pointer items-center gap-1 pr-2 font-[family-name:var(--font-space-mono)] text-sm transition-all duration-300 hover:text-[#fac924] md:pr-0">
          <Menu className="h-4 w-4" />
          <p>MENU</p>
          <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-[#fac924] transition-all duration-300 group-hover:w-full"></span>
        </div> */}
        <MenuButtonWithOverlay />
      </div>
    </nav>
  );
};

export default Header;
