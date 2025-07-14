import React from 'react';
import { RetroGrid } from '../magicui/retro-grid';

const ContactForm = () => {
  return (
    <div className="relative h-128 w-full">
      <div className="absolute inset-0 z-10 flex items-center justify-center px-4">
        <div className="w-full max-w-screen-md text-center">
          <p className="mb-6 font-[family-name:var(--font-vt)] text-xl sm:text-2xl md:text-4xl">
            &gt;_ Freshly Garnished News, Straight to your inbox
          </p>

          <p className="text-sm text-zinc-400">
            As if you weren’t already drowning in notifications, here comes the Tech Club newsletter
            — delivering breaking updates, philosophical bug fixes, and that one event you totally
            forgot to sign up for.
          </p>

          <div className="mt-6 flex flex-col items-center space-y-3">
            <div className="relative w-full max-w-md">
              <input
                type="email"
                placeholder="enter your command...@email.com"
                className="w-full rounded-md border border-zinc-700 bg-black px-4 py-3 pr-12 text-sm text-zinc-200 placeholder-zinc-500 shadow-[0_0_10px_rgba(255,255,255,0.05)] transition-all duration-300 outline-none focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
              />
              <button className="absolute top-1/2 right-2 -translate-y-1/2 rounded bg-yellow-500 px-3 py-1 text-sm font-bold text-black transition duration-200 hover:bg-yellow-400 active:scale-95">
                Send
              </button>
            </div>
            <p className="animate-pulse p-1 text-xs text-zinc-500 italic">
              &#47;&#47; Subscribing may or may not make your inbox 1337
            </p>
          </div>
        </div>
      </div>

      <div className="-z-10">
        <RetroGrid opacity={0.6} />
      </div>
    </div>
  );
};

export default ContactForm;
