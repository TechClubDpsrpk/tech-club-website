'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  LogOut,
  Users,
  AlertCircle,
  CheckCircle,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import AddAnnouncement from '@/components/admin/AddAnnouncement';

type User = {
  id: string;
  email: string;
  name: string;
  phone_number: string;
  class: string;
  section: string;
  github_id: string | null;
  interested_niches: string[];
  is_admin: boolean;
  email_verified: boolean;
  created_at?: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [updatingAdmin, setUpdatingAdmin] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Check if user is authenticated via JWT
        const response = await fetch('/api/auth/check', {
          credentials: 'include',
        });

        if (!response.ok) {
          router.replace('/admin/login');
          return;
        }

        const data = await response.json();

        if (!data?.isAuthenticated || !data?.user) {
          router.replace('/admin/login');
          return;
        }

        // Fetch user from Supabase to verify is_admin
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (error || !userData) {
          setError('User not found');
          setLoading(false);
          return;
        }

        if (!userData.is_admin) {
          setError('You do not have admin privileges');
          setLoading(false);
          return;
        }

        setIsAdmin(true);
        setCurrentUser(userData);

        // Fetch all users from Supabase with new fields
        const { data: allUsers, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (!usersError && allUsers) {
          setUsers(allUsers as User[]);
        }

        setLoading(false);
      } catch {
        setError('Failed to verify admin access');
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  const handleLogout = () => {
    router.replace('/login');
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure? This will permanently delete this account.'))
      return;

    setDeleting(userId);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        setError('Failed to delete user');
        return;
      }

      setUsers(users.filter((u) => u.id !== userId));
    } catch {
      setError('An error occurred while deleting user');
    } finally {
      setDeleting(null);
    }
  };

  const handleSetAdmin = async (userId: string, newAdminStatus: boolean) => {
    setUpdatingAdmin(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: newAdminStatus })
        .eq('id', userId);

      if (error) {
        setError(`Failed to ${newAdminStatus ? 'grant' : 'revoke'} admin privileges`);
        return;
      }

      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_admin: newAdminStatus } : u
        )
      );
    } catch {
      setError('An error occurred while updating admin status');
    } finally {
      setUpdatingAdmin(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-black">
        <div className="text-center">
          <div className="mb-4 inline-block rounded-full bg-[#C9A227]/20 p-4">
            <Shield size={32} className="text-[#C9A227]" />
          </div>
          <p className="text-white">Checking admin access…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-900 to-black px-4">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center backdrop-blur-xl">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h1 className="mb-2 text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-gray-400">
            {error || "You don't have admin privileges"}
          </p>
          <button
            onClick={handleLogout}
            className="mt-6 rounded-xl border border-gray-700 px-6 py-2 text-gray-300 hover:bg-gray-800"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black px-4 pt-24 pb-16">
      <div className="mx-auto max-w-7xl">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 px-4 py-3 text-red-200">
            {error}
          </div>
        )}

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[#C9A227]/20 p-3">
              <Shield size={28} className="text-[#C9A227]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400">Manage users and announcements</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-gray-700 px-4 py-2 text-gray-300 transition hover:text-white hover:bg-amber-700 cursor-pointer"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline ">Logout</span>
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {users.length}
                </p>
              </div>
              <Users className="h-12 w-12 text-[#C9A227] opacity-20" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Admins</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {users.filter((u) => u.is_admin).length}
                </p>
              </div>
              <Shield className="h-12 w-12 text-[#C9A227] opacity-20" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">System Status</p>
                <p className="mt-2 flex items-center gap-2 text-lg font-bold text-green-400">
                  <span className="h-2 w-2 rounded-full bg-green-400"></span>
                  Operational
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500 opacity-20"></div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-8 shadow-xl backdrop-blur-xl">
            <h2 className="mb-6 text-2xl font-bold text-white">
              Create Announcement
            </h2>
            <AddAnnouncement />
          </div>

          <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-8 shadow-xl backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
              <Users size={24} className="text-[#C9A227]" />
              <h2 className="text-2xl font-bold text-white">All Users</h2>
            </div>

            {users.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-400">No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="border border-gray-700/30 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedUser(
                          expandedUser === user.id ? null : user.id
                        )
                      }
                      className="w-full px-4 py-4 hover:bg-gray-800/30 transition flex items-center justify-between text-left"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white">
                            {user.name}
                          </h3>
                          {user.is_admin && (
                            <div className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-300">
                              <CheckCircle size={12} />
                              Admin
                            </div>
                          )}
                          {user.email_verified && (
                            <div className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300">
                              <CheckCircle size={12} />
                              Verified
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`text-gray-400 transition ${
                          expandedUser === user.id ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {expandedUser === user.id && (
                      <div className="border-t border-gray-700/30 bg-gray-800/20 px-4 py-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase">
                              Phone
                            </p>
                            <p className="text-sm text-gray-300">
                              {user.phone_number || '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">
                              Class
                            </p>
                            <p className="text-sm text-gray-300">
                              {user.class || '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">
                              Section
                            </p>
                            <p className="text-sm text-gray-300">
                              {user.section || '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase">
                              GitHub ID
                            </p>
                            <p className="text-sm text-gray-300">
                              {user.github_id ? (
                                <a
                                  href={`https://github.com/${user.github_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline"
                                >
                                  {user.github_id}
                                </a>
                              ) : (
                                '—'
                              )}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500 uppercase mb-2">
                            Interested Niches
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {user.interested_niches &&
                            user.interested_niches.length > 0 ? (
                              user.interested_niches.map((niche) => (
                                <span
                                  key={niche}
                                  className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded-full"
                                >
                                  {niche}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm">—</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-700/30">
                          <p className="text-xs text-gray-500">
                            Joined{' '}
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString()
                              : '—'}
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSetAdmin(user.id, !user.is_admin)}
                              disabled={updatingAdmin === user.id}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                                user.is_admin
                                  ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700/70'
                              }`}
                            >
                              <Shield size={14} />
                              {updatingAdmin === user.id
                                ? 'Updating...'
                                : user.is_admin
                                  ? 'Remove Admin'
                                  : 'Make Admin'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deleting === user.id}
                              className="flex items-center gap-2 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                            >
                              <Trash2 size={16} />
                              {deleting === user.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}