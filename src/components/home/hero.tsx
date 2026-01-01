/* eslint-disable prettier/prettier */
'use client';
import './hero/home.css';
import Link from 'next/link';

type HeroProps = React.HTMLAttributes<HTMLElement>;

const Hero = ({ className, ...props }: HeroProps) => {
  return (
    <section>
      <div className="circle-container">
        <div className="yellow-circle-top-left overflow-hidden" />
        <div className="yellow-circle-bottom-right overflow-hidden" />
      </div>
      <section {...props} className={`home ${className ?? ''}`}>
        <div className="container">
          <div className="home-content">
            <p className="top tag">
              Tech Club | <span className="dps">DPSRPK</span>
            </p>

            <h1>
              turning <span className="text-[#fac71e]">ideas</span>
              <br />
              into <span className="text-[#fac71e]">projects</span>
            </h1>

            <p className="description">
              Whether you’re obsessed with AI, code, robots, or just making things look cool, this
              is the perfect place to overcommit, under-caffeinate, and accidentally invent the
              future.
            </p>

            <div className="button-group">
              <Link href="/signup" className="btn-1">
                Join The Discord
              </Link>
              <Link href="/signup" className="btn-2">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Hero;
