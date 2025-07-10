import React from 'react';
import { RetroGrid } from '../magicui/retro-grid';

const ContactForm = () => {
  return (
    <div className="h-128 w-screen">
      <div className="absolute z-10 flex h-128 w-full flex-col items-center justify-center">
        <p className="mb-8 text-center font-[family-name:var(--font-vt)] text-2xl md:text-3xl lg:text-5xl">
          &gt;_ Freshly Garnished News, Straight to your inbox
        </p>
        <p className="w-96 text-center text-sm text-zinc-400 md:w-128">
          As if you weren’t already drowning in notifications, here comes the Tech Club newsletter —
          delivering breaking updates, philosophical bug fixes, and that one event you totally
          forgot to sign up for. Freshly garnished, because plain HTML just isn’t our style.
        </p>
        <div className="mt-6 flex flex-col items-center space-y-4">
          <div className="relative w-80 md:w-96">
            <input
              type="email"
              placeholder="enter your command...@email.com"
              className="w-full rounded-md border border-zinc-700 bg-black px-4 py-3 pr-12 text-sm text-zinc-200 placeholder-zinc-500 shadow-[0_0_10px_rgba(255,255,255,0.05)] transition-all duration-300 outline-none focus:border-yellow-400 focus:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
            />
            <button className="absolute top-1/2 right-2 -translate-y-1/2 rounded bg-yellow-500 px-3 py-1 text-sm font-bold text-black transition duration-200 hover:bg-yellow-400 active:scale-95">
              Send
            </button>
          </div>

          <p className="animate-pulse text-xs text-zinc-500 italic">
            // Subscribing may or may not make your inbox 1337
          </p>
        </div>
      </div>
      <RetroGrid />
    </div>
  );
};

export default ContactForm;
