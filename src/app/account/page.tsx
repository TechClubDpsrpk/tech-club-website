'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Laptop,
  LogOut,
  Trash2,
  Crown,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/providers/auth-provider';
import ActivitySection from '@/components/account/ActivitySection';
import Loading from '@/app/loading';
import Image from 'next/image';

const NICHES = [
  'Robotics',
  'Development',
  'Competitive Programming',
  'AI',
  'Videography',
  'Graphics Designing',
];

type User = {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  class?: string;
  section?: string;
  admission_number?: string;
  github_id?: string | null;
  discord_id?: string | null;
  why_join_tech_club?: string;
  skills_and_achievements?: string | null;
  event_participation?: string;
  projects?: string | null;
  interested_niches?: string[];
  avatarUrl?: string | null;
  email_verified?: boolean;
  createdAt?: string;
  is_admin?: boolean;
};

type TabType = 'profile' | 'security' | 'sessions' | 'danger';

// ─── GitHub Stats ─────────────────────────────────────────────────────────────
const GitHubStatsCard = ({ githubId }: { githubId: string }) => {
  const [statsError, setStatsError] = useState(false);
  const [langsError, setLangsError] = useState(false);
  const [streakError, setStreakError] = useState(false);

  return (
    <div className="border-t border-zinc-800 pt-8">
      <div className="mb-5 flex items-center gap-3">
        <svg className="h-4 w-4 text-zinc-400" fill="currentColor" viewBox="0 0 24 24">
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.12em] text-zinc-400 uppercase">
          Github Stats
        </span>
        <div className="h-px flex-1 bg-zinc-800" />
        <a
          href={`https://github.com/${githubId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-[#fac71e] transition-opacity hover:opacity-70"
        >
          @{githubId} ↗
        </a>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          {
            src: `https://github-readme-stats-nc.vercel.app/api?username=${githubId}&show_icons=true&theme=transparent&rank_icon=default&include_all_commits=true&count_private=true&show=reviews,prs_merged,prs_merged_percentage&text_color=71717a&title_color=fac71e&icon_color=fac71e&bg_color=00000000&hide_border=true`,
            alt: 'GitHub Stats',
            error: statsError,
            setError: setStatsError,
            label: 'Overview',
          },
          {
            src: `https://github-readme-stats-nc.vercel.app/api/top-langs?username=${githubId}&layout=compact&langs_count=6&exclude_repo=luminolens&show_icons=true&theme=transparent&text_color=71717a&title_color=fac71e&bg_color=00000000&hide_border=true`,
            alt: 'Top Languages',
            error: langsError,
            setError: setLangsError,
            label: 'Languages',
          },
          {
            src: `https://github-readme-streak-stats-nc.vercel.app?user=${githubId}&theme=transparent&ring=fac71e&fire=fac71e&currStreakLabel=fac71e&sideLabels=71717a&currStreakNum=fac71e&dates=71717a&background=00000000&border_radius=0&hide_border=true`,
            alt: 'GitHub Streak',
            error: streakError,
            setError: setStreakError,
            label: 'Streak',
          },
        ].map(({ src, alt, error, setError, label }) => (
          <div key={label} className="rounded-sm border border-zinc-800 p-4">
            <p className="mb-3 font-[family-name:var(--font-space-mono)] text-xs text-zinc-400 uppercase">
              {label}
            </p>
            {!error ? (
              <img src={src} alt={alt} className="w-full" onError={() => setError(true)} />
            ) : (
              <div className="flex h-24 items-center justify-center">
                <p className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-500">
                  Unavailable
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Field ────────────────────────────────────────────────────────────────────
const Field = ({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <div className="mb-2 flex items-center gap-2">
      <span className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.12em] text-zinc-400 uppercase">
        {label}
      </span>
      {optional && (
        <span className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-500">
          optional
        </span>
      )}
    </div>
    {children}
  </div>
);

const inputClass =
  'w-full rounded-sm border border-zinc-800 bg-transparent px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#fac71e] disabled:cursor-not-allowed disabled:text-zinc-700';

// ─── Main ─────────────────────────────────────────────────────────────────────
function AccountPageContent({ showWelcome }: { showWelcome: boolean }) {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    class: '',
    section: '',
    admissionNumber: '',
    githubId: '',
    discordId: '',
    interestedNiches: [] as string[],
  });

  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/check', { credentials: 'include' });
      if (!response.ok) return router.push('/login');
      const data = await response.json();
      if (!data?.isAuthenticated || !data?.user) return router.push('/login');
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      if (error) console.error('Error fetching user data:', error);
      const mergedUser = { ...data.user, ...userData, is_admin: userData?.is_admin || false };
      setUser(mergedUser);
      setFormData({
        name: mergedUser.name || '',
        phoneNumber: mergedUser.phone_number || '',
        class: mergedUser.class || '',
        section: mergedUser.section || '',
        admissionNumber: mergedUser.admission_number || '',
        githubId: mergedUser.github_id || '',
        discordId: mergedUser.discord_id || '',
        interestedNiches: mergedUser.interested_niches || [],
      });
      if (showWelcome) setShowWelcomeModal(true);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await fetch('/api/auth/sessions', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId?: string, revokeAll = false) => {
    if (revokeAll && !confirm('Revoke all other sessions?')) return;
    if (sessionId && !confirm('Revoke this session?')) return;
    try {
      const response = await fetch('/api/auth/sessions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, revokeAll }),
        credentials: 'include',
      });
      if (response.ok) {
        showMsg('success', revokeAll ? 'All other sessions revoked' : 'Session revoked');
        fetchSessions();
      } else showMsg('error', 'Failed to revoke session');
    } catch {
      showMsg('error', 'An error occurred');
    }
  };

  useEffect(() => {
    fetchUser();
  }, [router]);
  useEffect(() => {
    if (activeTab === 'sessions') fetchSessions();
  }, [activeTab]);

  const handleNicheToggle = (niche: string) => {
    setFormData((prev) => ({
      ...prev,
      interestedNiches: prev.interestedNiches.includes(niche)
        ? prev.interestedNiches.filter((n) => n !== niche)
        : [...prev.interestedNiches, niche],
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return showMsg('error', 'Name cannot be empty');
    if (!formData.phoneNumber.trim()) return showMsg('error', 'Phone number cannot be empty');
    if (!formData.class.trim() || !formData.section.trim())
      return showMsg('error', 'Class and section are required');
    if (formData.interestedNiches.length === 0)
      return showMsg('error', 'Please select at least one niche');
    if (!formData.admissionNumber.trim())
      return showMsg('error', 'Admission number cannot be empty');
    setSaving(true);
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phoneNumber: formData.phoneNumber,
          class: formData.class,
          section: formData.section,
          admissionNumber: formData.admissionNumber,
          githubId: formData.githubId,
          discordId: formData.discordId,
          interestedNiches: formData.interestedNiches,
        }),
        credentials: 'include',
      });
      if (response.ok) {
        showMsg('success', 'Profile updated');
        await fetchUser();
      } else {
        const data = await response.json();
        showMsg('error', data.error || 'Failed to update profile');
      }
    } catch {
      showMsg('error', 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new.length < 8)
      return showMsg('error', 'Password must be at least 8 characters');
    if (passwordData.new !== passwordData.confirm)
      return showMsg('error', 'Passwords do not match');
    setSaving(true);
    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new,
        }),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setPasswordData({ current: '', new: '', confirm: '' });
        showMsg('success', 'Password updated');
      } else showMsg('error', data.error || 'Failed to update password');
    } catch {
      showMsg('error', 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      await refreshAuth();
      router.push('/');
    } catch {
      showMsg('error', 'Failed to logout');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    setSaving(true);
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) router.push('/');
      else showMsg('error', 'Failed to delete account');
    } catch {
      showMsg('error', 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return showMsg('error', 'Please upload an image file');
    if (file.size > 5 * 1024 * 1024) return showMsg('error', 'Image must be less than 5MB');
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const response = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      if (response.ok) {
        showMsg('success', 'Profile picture updated');
        await fetchUser();
      } else showMsg('error', 'Failed to upload image');
    } catch {
      showMsg('error', 'An error occurred');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) showMsg('success', 'Verification email sent');
      else showMsg('error', 'Failed to send verification email');
    } catch {
      showMsg('error', 'An error occurred');
    } finally {
      setResendingEmail(false);
    }
  };

  if (loading) return <Loading />;
  if (!user) return null;

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'security' as TabType, label: 'Security', icon: Shield },
    { id: 'sessions' as TabType, label: 'Sessions', icon: Laptop },
    { id: 'danger' as TabType, label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-black px-4 pt-28 pb-20 text-white">
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="relative w-full max-w-md rounded-md border border-zinc-800 bg-black p-10">
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-5 right-5 text-zinc-400 transition-colors hover:text-white"
            >
              <X size={18} />
            </button>
            <img src="/tc-logo.svg" alt="TC Logo" className="mb-8 h-12 w-12" />
            <p className="mb-2 font-[family-name:var(--font-space-mono)] text-[10px] tracking-[0.25em] text-[#fac71e] uppercase">
              Welcome
            </p>
            <h2 className="mb-4 text-2xl leading-tight font-bold">
              Good to have you,
              <br />
              {user?.name?.split(' ')[0] || 'there'}.
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-zinc-400">
              Your account is ready. Here's what to do next.
            </p>
            <ul className="mb-8 space-y-3">
              {[
                'Upload a profile picture',
                'Verify your email for a special surprise',
                'Check latest announcements',
                'Have a look around the website',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="h-px w-4 bg-[#fac71e]" />
                  <span className="text-sm text-zinc-200">{item}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="w-full rounded-sm bg-[#fac71e] py-3 font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-widest text-black uppercase transition-opacity hover:opacity-80"
            >
              Let's Go
            </button>
            <p className="mt-6 text-center font-[family-name:var(--font-space-mono)] text-xs text-zinc-400 uppercase">
              Made with love · Tech Club 2025-26
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {message && (
        <div
          className={`fixed top-6 right-6 z-50 rounded-sm border px-5 py-3 font-[family-name:var(--font-space-mono)] text-xs tracking-wide ${message.type === 'success' ? 'border-[#fac71e]/40 bg-black text-[#fac71e]' : 'border-red-500/40 bg-black text-red-400'}`}
        >
          {message.text}
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        {/* Page header */}
        <div className="mb-12 flex items-end justify-between border-b border-zinc-800 pb-6">
          <div>
            <p className="mb-2 font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-zinc-400 uppercase">
              Tech Club · DPSRPK
            </p>
            <h1 className="text-3xl font-bold uppercase md:text-4xl">{user.name}</h1>
          </div>
          <div className="flex items-center gap-3">
            {user.is_admin && (
              <button
                onClick={() => router.push('/admin/login')}
                className="flex items-center gap-2 rounded-sm border border-[#fac71e]/40 px-4 py-2 font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-[#fac71e] uppercase transition-colors hover:bg-[#fac71e]/10"
              >
                <Crown size={12} /> Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-sm border border-zinc-800 px-4 py-2 font-[family-name:var(--font-space-mono)] text-xs text-zinc-300 uppercase transition-colors hover:border-zinc-500 hover:text-white"
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {/* Sidebar */}
          <aside className="space-y-8 lg:col-span-1">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div
                  className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-sm border ${user.is_admin ? 'border-[#fac71e]' : 'border-zinc-800'}`}
                  style={
                    user.is_admin ? { boxShadow: '0 0 20px rgba(250,199,30,0.15)' } : undefined
                  }
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-8 w-8 text-zinc-500" />
                  )}
                </div>
                {user.is_admin && (
                  <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-sm bg-[#fac71e]">
                    <Crown size={12} className="text-black" />
                  </div>
                )}
                <label className="absolute -right-2 -bottom-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm bg-[#fac71e] transition-opacity hover:opacity-80">
                  <svg className="h-3.5 w-3.5 text-black" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>
              {uploadingAvatar && <p className="text-sm text-zinc-400">Uploading…</p>}
            </div>

            {/* Meta */}
            <div className="space-y-4 border-t border-zinc-800 pt-6">
              <div className="flex justify-between gap-4">
                <span className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-400 uppercase">
                  Email
                </span>
                <span className="text-right text-sm break-all text-zinc-200">{user.email}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-400 uppercase">
                  User ID
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-400">
                    {user.id.slice(0, 8)}…
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user.id);
                      showMsg('success', 'User ID copied');
                    }}
                    title="Copy full User ID"
                    className="text-zinc-400 transition-colors hover:text-[#fac71e]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
              </div>
              {user.createdAt && (
                <div className="flex justify-between gap-4">
                  <span className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-400 uppercase">
                    Since
                  </span>
                  <span className="text-sm text-zinc-200">
                    {new Date(user.createdAt).toLocaleDateString('en-GB', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Verification */}
            <div className="space-y-3 border-t border-zinc-800 pt-6">
              <div
                className={`flex items-center gap-2 text-sm font-medium ${user.email_verified ? 'text-emerald-500' : 'text-amber-500'}`}
              >
                {user.email_verified ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                {user.email_verified ? 'Email verified' : 'Not verified'}
              </div>
              {!user.email_verified && (
                <button
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                  className="w-full rounded-sm border border-zinc-800 py-2 font-[family-name:var(--font-space-mono)] text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:opacity-40"
                >
                  {resendingEmail ? 'Sending…' : 'Resend Email'}
                </button>
              )}
            </div>

            {/* Tab nav */}
            <div className="space-y-0.5 border-t border-zinc-800 pt-4">
              <p className="mb-3 font-[family-name:var(--font-space-mono)] text-xs text-zinc-500 uppercase">
                Navigation
              </p>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isDanger = tab.id === 'danger';
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-sm transition-all ${
                      isActive
                        ? isDanger
                          ? 'border-l-2 border-red-500 bg-red-500/[0.08] text-red-400'
                          : 'border-l-2 border-[#fac71e] bg-[#fac71e]/[0.08] text-white'
                        : isDanger
                          ? 'border-l-2 border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-red-400'
                          : 'border-l-2 border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <Icon
                      size={14}
                      className={
                        isActive ? (isDanger ? 'text-red-400' : 'text-[#fac71e]') : 'text-zinc-400'
                      }
                    />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main content */}
          <main className="space-y-12 lg:col-span-3">
            <ActivitySection userId={user.id} />

            {user.github_id && <GitHubStatsCard githubId={user.github_id} />}

            {/* Profile */}
            {activeTab === 'profile' && (
              <div className="border-t border-zinc-800 pt-8">
                <p className="mb-8 font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-zinc-400 uppercase">
                  Profile Settings
                </p>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field label="Full Name">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Email">
                      <input type="email" value={user.email} disabled className={inputClass} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field label="Phone Number">
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="+91 98765 43210"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Admission Number">
                      <input
                        type="text"
                        value={formData.admissionNumber}
                        onChange={(e) =>
                          setFormData({ ...formData, admissionNumber: e.target.value })
                        }
                        placeholder="e.g. 12345"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field label="Class">
                      <input
                        type="text"
                        value={formData.class}
                        onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                        placeholder="e.g. 10, 11"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Section">
                      <input
                        type="text"
                        value={formData.section}
                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                        placeholder="e.g. A, B"
                        className={inputClass}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Field label="GitHub ID" optional>
                      <input
                        type="text"
                        value={formData.githubId}
                        onChange={(e) => setFormData({ ...formData, githubId: e.target.value })}
                        placeholder="your-github-username"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Discord ID" optional>
                      <input
                        type="text"
                        value={formData.discordId}
                        onChange={(e) => setFormData({ ...formData, discordId: e.target.value })}
                        placeholder="username#1234"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  {/* Niches */}
                  <div>
                    <p className="mb-4 font-[family-name:var(--font-space-mono)] text-xs tracking-[0.12em] text-zinc-400 uppercase">
                      Interested Niches
                    </p>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {NICHES.map((niche) => {
                        const active = formData.interestedNiches.includes(niche);
                        return (
                          <button
                            type="button"
                            key={niche}
                            onClick={() => handleNicheToggle(niche)}
                            className={`rounded-sm border px-3 py-2.5 text-left font-[family-name:var(--font-space-mono)] text-[10px] tracking-wider uppercase transition-colors ${
                              active
                                ? 'border-[#fac71e] text-[#fac71e]'
                                : 'border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400'
                            }`}
                          >
                            {active && <span className="mr-2">✓</span>}
                            {niche}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Application responses */}
                  {(user.why_join_tech_club ||
                    user.skills_and_achievements ||
                    user.event_participation ||
                    user.projects) && (
                    <div className="space-y-5 border-t border-zinc-800 pt-8">
                      <p className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-zinc-400 uppercase">
                        Application Responses
                      </p>
                      {[
                        { label: 'Why you wanted to join', value: user.why_join_tech_club },
                        { label: 'Skills & Achievements', value: user.skills_and_achievements },
                        { label: 'Event Participation', value: user.event_participation },
                        { label: 'Projects', value: user.projects },
                      ]
                        .filter((f) => f.value)
                        .map((f) => (
                          <div key={f.label}>
                            <p className="mb-2 font-[family-name:var(--font-space-mono)] text-xs text-zinc-400 uppercase">
                              {f.label}
                            </p>
                            <div className="border-l border-zinc-700 pl-4 text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
                              {f.value}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-sm bg-[#fac71e] px-8 py-3 font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-widest text-black uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <div className="border-t border-zinc-800 pt-8">
                <p className="mb-8 font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-zinc-400 uppercase">
                  Change Password
                </p>
                <form onSubmit={handleUpdatePassword} className="max-w-md space-y-6">
                  {(['current', 'new', 'confirm'] as const).map((key) => (
                    <Field
                      key={key}
                      label={
                        key === 'current'
                          ? 'Current Password'
                          : key === 'new'
                            ? 'New Password'
                            : 'Confirm Password'
                      }
                    >
                      <div className="relative">
                        <input
                          type={showPasswords[key] ? 'text' : 'password'}
                          value={passwordData[key]}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, [key]: e.target.value })
                          }
                          className={`${inputClass} pr-12`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({ ...showPasswords, [key]: !showPasswords[key] })
                          }
                          className="absolute top-1/2 right-4 -translate-y-1/2 text-zinc-400 transition-colors hover:text-white"
                        >
                          {showPasswords[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </Field>
                  ))}
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-sm bg-[#fac71e] px-8 py-3 font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-widest text-black uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
                  >
                    {saving ? 'Updating…' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

            {/* Sessions */}
            {activeTab === 'sessions' && (
              <div className="border-t border-zinc-800 pt-8">
                <div className="mb-8 flex items-center justify-between">
                  <p className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-zinc-400 uppercase">
                    Active Sessions
                  </p>
                  {sessions.length > 1 && (
                    <button
                      onClick={() => handleRevokeSession(undefined, true)}
                      className="font-[family-name:var(--font-space-mono)] text-xs text-red-400 uppercase transition-opacity hover:opacity-70"
                    >
                      Revoke All Others
                    </button>
                  )}
                </div>

                {loadingSessions ? (
                  <div className="flex items-center gap-4 py-12">
                    <div className="relative h-6 w-6 animate-spin">
                      <Image src="/tc-logo.svg" alt="Loading" fill className="object-contain" />
                    </div>
                    <p className="text-sm text-zinc-400">Syncing…</p>
                  </div>
                ) : sessions.length === 0 ? (
                  <p className="text-sm text-zinc-400">No active sessions found.</p>
                ) : (
                  <ul className="space-y-4">
                    {sessions.map((session) => (
                      <li
                        key={session.id}
                        className={`rounded-sm border p-5 ${session.is_current ? 'border-[#fac71e]/30' : 'border-zinc-800'}`}
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <Laptop
                                size={14}
                                className={session.is_current ? 'text-[#fac71e]' : 'text-zinc-400'}
                              />
                              <span className="text-sm font-medium text-white">
                                {session.device_info || 'Unknown Device'}
                              </span>
                              {session.is_current && (
                                <span className="font-[family-name:var(--font-space-mono)] text-xs text-[#fac71e]">
                                  Current
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 pl-5">
                              <p className="text-sm text-zinc-300">
                                {session.browser} · {session.os}
                              </p>
                              {session.city !== 'Unknown' && (
                                <p className="text-sm text-zinc-400">
                                  {session.city}, {session.country}
                                </p>
                              )}
                              <p className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-400">
                                {session.ip_address} ·{' '}
                                {new Date(session.last_active_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {!session.is_current && (
                            <button
                              onClick={() => handleRevokeSession(session.id)}
                              className="shrink-0 rounded-sm border border-red-500/30 px-4 py-2 font-[family-name:var(--font-space-mono)] text-xs text-red-400 transition-colors hover:bg-red-500/10"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-8 border-l border-zinc-800 pl-4 text-sm leading-relaxed text-zinc-300">
                  If you see unfamiliar sessions, revoke them immediately and update your password.
                </p>
              </div>
            )}

            {/* Danger Zone */}
            {activeTab === 'danger' && (
              <div className="border-t border-red-500/20 pt-8">
                <p className="mb-2 font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-red-400 uppercase">
                  Danger Zone
                </p>
                <p className="mb-8 text-sm text-zinc-400">
                  These actions are permanent and cannot be undone.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-sm border border-zinc-800 p-5">
                    <div>
                      <p className="mb-1 text-sm font-medium text-white">Sign Out</p>
                      <p className="text-sm text-zinc-300">
                        End your current session on this device.
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 rounded-sm border border-zinc-700 px-5 py-2.5 font-[family-name:var(--font-space-mono)] text-xs text-zinc-300 uppercase transition-colors hover:border-zinc-400 hover:text-white"
                    >
                      <LogOut size={12} /> Sign Out
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-sm border border-red-500/20 p-5">
                    <div>
                      <p className="mb-1 text-sm font-medium text-red-400">Delete Account</p>
                      <p className="text-sm text-zinc-300">
                        Permanently remove your account and all associated data.
                      </p>
                    </div>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-sm border border-red-500/30 bg-red-500/10 px-5 py-2.5 font-[family-name:var(--font-space-mono)] text-xs text-red-400 uppercase transition-colors hover:bg-red-500/20 disabled:opacity-40"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function AccountPageWithParams() {
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get('newSignup') === 'true';
  return <AccountPageContent showWelcome={showWelcome} />;
}

export default function AccountPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AccountPageWithParams />
    </Suspense>
  );
}
