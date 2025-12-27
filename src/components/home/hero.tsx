'use client';
import React from 'react';
import './hero/home.css';

type HeroProps = React.HTMLAttributes<HTMLElement>;

const Hero = ({ className, ...props }: HeroProps) => {
  return (
    <section {...props} className={`home ${className ?? ''}`}>
      <div className="container">
        <div className="home-content">
          <p className="top">
            Tech Club | <span className="dps">DPSRPK</span>
          </p>

          <h1>
            The Home <br />
            of all{' '}
            <i>
              <span className="bold">Tech</span>
            </i>{' '}
            <i>Nerds</i>
          </h1>

          <p className="description">
            We come together to innovate, collaborate, and pretend we know what we’re <br />
            doing. Whether you’re obsessed with AI, code, robots, or just making things <br />
            look cool, this is the perfect place to overcommit, under-caffeinate, and <br />
            accidentally invent the future.
          </p>

          <div className="button-group">
            <a className="btn">Join The Discord</a>
            <a className="btn pr">Sign Up</a>
          </div>
        </div>

        <div className="orbit-container">
          <div className="orbit-path path1"></div>
          <div className="orbit-path path2"></div>
          <div className="orbit-path path3"></div>
          <div className="orbit-path path4"></div>

          <img src="/center.jpg" className="center-img" />
          <img src="/1.jpg" className="orbit-img pos1" />
          <img src="/2.jpg" className="orbit-img pos2" />
          <img src="/1.jpg" className="orbit-img pos3" />
          <img src="/2.jpg" className="orbit-img pos4" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
