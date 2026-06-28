'use client';

import { useState, useEffect } from 'react';
import { Save, ExternalLink, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { LoadingDots } from '@/components/ui/loading-dots';

const inputClass =
  'w-full rounded-sm border border-zinc-800 bg-transparent px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#fac71e] disabled:cursor-not-allowed disabled:text-zinc-700';

const Field = ({
  label,
  hint,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <div className="mb-2 flex items-center gap-2">
      <span className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.12em] text-zinc-400 uppercase">
        {label}
      </span>
      {optional && (
        <span className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-600">
          optional
        </span>
      )}
    </div>
    {children}
    {hint && (
      <p className="mt-1.5 font-[family-name:var(--font-space-mono)] text-[10px] text-zinc-600">
        {hint}
      </p>
    )}
  </div>
);

export default function VJudgeSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [settings, setSettings] = useState({
    organiser_username: '',
    organiser_password: '',
    contest_id: '',
    contest_password: '',
    session_cookies: '',
    problem_count: 10,
    problem_titles: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/vjudge-settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({
          organiser_username: data.organiser_username || '',
          organiser_password: data.organiser_password || '',
          contest_id: data.contest_id || '',
          contest_password: data.contest_password || '',
          session_cookies: data.session_cookies || '',
          problem_count: data.problem_count || 10,
          problem_titles: data.problem_titles || '',
        });
      }
    } catch (error) {
      console.error('Error fetching VJudge settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/admin/vjudge-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully.' });
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete the VJudge contest settings? This cannot be undone.'
      )
    )
      return;
    setDeleting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch('/api/admin/vjudge-settings', { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Contest settings deleted.' });
        setSettings({
          organiser_username: '',
          organiser_password: '',
          contest_id: '',
          contest_password: '',
          session_cookies: '',
          problem_count: 10,
          problem_titles: '',
        });
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || 'Failed to delete settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-4 py-10">
        <div className="relative h-5 w-5 animate-spin">
          <Image src="/tc-logo.svg" alt="Loading" fill className="object-contain" />
        </div>
        <p className="text-sm text-zinc-500">
          Fetching settings
          <LoadingDots />
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-10">
      {/* How-to notice — styled like account page's application-responses block */}
      <div className="border-l border-[#fac71e]/40 pl-4">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle size={12} className="text-[#fac71e]" />
          <span className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.12em] text-[#fac71e] uppercase">
            How to get Session Cookies
          </span>
        </div>
        <ol className="space-y-1.5 text-sm leading-relaxed text-zinc-400">
          <li>
            1. Log in to{' '}
            <a
              href="https://vjudge.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#fac71e] underline underline-offset-4 transition-opacity hover:opacity-70"
            >
              vjudge.net
            </a>{' '}
            in your browser.
          </li>
          <li>2. Open DevTools (F12) → Console tab.</li>
          <li>
            3. Type{' '}
            <code className="rounded-sm bg-zinc-900 px-1.5 py-0.5 text-xs text-zinc-300">
              document.cookie
            </code>{' '}
            and copy the output starting with{' '}
            <code className="rounded-sm bg-zinc-900 px-1.5 py-0.5 text-xs text-zinc-300">
              JSESSIONID=…
            </code>
          </li>
          <li>4. Paste it below. Valid until you log out or the session expires.</li>
        </ol>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Field label="VJudge Session Cookies">
          <textarea
            value={settings.session_cookies}
            onChange={(e) => setSettings({ ...settings, session_cookies: e.target.value })}
            className={`${inputClass} resize-none font-mono text-xs`}
            placeholder="JSESSIONID=…; Jax.Quest.Session=…"
            rows={4}
            required
          />
        </Field>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Field label="Active Contest ID">
            <input
              type="text"
              value={settings.contest_id}
              onChange={(e) => setSettings({ ...settings, contest_id: e.target.value })}
              className={inputClass}
              placeholder="e.g. 684234"
              required
            />
          </Field>

          <Field label="Contest Password" optional>
            <input
              type="password"
              value={settings.contest_password}
              onChange={(e) => setSettings({ ...settings, contest_password: e.target.value })}
              className={inputClass}
              placeholder="For private contests"
            />
          </Field>

          <Field
            label="Number of Problems"
            hint="How many problems are in the contest? (e.g. 10 → A–J)"
          >
            <input
              type="number"
              value={settings.problem_count}
              onChange={(e) =>
                setSettings({ ...settings, problem_count: parseInt(e.target.value) || 0 })
              }
              className={inputClass}
              min="1"
              max="26"
              required
            />
          </Field>
        </div>

        <Field
          label="Problem Titles"
          optional
          hint="Comma-separated. Leave blank to show just letters (A, B, C…)."
        >
          <textarea
            value={settings.problem_titles}
            onChange={(e) => setSettings({ ...settings, problem_titles: e.target.value })}
            className={`${inputClass} resize-none font-mono text-xs`}
            placeholder="string-check, matrix-color, alphabet-max…"
            rows={3}
          />
        </Field>

        {/* Deprecated note */}
        <p className="border-l border-zinc-800 pl-4 text-sm leading-relaxed text-zinc-600">
          Organiser credentials are no longer used for login due to VJudge bot protection.
        </p>

        {/* Message */}
        {message.text && (
          <div
            className={`flex items-center gap-3 rounded-sm border px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400'
                : 'border-red-500/30 bg-red-500/[0.06] text-red-400'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            {message.text}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 border-t border-zinc-800 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-sm bg-[#fac71e] px-8 py-3 font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-widest text-black uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            <Save size={13} />
            {saving ? 'Saving…' : 'Save Settings'}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 rounded-sm border border-red-500/30 px-6 py-3 font-[family-name:var(--font-space-mono)] text-xs text-red-400 uppercase transition-colors hover:bg-red-500/10 disabled:opacity-40"
          >
            <Trash2 size={13} />
            {deleting ? 'Deleting…' : 'Delete Contest'}
          </button>

          {settings.contest_id && (
            <a
              href={`https://vjudge.net/contest/${settings.contest_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-[#fac71e] uppercase transition-opacity hover:opacity-70"
            >
              View on VJudge <ExternalLink size={11} />
            </a>
          )}
        </div>
      </form>
    </div>
  );
}
