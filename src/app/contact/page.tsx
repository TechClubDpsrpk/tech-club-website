'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="min bg-black px-6 py-24 font-mono text-green-400">
      <div className="mx-auto max-w-2xl rounded-md border border-zinc-700 bg-zinc-900 p-6 shadow-lg">
        <div className="mb-6 flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
        <form onSubmit={handleSubmit}>
          <p className="mb-4">
            &gt; Let&apos;s start with your email (because telepathy is still in beta):
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-none bg-zinc-900 text-green-400 placeholder-green-600 outline-none"
            placeholder="your@email.com"
          />

          {email && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6"
            >
              <p className="mb-2">&gt; Drop your message below (bonus points for drama):</p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="w-full border-none bg-zinc-900 text-green-400 placeholder-green-600 outline-none"
                placeholder="Type your message here..."
              />
            </motion.div>
          )}

          {message && (
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 rounded bg-green-600 px-4 py-2 text-black"
            >
              [ send ]
            </motion.button>
          )}
        </form>

        {submitted && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mt-6 text-green-500"
          >
            &gt; Message sent. We probably read it.
          </motion.p>
        )}
      </div>
    </section>
  );
}
