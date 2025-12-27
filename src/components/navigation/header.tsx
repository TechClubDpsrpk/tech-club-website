"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Megaphone, User, Images, Mail, UserPlus, LogOut } from "lucide-react";

const Header = () => {
  const pathname = usePathname() ?? "";
  const [isLightMode, setIsLightMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navLinks = [
    { href: "/", isLogo: true },
    { href: "/announcements", label: "Announcements", icon: Megaphone },
    { href: "/about", label: "About Us", icon: User },
    { href: "/gallery", label: "Gallery", icon: Images },
    { href: "/contact", label: "Contact Us", icon: Mail },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Show icons only when scrolled down more than 100px
          if (currentScrollY > 100 && currentScrollY > lastScrollY) {
            setIsScrolled(true);
          } 
          // Show labels when scrolling up or near top
          else if (currentScrollY < lastScrollY || currentScrollY < 50) {
            setIsScrolled(false);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("[data-navbar-theme]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const theme = entry.target.getAttribute("data-navbar-theme");
            setIsLightMode(theme === "light");
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-100px 0px -60% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setIsAuthenticated(false);
      setShowLogoutMenu(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
      <nav
        className={`px-2 py-2 rounded-full backdrop-blur-xl border shadow-xl transition-all duration-500
        ${
          isLightMode
            ? "bg-white/90 border-gray-200/50"
            : "bg-gray-900/50 border-gray-700/50"
        }`}
      >
        <div className="flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            const isHome = link.href === "/";

            return (
              <React.Fragment key={link.href}>
                {link.isLogo ? (
                  <Link
                    href="/"
                    className={`flex items-center justify-center px-2 py-2 rounded-full transition-all duration-300
                    ${
                      isActive
                        ? "bg-[#C9A227] shadow-lg shadow-[#C9A227]/20 scale-105"
                        : isLightMode
                        ? "hover:bg-gray-100"
                        : "hover:bg-gray-800/50"
                    }`}
                  >
                    <Image
                      src="/tc-logo.png"
                      alt="Logo"
                      width={20}
                      height={20}
                      priority
                    />
                  </Link>
                ) : (
                  <Link
                    href={link.href}
                    className={`group flex items-center text-sm font-medium whitespace-nowrap rounded-full overflow-hidden
                    transition-all duration-500 ease-in-out
                    ${isScrolled ? "px-2 py-2 gap-0" : "px-5 py-2 gap-2"}
                    ${
                      isActive
                        ? "bg-[#C9A227] text-black shadow-lg shadow-[#C9A227]/20 scale-105"
                        : isLightMode
                        ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                    }
                    ${isScrolled ? "hover:gap-2 hover:px-5" : ""}`}
                  >
                    {link.icon && <link.icon size={18} className="flex-shrink-0" />}
                    <span 
                      className={`hidden sm:inline whitespace-nowrap transition-all duration-500 ease-in-out
                      ${
                        isScrolled 
                          ? "max-w-0 opacity-0 ml-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-0" 
                          : "max-w-xs opacity-100 ml-0"
                      }`}
                      style={{
                        transitionProperty: "max-width, opacity, margin-left"
                      }}
                    >
                      {link.label}
                    </span>
                  </Link>
                )}

                {isHome && (
                  <div
                    className={`h-8 w-px mx-1 transition-colors duration-300 ${
                      isLightMode ? "bg-gray-300" : "bg-gray-600"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}

          <div
            className={`h-8 w-px mx-1 transition-colors duration-300 ${
              isLightMode ? "bg-gray-300" : "bg-gray-600"
            }`}
          />

          {!loading && (
            <>
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/account"
                    className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 px-2 py-2 rounded-full
                    ${
                      pathname === "/account"
                        ? "bg-[#C9A227] text-black shadow-lg shadow-[#C9A227]/20 scale-105"
                        : isLightMode
                        ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    <User size={18} />
                  </Link>

                  <button
                    onClick={handleLogout}
                    className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 px-2 py-2 rounded-full hover:bg-red-500/20 cursor-pointer
                    ${
                      isLightMode
                        ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                        : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link
                  href="/signup"
                  className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 px-2 py-2 rounded-full
                  ${
                    pathname === "/signup"
                      ? "bg-[#C9A227] text-black shadow-lg shadow-[#C9A227]/20 scale-105"
                      : isLightMode
                      ? "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      : "text-gray-300 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <UserPlus size={18} />
                </Link>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;