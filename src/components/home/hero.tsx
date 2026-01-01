/* eslint-disable prettier/prettier */
'use client';
import './hero/home.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type HeroProps = React.HTMLAttributes<HTMLElement>;

const Hero = ({ className, ...props }: HeroProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
          
          // Fetch email_verified from Supabase
          if (data.isAuthenticated && data.user?.id) {
            const { data: userData } = await supabase
              .from('users')
              .select('email_verified')
              .eq('id', data.user.id)
              .single();
            
            setEmailVerified(userData?.email_verified || false);
          } else {
            setEmailVerified(false);
          }
        } else {
          setIsAuthenticated(false);
          setEmailVerified(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setEmailVerified(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const DISCORD_SERVER_URL = 'https://discord.gg/rdNMZANYTP';

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
              Whether you're obsessed with AI, code, robots, or just making things look cool, this
              is the perfect place to overcommit, under-caffeinate, and accidentally invent the
              future.
            </p>

            {!loading && (
              <div className="button-group">
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