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
  FileText,
  Megaphone,
  LayoutDashboard,
  FolderKanban,
  Ban,
  ShieldAlert,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import AddAnnouncement from '@/components/admin/AddAnnouncement';
import AddProject from '@/components/admin/AddProject';
import ProjectSubmissions from '@/components/admin/ProjectSubmissions';
import { BanUserModal } from '@/app/admin/BanUserModal';

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
  is_banned?: boolean;
  ban_reason?: string;
  created_at?: string;
};

type Tab = 'dashboard' | 'projects' | 'announcements' | 'submissions' | 'users';

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
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [banModalUser, setBanModalUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
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
    router.replace('/admin/login');
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

  const handleBanSuccess = () => {
    // Refresh the users list after a successful ban
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("users")
        .select("*")
        .order('created_at', { ascending: false });
      if (data) setUsers(data);
    };
    fetchUsers();
  };

  const handleUnbanUser = async (userId: string) => {
    if (!confirm('Are you sure you want to unban this user?')) return;

    try {
      const response = await fetch('/api/admin/unban-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unban user');
      }

      alert('User unbanned successfully');
      
      // Refresh users list
      const { data: updatedUsers } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      if (updatedUsers) setUsers(updatedUsers);
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert(error instanceof Error ? error.message : 'Failed to unban user');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
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
      <div className="flex min-h-screen items-center justify-center bg-black px-4">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center backdrop-blur-xl">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h1 className="mb-2 text-2xl font-bold text-white">Access Denied</h1>
          <p className="text-[#C9A227]/70">
            {error || "You don't have admin privileges"}
          </p>
          <button
            onClick={handleLogout}
            className="mt-6 rounded-xl border border-[#C9A227] px-6 py-2 text-[#C9A227] hover:bg-[#C9A227] hover:text-black transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects' as Tab, label: 'Projects', icon: FolderKanban },
    { id: 'announcements' as Tab, label: 'Announcements', icon: Megaphone },
    { id: 'users' as Tab, label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-black px-4 pt-24 pb-16">
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
              <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
              <p className="text-[#C9A227]/70">This is where you can be called the GOD of the website</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-[#C9A227] px-4 py-2 text-[#C9A227] transition hover:bg-[#C9A227] hover:text-black"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8 border-b border-[#C9A227]/20">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-[#C9A227] border-b-2 border-[#C9A227]'
                      : 'text-[#C9A227]/50 hover:text-[#C9A227]/80'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'dashboard' && (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-[#C9A227]/30 bg-black p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#C9A227]/70">Total Users</p>
                      <p className="mt-2 text-3xl font-bold text-white">
                        {users.length}
                      </p>
                    </div>
                    <Users className="h-12 w-12 text-[#C9A227] opacity-20" />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#C9A227]/30 bg-black p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#C9A227]/70">Admins</p>
                      <p className="mt-2 text-3xl font-bold text-white">
                        {users.filter((u) => u.is_admin).length}
                      </p>
                    </div>
                    <Shield className="h-12 w-12 text-[#C9A227] opacity-20" />
                  </div>
                </div>

                <div className="rounded-2xl border border-[#C9A227]/30 bg-black p-6 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#C9A227]/70">System Status</p>
                      <p className="mt-2 flex items-center gap-2 text-lg font-bold text-[#C9A227]">
                        <span className="h-2 w-2 rounded-full bg-[#C9A227]"></span>
                        Operational
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-[#C9A227] opacity-20"></div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#C9A227]/30 bg-black p-8 shadow-xl">
                <div className="mb-6 flex items-center gap-3">
                  <FileText size={24} className="text-[#C9A227]" />
                  <h2 className="text-2xl font-bold text-white">Project Submissions</h2>
                </div>
                <ProjectSubmissions />
              </div>
            </>
          )}

          {activeTab === 'projects' && (
            <div className="rounded-2xl border border-[#C9A227]/30 bg-black p-8 shadow-xl">
              <h2 className="mb-6 text-2xl font-bold text-white">
                Create Project
              </h2>
              <AddProject />
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="rounded-2xl border border-[#C9A227]/30 bg-black p-8 shadow-xl">
              <h2 className="mb-6 text-2xl font-bold text-white">
                Create Announcement
              </h2>
              <AddAnnouncement />
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="rounded-2xl border border-[#C9A227]/30 bg-black p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <FileText size={24} className="text-[#C9A227]" />
                <h2 className="text-2xl font-bold text-white">Project Submissions</h2>
              </div>
              <ProjectSubmissions />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="rounded-2xl border border-[#C9A227]/30 bg-black p-8 shadow-xl">
              <div className="mb-6 flex items-center gap-3">
                <Users size={24} className="text-[#C9A227]" />
                <h2 className="text-2xl font-bold text-white">All Users</h2>
              </div>

              {users.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-[#C9A227]/70">No users found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="border border-[#C9A227]/30 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedUser(
                            expandedUser === user.id ? null : user.id
                          )
                        }
                        className="w-full px-4 py-4 hover:bg-[#C9A227]/10 transition flex items-center justify-between text-left"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-white">
                              {user.name}
                            </h3>
                            {user.is_admin && (
                              <div className="inline-flex items-center gap-1 rounded-full bg-[#C9A227]/20 px-2 py-0.5 text-xs font-medium text-[#C9A227]">
                                <CheckCircle size={12} />
                                Admin
                              </div>
                            )}
                            {user.email_verified && (
                              <div className="inline-flex items-center gap-1 rounded-full bg-[#C9A227]/20 px-2 py-0.5 text-xs font-medium text-[#C9A227]">
                                <CheckCircle size={12} />
                                Verified
                              </div>
                            )}
                            {user.is_banned && (
                              <div className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
                                <ShieldAlert size={12} />
                                Banned
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-[#C9A227]/70">{user.email}</p>
                        </div>
                        <ChevronDown
                          size={20}
                          className={`text-[#C9A227]/70 transition ${
                            expandedUser === user.id ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {expandedUser === user.id && (
                        <div className="border-t border-[#C9A227]/30 bg-[#C9A227]/5 px-4 py-4 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-[#C9A227]/50 uppercase">
                                Phone
                              </p>
                              <p className="text-sm text-white">
                                {user.phone_number || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#C9A227]/50 uppercase">
                                Class
                              </p>
                              <p className="text-sm text-white">
                                {user.class || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#C9A227]/50 uppercase">
                                Section
                              </p>
                              <p className="text-sm text-white">
                                {user.section || '—'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#C9A227]/50 uppercase">
                                GitHub ID
                              </p>
                              <p className="text-sm text-white">
                                {user.github_id ? (
                                  <a
                                    href={`https://github.com/${user.github_id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#C9A227] hover:underline"
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
                            <p className="text-xs text-[#C9A227]/50 uppercase mb-2">
                              Interested Niches
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {user.interested_niches &&
                              user.interested_niches.length > 0 ? (
                                user.interested_niches.map((niche) => (
                                  <span
                                    key={niche}
                                    className="bg-[#C9A227]/20 text-[#C9A227] text-xs px-2 py-1 rounded-full"
                                  >
                                    {niche}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[#C9A227]/50 text-sm">—</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-[#C9A227]/30">
                            <p className="text-xs text-[#C9A227]/50">
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
                                    ? 'bg-[#C9A227]/20 text-[#C9A227] hover:bg-[#C9A227]/30'
                                    : 'border border-[#C9A227]/50 text-[#C9A227] hover:bg-[#C9A227]/10'
                                }`}
                              >
                                <Shield size={14} />
                                {updatingAdmin === user.id
                                  ? 'Updating...'
                                  : user.is_admin
                                    ? 'Remove Admin'
                                    : 'Make Admin'}
                              </button>
                              {user.is_banned ? (
                                <button
                                  onClick={() => handleUnbanUser(user.id)}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600/20 text-green-400 hover:bg-green-600/30 transition"
                                >
                                  <ShieldAlert size={14} />
                                  Unban User
                                </button>
                              ) : (
                                <button
                                  onClick={() => setBanModalUser({ id: user.id, name: user.name })}
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition"
                                >
                                  <Ban size={14} />
                                  Ban User
                                </button>
                              )}
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
          )}
        </div>
      </div>

      {banModalUser && (
        <BanUserModal
          userId={banModalUser.id}
          username={banModalUser.name}
          onClose={() => setBanModalUser(null)}
          onSuccess={handleBanSuccess}
        />
      )}
    </div>
  );
}