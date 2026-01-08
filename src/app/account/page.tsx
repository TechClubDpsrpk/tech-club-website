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
import ActivitySection from '@/components/account/ActivitySection';

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
  admission_number?: string;  // Add this
  github_id?: string | null;
  discord_id?: string | null;  // Add this
  why_join_tech_club?: string;  // Add this
  skills_and_achievements?: string | null;  // Add this
  event_participation?: string;  // Add this
  projects?: string | null;  // Add this
  interested_niches?: string[];
  avatarUrl?: string | null;
  email_verified?: boolean;
  createdAt?: string;
  is_admin?: boolean;
};

type TabType = 'profile' | 'security' | 'sessions' | 'danger';

// GitHub Stats Card Component
const GitHubStatsCard = ({ githubId }: { githubId: string }) => {
  const [statsError, setStatsError] = useState(false);
  const [langsError, setLangsError] = useState(false);
  const [streakError, setStreakError] = useState(false);

  return (
    <div className="rounded-2xl border border-black-700/50 bg-gradient-to-br from-black-800/60 to-black-900/60 p-6 shadow-xl backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#C9A227]" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
        <h3 className="text-sm font-semibold text-white">GitHub Stats</h3>
      </div>
      
<div className="space-y-3">
        <div className="rounded-lg overflow-hidden bg-black-900/30">
          {!statsError ? (
          <img
            src={`https://github-readme-stats-nc.vercel.app/api?username=${githubId}&show_icons=true&theme=transparent&rank_icon=default&include_all_commits=true&hide=stars,issues&show=reviews,prs_merged,prs_merged_percentage&text_color=C9A227&title_color=E5B13A&icon_color=E5B13A&bg_color=00000000&hide_border=true`}
            alt="GitHub Stats"
            className="w-full"
          />

          ) : (
            <div className="flex items-center justify-center p-8 text-black-500">
              <p className="text-sm">Stats unavailable</p>
            </div>
          )}
        </div>

        <div className="rounded-lg overflow-hidden bg-black-900/30">
          {!langsError ? (
        <img
          src={`https://github-readme-stats-nc.vercel.app/api/top-langs?username=${githubId}&layout=compact&langs_count=6&exclude_repo=luminolens&show_icons=true&theme=transparent&text_color=C9A227&title_color=E5B13A&bg_color=00000000&hide_border=true`}
          alt="Top Languages"
          className="w-full"
          onError={() => setLangsError(true)}
        />

          ) : (
            <div className="flex items-center justify-center p-8 text-black-500">
              <p className="text-sm">Language stats unavailable</p>
            </div>
          )}
        </div>

        <div className="rounded-lg overflow-hidden bg-black-900/30">
          {!streakError ? (
        <img
          src={`https://github-readme-streak-stats-nc.vercel.app?user=${githubId}&theme=transparent&ring=E5B13A&fire=E5B13A&currStreakLabel=E5B13A&sideLabels=C9A227&currStreakNum=C9A227&dates=C9A227&background=00000000&border_radius=10&hide_border=true`}
          alt="GitHub Streak"
          className="w-full"
          onError={() => setStreakError(true)}
        />

          ) : (
            <div className="flex items-center justify-center p-8 text-black-500">
              <p className="text-sm">Streak stats unavailable</p>
            </div>
          )}
        </div>

        <a 
          href={`https://github.com/${githubId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-[#C9A227] hover:text-[#B8901E] transition mt-2"
        >
          View Full GitHub Profile →
        </a>
      </div>
    </div>
  );
};

// Main component
function AccountPageContent({ showWelcome }: { showWelcome: boolean }) {
  const router = useRouter();
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
  admissionNumber: '',  // Add this
  githubId: '',
  discordId: '',  // Add this
  interestedNiches: [] as string[],
});

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  
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
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      if (!response.ok) return router.push('/login');
      const data = await response.json();
      if (!data?.isAuthenticated || !data?.user) return router.push('/login');
      
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
      }

      const mergedUser = {
        ...data.user,
        ...userData,
        is_admin: userData?.is_admin || false,
      };

      setUser(mergedUser);
setFormData({
  name: mergedUser.name || '',
  phoneNumber: mergedUser.phone_number || '',
  class: mergedUser.class || '',
  section: mergedUser.section || '',
  admissionNumber: mergedUser.admission_number || '',  // Add this
  githubId: mergedUser.github_id || '',
  discordId: mergedUser.discord_id || '',  // Add this
  interestedNiches: mergedUser.interested_niches || [],
});

      if (showWelcome) {
        setShowWelcomeModal(true);
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await fetch('/api/auth/sessions', {
        credentials: 'include',
      });
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
    if (revokeAll && !confirm('Revoke all other sessions? You will remain logged in on this device.')) {
      return;
    }
    
    if (sessionId && !confirm('Revoke this session?')) {
      return;
    }

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
      } else {
        showMsg('error', 'Failed to revoke session');
      }
    } catch {
      showMsg('error', 'An error occurred');
    }
  };

  useEffect(() => {
    fetchUser();
  }, [router]);

  useEffect(() => {
    if (activeTab === 'sessions') {
      fetchSessions();
    }
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
    if (!formData.name.trim()) {
      showMsg('error', 'Name cannot be empty');
      return;
    }

    if (!formData.phoneNumber.trim()) {
      showMsg('error', 'Phone number cannot be empty');
      return;
    }

    if (!formData.class.trim() || !formData.section.trim()) {
      showMsg('error', 'Class and section are required');
      return;
    }

    if (formData.interestedNiches.length === 0) {
      showMsg('error', 'Please select at least one niche');
      return;
    }
if (!formData.admissionNumber.trim()) {
  showMsg('error', 'Admission number cannot be empty');
  return;
}
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
  admissionNumber: formData.admissionNumber,  // Add this
  githubId: formData.githubId,
  discordId: formData.discordId,  // Add this
  interestedNiches: formData.interestedNiches,
}),
        credentials: 'include',
      });

      if (response.ok) {
        showMsg('success', 'Profile updated successfully');
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

    if (passwordData.new.length < 8) {
      showMsg('error', 'New password must be at least 8 characters');
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      showMsg('error', 'Passwords do not match');
      return;
    }

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
        showMsg('success', 'Password updated successfully');
        await fetchUser();
      } else {
        showMsg('error', data.error || 'Failed to update password');
      }
    } catch {
      showMsg('error', 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/');
    } catch {
      showMsg('error', 'Failed to logout');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;

    setSaving(true);
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/');
      } else {
        showMsg('error', 'Failed to delete account');
      }
    } catch {
      showMsg('error', 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showMsg('error', 'Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMsg('error', 'Image must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);

      const response = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        body: formDataUpload,
        credentials: 'include',
      });

      if (response.ok) {
        showMsg('success', 'Profile picture updated');
        await fetchUser();
      } else {
        showMsg('error', 'Failed to upload image');
      }
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

      if (response.ok) {
        showMsg('success', 'Verification email sent. Check your inbox!');
      } else {
        showMsg('error', 'Failed to send verification email');
      }
    } catch {
      showMsg('error', 'An error occurred');
    } finally {
      setResendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black-900">
        <p className="text-white">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'security' as TabType, label: 'Security', icon: Shield },
    { id: 'sessions' as TabType, label: 'Sessions', icon: Laptop },
    { id: 'danger' as TabType, label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-900 via-black-900 to-black px-4 pt-24 pb-16">
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-[#C9A227]/50 bg-gradient-to-br from-black-800/90 to-black-900/90 p-8 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-4 right-4 text-black-400 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-4 w-full flex flex-col items-center">
              <img src="/tc-logo.svg" alt="TC Logo" className="w-24 h-24 mb-4" />

              <h2 className="text-2xl font-bold text-white">Welcome!</h2>
              
              <p className="text-black-300">
                Hey {user?.name || 'there'}, your account has been successfully created. Let's get you set up with a complete profile.
              </p>

              <div className="pt-4 space-y-2 w-full">
                <p className="text-sm text-black-400">Complete these steps:</p>
                <ul className="text-sm text-black-300 space-y-1">
                  <li>✓ Upload a profile picture</li>
                  <li>✓ Verify your email</li>
                  <li>✓ Check latest announcements</li>
                  <li>✓ Have a look around the website!</li>
                </ul>
              </div>

              <button
                onClick={() => setShowWelcomeModal(false)}
                className="w-full mt-6 rounded-lg bg-[#C9A227] px-4 py-3 font-semibold text-black hover:bg-[#B8901E] transition"
              >
                Let's Go!
              </button>

              <p className="text-xs text-black-500 mt-4">
                Made with ❤️ by Tech Club (2025-26)
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl">
        {/* Toast */}
        {message && (
          <div
            className={`fixed top-8 right-4 rounded-lg border px-4 py-3 backdrop-blur-xl z-50 ${
              message.type === 'success'
                ? 'bg-green-500/20 border-green-500/50 text-green-200'
                : 'bg-red-500/20 border-red-500/50 text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
          {/* LEFT: Profile Card */}
          <section className="lg:col-span-1 space-y-6">
            <div
              className={`rounded-2xl border bg-gradient-to-br p-6 shadow-xl backdrop-blur-xl ${
                user.is_admin
                  ? 'border-[#C9A227]/60 from-yellow-900/30 to-black-900/60 relative'
                  : 'border-black-700/50 from-black-800/60 to-black-900/60'
              }`}
            >
              {user.is_admin && (
                <div
                  className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
                  style={{
                    boxShadow: 'inset 0 0 30px rgba(201, 162, 39, 0.3), 0 0 40px rgba(201, 162, 39, 0.2)',
                  }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div
                    className={`flex h-24 w-24 items-center justify-center rounded-full shadow-lg ${
                      user.is_admin
                        ? 'bg-gradient-to-br from-[#C9A227] via-yellow-500 to-yellow-600'
                        : 'bg-gradient-to-br from-[#C9A227] to-black-700'
                    }`}
                    style={
                      user.is_admin
                        ? {
                            boxShadow:
                              '0 0 30px rgba(201, 162, 39, 0.6), 0 0 60px rgba(201, 162, 39, 0.3)',
                          }
                        : undefined
                    }
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="avatar"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-black-900" />
                    )}
                  </div>
                  {user.is_admin && (
                    <div
                      className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A227] border-2 border-black-900 shadow-lg"
                      style={{
                        boxShadow: '0 0 15px rgba(201, 162, 39, 0.8)',
                      }}
                    >
                      <Crown size={16} className="text-black-900" />
                    </div>
                  )}
                  <label className="absolute -right-1 -bottom-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black-600 bg-[#C9A227] shadow-lg hover:scale-110 transition">
                    <svg
                      className="w-4 h-4 text-black"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
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

                <p className="text-xl font-bold text-white">{user.name}</p>
                <p className="mt-1 break-all text-sm text-black-400">{user.email}</p>

                <div className="mt-6 w-full space-y-3 border-t border-black-700/50 pt-6">
                  <div
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-3 py-2 text-sm ${
                      user.email_verified
                        ? 'border border-green-500/30 bg-green-500/15 text-green-300'
                        : 'border border-yellow-500/30 bg-yellow-500/15 text-yellow-300'
                    }`}
                  >
                    {user.email_verified ? (
                      <>
                        <CheckCircle size={16} />
                        Email verified
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} />
                        Email not verified
                      </>
                    )}
                  </div>

                  {!user.email_verified && (
                    <button
                      onClick={handleResendVerification}
                      disabled={resendingEmail}
                      className="w-full rounded-lg border border-yellow-500/30 bg-yellow-500/20 px-3 py-2 text-xs text-yellow-300 hover:bg-yellow-500/30 transition disabled:opacity-50"
                    >
                      {resendingEmail ? 'Sending...' : 'Send verification email'}
                    </button>
                  )}

                  {user.is_admin && (
                    <button
                      onClick={() => router.push('/admin/login')}
                      className="w-full rounded-full cursor-pointer border border-[#C9A227]/50 bg-[#C9A227]/20 px-3 py-2 text-sm text-[#C9A227] hover:bg-[#C9A227]/30 transition flex items-center justify-center gap-2"
                    >
                      <Crown size={16} />
                      Admin Panel
                    </button>
                  )}

                  <div className="flex justify-between text-sm pt-3">
                    <span className="text-black-400">User ID</span>
                    <span className="font-mono text-xs text-black-200">{user.id}</span>
                  </div>

                  {user.createdAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-black-400">Member since</span>
                      <span className="text-black-200">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* GitHub Stats */}
            {user.github_id && (
              <GitHubStatsCard githubId={user.github_id} />
            )}
          </section>

          {/* RIGHT: Tabbed Settings */}
          <section className="lg:col-span-3">
            <ActivitySection userId={user.id} />
            {/* Tab Navigation */}
            <div className="mb-6 border-b border-black-700/50">
              <div className="flex gap-6 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition border-b-2 whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-[#C9A227] text-[#C9A227]'
                          : 'border-transparent text-black-400 hover:text-black-200 hover:border-black-600'
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div>
             {/* Profile Tab */}
{activeTab === 'profile' && (
  <div className="rounded-2xl border border-black-700/50 bg-gradient-to-br from-black-800/60 to-black-900/60 p-6 shadow-xl backdrop-blur-xl">
    <h2 className="text-lg font-semibold text-white mb-6">Profile Settings</h2>

    <form onSubmit={handleSaveProfile} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black-400">
            Full Name
          </span>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-xl border border-black-700/50 bg-black-900/60 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black-400">
            Email
          </span>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full rounded-xl border border-black-700/50 bg-black-900/60 px-4 py-3 text-black-500 outline-none cursor-not-allowed"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black-400">
            Phone Number
          </span>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="+91 98765 43210"
            className="w-full rounded-xl border border-black-700/50 bg-black-900/60 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black-400">
            Admission Number
          </span>
          <input
            type="text"
            value={formData.admissionNumber}
            onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
            placeholder="e.g. 12345"
            className="w-full rounded-xl border border-black-700/50 bg-black-900/60 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black-400">
            Class
          </span>
          <input
            type="text"
            value={formData.class}
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
            placeholder="e.g., 10, 11"
            className="w-full rounded-xl border border-black-700/50 bg-black-900/60 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black-400">
            Section
          </span>
          <input
            type="text"
            value={formData.section}
            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            placeholder="e.g., A, B"
            className="w-full rounded-xl border border-black-700/50 bg-black-900/60 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black-400">
            GitHub ID (Optional)
          </span>
          <input
            type="text"
            value={formData.githubId}
            onChange={(e) => setFormData({ ...formData, githubId: e.target.value })}
            placeholder="your-github-username"
            className="w-full rounded-xl border border-black-700/50 bg-black-900/60 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-black-400">
            Discord ID (Optional)
          </span>
          <input
            type="text"
            value={formData.discordId}
            onChange={(e) => setFormData({ ...formData, discordId: e.target.value })}
            placeholder="username#1234"
            className="w-full rounded-xl border border-black-700/50 bg-black-900/60 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
          />
        </label>
      </div>

      <div>
        <label className="mb-3 block text-sm font-medium text-black-400">
          Interested Niches (Select at least one)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {NICHES.map((niche) => (
            <label key={niche} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.interestedNiches.includes(niche)}
                onChange={() => handleNicheToggle(niche)}
                className="h-4 w-4 rounded border-black-600 bg-black-700 accent-[#C9A227]"
              />
              <span className="text-sm text-black-300">{niche}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Application Responses (Read-only) */}
      {(user.why_join_tech_club || user.skills_and_achievements || user.event_participation || user.projects) && (
        <div className="mt-8 pt-8 border-t border-black-700/50 space-y-4">
          <h3 className="text-md font-semibold text-white mb-4">Your Application Responses</h3>
          
          {user.why_join_tech_club && (
            <div>
              <label className="mb-2 block text-sm font-medium text-black-400">
                Why you wanted to join Tech Club
              </label>
              <div className="rounded-xl border border-black-700/50 bg-black-900/30 px-4 py-3 text-sm text-black-300">
                {user.why_join_tech_club}
              </div>
            </div>
          )}

          {user.skills_and_achievements && (
            <div>
              <label className="mb-2 block text-sm font-medium text-black-400">
                Skills & Achievements
              </label>
              <div className="rounded-xl border border-black-700/50 bg-black-900/30 px-4 py-3 text-sm text-black-300">
                {user.skills_and_achievements}
              </div>
            </div>
          )}

          {user.event_participation && (
            <div>
              <label className="mb-2 block text-sm font-medium text-black-400">
                Event Participation Interests
              </label>
              <div className="rounded-xl border border-black-700/50 bg-black-900/30 px-4 py-3 text-sm text-black-300">
                {user.event_participation}
              </div>
            </div>
          )}

          {user.projects && (
            <div>
              <label className="mb-2 block text-sm font-medium text-black-400">
                Projects
              </label>
              <div className="rounded-xl border border-black-700/50 bg-black-900/30 px-4 py-3 text-sm text-black-300 whitespace-pre-wrap">
                {user.projects}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-[#C9A227] px-6 py-3 font-semibold text-black transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  </div>
)}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="rounded-2xl border border-black-700/50 bg-gradient-to-br from-black-800/60 to-black-900/60 p-6 shadow-xl backdrop-blur-xl">
                  <h2 className="text-lg font-semibold text-white mb-6">Change Password</h2>

                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-black-400">
                        Current Password
                      </span>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.current}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, current: e.target.value })
                          }
                          className="w-full rounded-xl border border-black-700/50 bg-black-900/60 px-4 py-3 pr-12 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              current: !showPasswords.current,
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-black-400"
                        >
                          {showPasswords.current ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-black-400">
                        New Password
                      </span>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.new}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, new: e.target.value })
                          }
                          className="w-full rounded-xl border border-black-700/50 bg-black-900/60 px-4 py-3 pr-12 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              new: !showPasswords.new,
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-black-400"
                        >
                          {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-black-400">
                        Confirm Password
                      </span>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirm}
                          onChange={(e) =>
                            setPasswordData({ ...passwordData, confirm: e.target.value })
                          }
                          className="w-full rounded-xl border border-black-700/50 bg-black-900/60 px-4 py-3 pr-12 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              confirm: !showPasswords.confirm,
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-black-400"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </label>

                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-xl bg-[#C9A227] px-6 py-3 font-semibold text-black transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}

              {/* Sessions Tab */}
              {activeTab === 'sessions' && (
                <div className="rounded-2xl border border-black-700/50 bg-gradient-to-br from-black-800/60 to-black-900/60 p-6 shadow-xl backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">Active Sessions</h2>
                    {sessions.length > 1 && (
                      <button
                        onClick={() => handleRevokeSession(undefined, true)}
                        className="text-sm text-red-400 hover:text-red-300 transition"
                      >
                        Revoke all other sessions
                      </button>
                    )}
                  </div>

                  {loadingSessions ? (
                    <div className="text-center py-8 text-black-400">
                      Loading sessions...
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-8 text-black-400">
                      No active sessions found
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {sessions.map((session) => (
                        <li
                          key={session.id}
                          className={`rounded-xl border px-4 py-4 ${
                            session.is_current
                              ? 'border-[#C9A227]/50 bg-[#C9A227]/10'
                              : 'border-black-700/50 bg-black-900/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <Laptop size={18} className="text-[#C9A227]" />
                                <span className="font-medium text-white">
                                  {session.device_info || 'Unknown Device'}
                                </span>
                                {session.is_current && (
                                  <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400">
                                    Current
                                  </span>
                                )}
                              </div>
                              
                              <div className="text-sm text-black-400 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono">{session.browser}</span>
                                  <span>•</span>
                                  <span>{session.os}</span>
                                </div>
                                
                                {session.city !== 'Unknown' && (
                                  <div>
                                    📍 {session.city}, {session.country}
                                  </div>
                                )}
                                
                                <div className="flex items-center gap-4">
                                  <span>IP: {session.ip_address}</span>
                                  <span>
                                    Last active:{' '}
                                    {new Date(session.last_active_at).toLocaleString()}
                                  </span>
                                </div>
                                
                                <div className="text-xs text-black-500">
                                  Created: {new Date(session.created_at).toLocaleString()}
                                </div>
                              </div>
                            </div>

                            {!session.is_current && (
                              <button
                                onClick={() => handleRevokeSession(session.id)}
                                className="shrink-0 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 transition"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-6 pt-6 border-t border-black-700/50 text-sm text-black-400">
                    <p>
                      💡 <strong>Tip:</strong> If you see unfamiliar sessions, revoke them immediately and change your password.
                    </p>
                  </div>
                </div>
              )}

              {/* Danger Zone Tab */}
              {activeTab === 'danger' && (
                <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-black-800/60 to-black-900/60 p-6 shadow-xl backdrop-blur-xl">
                  <h2 className="text-lg font-semibold text-white mb-6">Danger Zone</h2>
                  
                  <p className="text-sm text-black-400 mb-6">
                    These actions are irreversible. Please be certain before proceeding.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 rounded-xl border border-black-700 px-6 py-3 text-black-200 hover:bg-black-800 transition"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/15 px-6 py-3 text-red-300 hover:bg-red-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                      Delete Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Wrapper that reads searchParams
function AccountPageWithParams() {
  const searchParams = useSearchParams();
  const showWelcome = searchParams.get('newSignup') === 'true';
  
  return <AccountPageContent showWelcome={showWelcome} />;
}

// Export with Suspense boundary
export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-black-900">
        <p className="text-white">Loading…</p>
      </div>
    }>
      <AccountPageWithParams />
    </Suspense>
  );
}