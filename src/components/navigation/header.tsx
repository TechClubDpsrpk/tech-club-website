"use client";
import Image from 'next/image';
import MenuButtonWithOverlay from './header/menu';
import Link from 'next/link';
import React, { useState, useRef } from "react";
import "./header/Navbar.css";

const Header = () => {
  const navRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="liquid-navbar" ref={navRef}>
            <div className="liquidGlass-effect"></div>
        <div className="liquidGlass-tint"></div>
        <div className="liquidGlass-shine"></div>
      {/* LEFT LINKS - hidden on mobile */}
      <div className="nav-left hide-on-mobile">
        <Link href="/" onClick={() => setIsOpen(false)}>Home</Link>
        {/* <Link href="/portfolio" onClick={() => setIsOpen(false)}>Portfolio</Link> */}
        <Link href="/announcements" onClick={() => setIsOpen(false)}>Announcements</Link>
        <Link href="/about" onClick={() => setIsOpen(false)}>About Us</Link>
                {/* <Link href="/team" onClick={() => setIsOpen(false)}>Core Team</Link> */}
        <Link href="/gallery" onClick={() => setIsOpen(false)}>Gallery</Link>
        {/* <Link href="/legacy" onClick={() => setIsOpen(false)}>Legacy</Link> */}
        <Link href="/contact" onClick={() => setIsOpen(false)}>Contact Us</Link>
      </div>

      {/* CENTER LOGO */}
      {/* <div className="nav-center">
        <Image src="/tc-logo.png" alt="Logo" width={100} height={100} className="logo" />
      </div> */}

      {/* RIGHT LINKS - hidden on mobile */}
      {/* <div className={`nav-right hide-on-mobile ${isOpen ? "open" : ""}`}>

      </div> */}

      {/* MENU BUTTON - only on mobile */}
      {/* <div className="show-on-mobile">
        <MenuButtonWithOverlay />
      </div> */}

    </nav>
  );
};

export default Header;
