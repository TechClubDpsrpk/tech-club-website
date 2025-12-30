'use client';

import { useEffect, useState } from 'react';
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
  github_id?: string | null;
  interested_niches?: string[];
  avatarUrl?: string | null;
  email_verified?: boolean;
  createdAt?: string;
  is_admin?: boolean;
};

export default function AccountPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    class: '',
    section: '',
    githubId: '',
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
        githubId: mergedUser.github_id || '',
        interestedNiches: mergedUser.interested_niches || [],
      });

      // Show welcome modal if this is a new signup
      if (searchParams.get('newSignup') === 'true') {
        setShowWelcomeModal(true);
      }
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [router]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

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
          githubId: formData.githubId,
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
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-white">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black px-4 pt-24 pb-16">
      {/* Welcome Modal */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl border border-[#C9A227]/50 bg-gradient-to-br from-gray-800/90 to-gray-900/90 p-8 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-4 w-full flex flex-col items-center">
              <img src="/tc-logo.svg" alt="TC Logo" className="w-24 h-24 mb-4" />

              <h2 className="text-2xl font-bold text-white">Welcome!</h2>
              
              <p className="text-gray-300">
                Hey {user?.name || 'there'}, your account has been successfully created. Let's get you set up with a complete profile.
              </p>

              <div className="pt-4 space-y-2 w-full">
                <p className="text-sm text-gray-400">Complete these steps:</p>
                <ul className="text-sm text-gray-300 space-y-1">
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

              <p className="text-xs text-gray-500 mt-4">
                Made with ❤️ by Agnihotra, Adiya, Naitik and Rishabh
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        {/* Toast */}
        {message && (
          <div
            className={`fixed top-8 right-4 rounded-lg border px-6 py-3 backdrop-blur-xl z-50 ${
              message.type === 'success'
                ? 'bg-green-500/20 border-green-500/50 text-green-200'
                : 'bg-red-500/20 border-red-500/50 text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* LEFT: Profile Card */}
          <section className="lg:col-span-1">
            <div
              className={`rounded-2xl border bg-gradient-to-br p-6 shadow-xl backdrop-blur-xl ${
                user.is_admin
                  ? 'border-[#C9A227]/60 from-yellow-900/30 to-gray-900/60 relative'
                  : 'border-gray-700/50 from-gray-800/60 to-gray-900/60'
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
                        : 'bg-gradient-to-br from-[#C9A227] to-gray-700'
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
                      <User className="h-12 w-12 text-gray-900" />
                    )}
                  </div>
                  {user.is_admin && (
                    <div
                      className="absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A227] border-2 border-gray-900 shadow-lg"
                      style={{
                        boxShadow: '0 0 15px rgba(201, 162, 39, 0.8)',
                      }}
                    >
                      <Crown size={16} className="text-gray-900" />
                    </div>
                  )}
                  <label className="absolute -right-1 -bottom-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-600 bg-[#C9A227] shadow-lg hover:scale-110 transition">
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
                <p className="mt-1 break-all text-sm text-gray-400">{user.email}</p>

                <div className="mt-6 w-full space-y-3 border-t border-gray-700/50 pt-6">
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
                      onClick={() => router.push('/admin')}
                      className="w-full rounded-full cursor-pointer border border-[#C9A227]/50 bg-[#C9A227]/20 px-3 py-2 text-sm text-[#C9A227] hover:bg-[#C9A227]/30 transition flex items-center justify-center gap-2"
                    >
                      <Crown size={16} />
                      Admin Panel
                    </button>
                  )}

                  <div className="flex justify-between text-sm pt-3">
                    <span className="text-gray-400">User ID</span>
                    <span className="font-mono text-xs text-gray-200">{user.id}</span>
                  </div>

                  {user.createdAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Member since</span>
                      <span className="text-gray-200">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT: Settings */}
          <section className="space-y-6 lg:col-span-3">
            {/* Profile Settings */}
            <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-3">
                <User size={20} className="text-[#C9A227]" />
                <h2 className="text-lg font-semibold text-white">Profile Settings</h2>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-400">
                      Full Name
                    </span>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-xl border border-gray-700/50 bg-gray-900/60 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-400">
                      Email
                    </span>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full rounded-xl border border-gray-700/50 bg-gray-900/60 px-4 py-3 text-gray-500 outline-none"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-400">
                      Phone Number
                    </span>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-gray-700/50 bg-gray-900/60 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-400">
                      GitHub ID (Optional)
                    </span>
                    <input
                      type="text"
                      value={formData.githubId}
                      onChange={(e) => setFormData({ ...formData, githubId: e.target.value })}
                      placeholder="your-github-username"
                      className="w-full rounded-xl border border-gray-700/50 bg-gray-900/60 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-400">
                      Class
                    </span>
                    <input
                      type="text"
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      placeholder="e.g., 10th, 11th"
                      className="w-full rounded-xl border border-gray-700/50 bg-gray-900/60 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-gray-400">
                      Section
                    </span>
                    <input
                      type="text"
                      value={formData.section}
                      onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                      placeholder="e.g., A, B"
                      className="w-full rounded-xl border border-gray-700/50 bg-gray-900/60 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                    />
                  </label>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-400">
                    Interested Niches (Select at least one)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {NICHES.map((niche) => (
                      <label key={niche} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.interestedNiches.includes(niche)}
                          onChange={() => handleNicheToggle(niche)}
                          className="h-4 w-4 rounded border-gray-600 bg-gray-700 accent-[#C9A227]"
                        />
                        <span className="text-sm text-gray-300">{niche}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#C9A227] px-6 py-3 font-semibold text-black transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Security */}
            <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-3">
                <Shield size={20} className="text-[#C9A227]" />
                <h2 className="text-lg font-semibold text-white">Security</h2>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-400">
                    Current Password
                  </span>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.current}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, current: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-700/50 bg-gray-900/60 px-4 py-3 pr-12 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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
                  <span className="mb-2 block text-sm font-medium text-gray-400">
                    New Password
                  </span>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.new}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, new: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-700/50 bg-gray-900/60 px-4 py-3 pr-12 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-gray-400">
                    Confirm Password
                  </span>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirm}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirm: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-700/50 bg-gray-900/60 px-4 py-3 pr-12 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
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

            {/* Sessions */}
            <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-3">
                <Laptop size={20} className="text-[#C9A227]" />
                <h2 className="text-lg font-semibold text-white">Sessions & Devices</h2>
              </div>

              <ul className="space-y-3">
                <li className="flex items-center justify-between rounded-xl border border-gray-700/50 bg-gray-900/30 px-4 py-3">
                  <div className="text-gray-200 font-medium">
                    Current Session
                    <span className="ml-2 rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                      (current)
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Danger Zone */}
            <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-3">
                <AlertTriangle size={20} className="text-red-400" />
                <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/15 px-6 py-3 text-red-300 hover:bg-red-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  Delete Account
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl border border-gray-700 px-6 py-3 text-gray-200 hover:bg-gray-800 transition"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}