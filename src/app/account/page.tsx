// app/account/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  //  UserIcon,
  // Shield,
  // LogOut,
  // Trash2,
  // Laptop,
  // CheckCircle,
  // AlertTriangle,
  // Camera,
  User as
  Eye,
  EyeOff,
} from 'lucide-react';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({ name: '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/check', { credentials: 'include' });
        if (!response.ok) return router.push('/login');
        const data = await response.json();
        if (!data?.isAuthenticated || !data?.user) return router.push('/login');
        setUser(data.user);
        setFormData({ name: data.user.name });
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return showMsg('error', 'Name cannot be empty');

    setSaving(true);
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name }),
        credentials: 'include',
      });

      if (response.ok) {
        setUser((prev) => (prev ? { ...prev, name: formData.name } : null));
        showMsg('success', 'Profile updated successfully');
      } else showMsg('error', 'Failed to update profile');
    } catch {
      showMsg('error', 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new.length < 8)
      return showMsg('error', 'New password must be at least 8 characters');
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

      const data: { error?: string } = await response.json();

      if (response.ok) {
        setPasswordData({ current: '', new: '', confirm: '' });
        showMsg('success', 'Password updated successfully');
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

    if (!file.type.startsWith('image/'))
      return showMsg('error', 'Please upload an image file');
    if (file.size > 5 * 1024 * 1024)
      return showMsg('error', 'Image must be less than 5MB');

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const data: { avatarUrl: string } = await response.json();
        setUser((prev) => (prev ? { ...prev, avatarUrl: data.avatarUrl } : null));
        showMsg('success', 'Profile picture updated');
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

      if (response.ok)
        showMsg('success', 'Verification email sent. Check your inbox!');
      else showMsg('error', 'Failed to send verification email');
    } catch {
      showMsg('error', 'An error occurred');
    } finally {
      setResendingEmail(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <p className="text-white">Loading…</p>
      </div>
    );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black px-4 pt-24 pb-16">
      <div className="mx-auto max-w-6xl">{/* UI unchanged */}</div>
    </div>
  );
}

/* ---------- UI COMPONENT TYPES ---------- */

type CardProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  danger?: boolean;
};

type InputProps = { label: string } & React.InputHTMLAttributes<HTMLInputElement>;

type PasswordInputProps = {
  label: string;
  show: boolean;
  onToggle: () => void;
} & React.InputHTMLAttributes<HTMLInputElement>;

type ButtonProps = {
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type InfoRowProps = {
  label: string;
  value: string;
  mono?: boolean;
};

type BadgeRowProps = {
  icon: LucideIcon;
  label: string;
  tone: 'success' | 'warn';
};

type SessionRowProps = {
  name: string;
  current?: boolean;
};

/* ---------- UI COMPONENTS ---------- */

function Card({ title, icon: Icon, children, danger = false }: CardProps) {
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-6 shadow-xl backdrop-blur-xl ${
        danger ? 'border-red-500/30' : 'border-gray-700/50'
      }`}
    >
      <div className="mb-6 flex items-center gap-3">
        <Icon size={20} className={danger ? 'text-red-400' : 'text-[#C9A227]'} />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Input({ label, ...props }: InputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-400">{label}</span>
      <input
        {...props}
        className="w-full rounded-xl border border-gray-700/50 bg-gray-900/60 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
      />
    </label>
  );
}

function PasswordInput({ label, show, onToggle, ...props }: PasswordInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-400">{label}</span>
      <div className="relative">
        <input
          {...props}
          type={show ? 'text' : 'password'}
          className="w-full rounded-xl border border-gray-700/50 bg-gray-900/60 px-4 py-3 pr-12 text-white outline-none focus:ring-2 focus:ring-[#C9A227]/50"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}

function PrimaryBtn({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="rounded-xl bg-[#C9A227] px-6 py-3 font-semibold text-black transition disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function GhostBtn({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="flex items-center gap-2 rounded-xl border border-gray-700 px-6 py-3 text-gray-200"
    >
      {children}
    </button>
  );
}

function DangerBtn({ children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/15 px-6 py-3 text-red-300"
    >
      {children}
    </button>
  );
}

function InfoRow({ label, value, mono = false }: InfoRowProps) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className={`${mono ? 'font-mono text-xs' : ''} text-gray-200`}>{value}</span>
    </div>
  );
}

function BadgeRow({ icon: Icon, label, tone }: BadgeRowProps) {
  return (
    <div
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-3 py-2 text-sm ${
        tone === 'success'
          ? 'border border-green-500/30 bg-green-500/15 text-green-300'
          : 'border border-yellow-500/30 bg-yellow-500/15 text-yellow-300'
      }`}
    >
      <Icon size={16} />
      {label}
    </div>
  );
}

function SessionRow({ name, current = false }: SessionRowProps) {
  return (
    <li className="flex justify-between rounded-xl border border-gray-700/50 bg-gray-900/30 px-4 py-3">
      <span className="text-gray-200">
        {name}
        {current && (
          <span className="ml-2 rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
            (current)
          </span>
        )}
      </span>
    </li>
  );
}
