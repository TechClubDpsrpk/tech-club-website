/* eslint-disable prettier/prettier */
'use client';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { HyperText } from '@/components/magicui/hyper-text';
// import { TypewriterEffect } from '@/components/ui/typewriter-effect'; // Unused
import './hero/home.css';

type HeroProps = React.HTMLAttributes<HTMLElement>;

const Hero = ({ className, ...props }: HeroProps) => {
  const { isAuthenticated, emailVerified, isLoading: loading } = useAuth();
  const container = useRef<HTMLElement>(null);
  const circleLeft = useRef<HTMLDivElement>(null);
  const circleRight = useRef<HTMLDivElement>(null);
  const turningRef = useRef<HTMLSpanElement>(null);
  const ideasRef = useRef<HTMLSpanElement>(null);
  const intoRef = useRef<HTMLSpanElement>(null);
  const projectsRef = useRef<HTMLSpanElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const topTagRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      // Prevent running if loading
      if (loading) return;

      const tl = gsap.timeline();

      // Clear initial states
      gsap.set(
        [
          turningRef.current,
          ideasRef.current,
          intoRef.current,
          projectsRef.current,
          descRef.current,
          buttonsRef.current,
          topTagRef.current,
        ],
        {
          autoAlpha: 0,
        }
      );

      // 1. Circles Entrance
      tl.fromTo(
        [circleLeft.current, circleRight.current],
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1, ease: 'power2.out' }
      );

      // Make top tag container visible but chars hidden (handled by render helper)
      tl.set(topTagRef.current, { autoAlpha: 1 });
      const topChars = topTagRef.current?.querySelectorAll('.char-top');

      // 2. "Turning" from Left (after small delay)
      // Start Top Tag Typewriter here as well
      const mainTextStart = 'mainTextStart';
      tl.add(mainTextStart, '+=0.2');

      if (topChars && topChars.length > 0) {
        // Animate top tag over the duration of the text sequence (~2.8s)
        tl.fromTo(
          topChars,
          { opacity: 0 },
          { opacity: 1, stagger: 0.15, duration: 0.1, ease: 'none' },
          mainTextStart
        );
      }

      tl.fromTo(
        turningRef.current,
        { x: -50, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.8, ease: 'power2.out' },
        mainTextStart
      );

      // 3. "Ideas" from Right with Bump
      // To create "bump" and space: overshoot left then settle
      tl.fromTo(
        ideasRef.current,
        { x: 50, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 1,
          ease: 'back.out(1.7)', // This creates the bump/overshoot effect
        },
        '>-0.4' // Overlap slightly
      );

      // 4. "Into" from Left (after ideas completes)
      tl.fromTo(
        intoRef.current,
        { x: -50, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.8, ease: 'power2.out' },
        '>' // reduce delay after ideas
      );

      // 5. "Projects" from Right with Bump
      tl.fromTo(
        projectsRef.current,
        { x: 50, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 1,
          ease: 'back.out(1.7)',
        },
        '>-0.4'
      );

      // 6. Description Typewriter (Letter by Letter)
      // We need to target the spans inside the description
      const chars = descRef.current?.querySelectorAll('.char');
      if (chars && chars.length > 0) {
        tl.fromTo(
          descRef.current,
          { autoAlpha: 1 }, // Make container visible
          { autoAlpha: 1, duration: 0 } // Immediate set
        );
        tl.fromTo(
          chars,
          { opacity: 0 },
          { opacity: 1, stagger: 0.02, duration: 0.1, ease: 'none' }, // Fast typing
          '>+0.3'
        );
      }

      // 7. Buttons Fade In
      tl.fromTo(
        buttonsRef.current,
        { y: 20, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power2.out' },
        '>+0.2'
      );
    },
    { scope: container, dependencies: [loading] }
  );

  const DISCORD_SERVER_URL = 'https://discord.gg/rdNMZANYTP';

  const descriptionText =
    "Whether you're obsessed with AI, code, robots, or just making things look cool, this is the perfect place to overcommit, under-caffeinate, and accidentally invent the future.";

  // Helper to split text for GSAP
  const renderDescription = () => {
    return descriptionText.split('').map((char, i) => (
      <span key={i} className="char opacity-0">
        {char}
      </span>
    ));
  };

  const renderTopTag = () => {
    const text1 = 'Tech Club | ';
    const text2 = 'DPSRPK';
    return (
      <>
        {text1.split('').map((char, i) => (
          <span key={`1-${i}`} className="char-top opacity-0">
            {char}
          </span>
        ))}
        <span className="dps">
          {text2.split('').map((char, i) => (
            <span key={`2-${i}`} className="char-top opacity-0">
              {char}
            </span>
          ))}
        </span>
      </>
    );
  };

  return (
    <section ref={container}>
      <div className="circle-container">
        <div ref={circleLeft} className="yellow-circle-top-left overflow-hidden opacity-0" />
        <div ref={circleRight} className="yellow-circle-bottom-right overflow-hidden opacity-0" />
      </div>
      <section {...props} className={`home ${className ?? ''}`}>
        <div className="container">
          <div className="home-content">
            <p ref={topTagRef} className="top tag opacity-0">
              {renderTopTag()}
            </p>

            <h1>
              <span ref={turningRef} className="mr-3 inline-block opacity-0">
                turning{' '}
              </span>
              <span ref={ideasRef} className="inline-block text-[#fac71e] opacity-0">
                ideas
              </span>
              <br />
              <span ref={intoRef} className="mr-3 inline-block opacity-0">
                into{' '}
              </span>
              <span ref={projectsRef} className="inline-block text-[#fac71e] opacity-0">
                projects
              </span>
            </h1>

            {/* Description with original styling classes */}
            <p ref={descRef} className="description opacity-0">
              {renderDescription()}
            </p>

            {!loading && (
              <div ref={buttonsRef} className="button-group opacity-0">
                {/* Discord Button - only shows actual link if verified */}
                {emailVerified ? (
                  <a
                    href={DISCORD_SERVER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-1"
                  >
                    Join The Discord
                  </a>
                ) : (
                  <Link href="/signup" className="btn-1">
                    Join The Discord
                  </Link>
                )}

                {/* Sign Up / Dashboard Button */}
                {isAuthenticated ? (
                  <Link href="/account" className="btn-2">
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/signup" className="btn-2">
                    Sign Up
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </section>
  );
};

export default Hero;
