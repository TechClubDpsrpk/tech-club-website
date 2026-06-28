'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  LogOut,
  Users,
  AlertCircle,
  Megaphone,
  LayoutDashboard,
  FolderKanban,
  Globe,
  Trophy,
  Crown,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import AddAnnouncement from '@/components/admin/AddAnnouncement';
import AddProject from '@/components/admin/AddProject';
import VJudgeSettings from '@/components/admin/VJudgeSettings';
import ProjectSubmissions from '@/components/admin/ProjectSubmissions';
import UsersTable from '@/app/admin/UsersTable';
import Loading from '@/app/loading';
import {
  ROLES,
  hasAnyRole,
  canCreateAnnouncements,
  canAssignQuests,
  canManageRoles,
  canManageSiteAccess,
  hasAccessToAdminPanel,
} from '@/lib/roles';

type User = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  is_admin: boolean;
  [key: string]: any;
};

type Tab =
  | 'dashboard'
  | 'projects'
  | 'announcements'
  | 'submissions'
  | 'users'
  | 'site-access'
  | 'vjudge';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [siteSessions, setSiteSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [error, setError] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(true);
  const [updatingMode, setUpdatingMode] = useState(false);

  // Tab availability handlers
  const canViewProjects = (roles: string[]) => hasAccessToAdminPanel(roles);
  const canViewUsers = (roles: string[]) => canManageRoles(roles);
  const canViewSiteAccess = (roles: string[]) => canManageSiteAccess(roles);
  const canAnnounce = (roles: string[]) => canCreateAnnouncements(roles);

  // Dashboard Metrics
  const [metrics, setMetrics] = useState({ totalUsers: 0, admins: 0 });

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const response = await fetch('/api/admin/check', {
          credentials: 'include',
        });
        const data = await response.json();

        if (!data.authenticated) {
          router.replace('/admin/login');
          return;
        }

        const userRoles = data.user.roles || [];

        if (!hasAccessToAdminPanel(userRoles)) {
          setError('Access Denied');
          setLoading(false);
          return;
        }

        if (!data.vaultUnlocked) {
          router.replace('/admin/login');
          return;
        }

        setIsAdmin(true);
        setCurrentUser({ ...data.user, roles: userRoles });

        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        const { count: adminCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .not('roles', 'is', null)
          .not('roles', 'eq', '{}');

        setMetrics({ totalUsers: userCount || 0, admins: adminCount || 0 });

        setLoading(false);
      } catch (e) {
        console.error('Admin check failed', e);
        router.push('/admin/login');
      }
    };

    checkAdminAccess();
  }, [router]);

  const fetchSiteSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch('/api/admin/site-sessions');
      if (res.ok) {
        const data = await res.json();
        setSiteSessions(data.sessions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSiteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to revoke this visitor's access?")) return;
    try {
      const res = await fetch('/api/admin/site-sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (res.ok) {
        setSiteSessions((prev) => prev.filter((s) => s.id !== sessionId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'site-access') {
      fetchSiteSessions();
      fetchMaintenanceMode();
    }
  }, [activeTab]);

  const fetchMaintenanceMode = async () => {
    try {
      const res = await fetch('/api/admin/site-settings');
      if (res.ok) {
        const data = await res.json();
        setMaintenanceMode(data.maintenance_mode?.enabled ?? true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleMaintenance = async () => {
    const newValue = !maintenanceMode;
    setUpdatingMode(true);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'maintenance_mode',
          value: { enabled: newValue },
        }),
      });

      if (res.ok) {
        setMaintenanceMode(newValue);
      } else {
        alert('Failed to update maintenance mode');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating maintenance mode');
    } finally {
      setUpdatingMode(false);
    }
  };

  const handleLogout = () => {
    router.replace('/admin/login');
  };

  if (loading) {
    return <Loading isAdmin={true} customText="Checking Admin Status..." hideTips={true} />;
  }

  if (!isAdmin || !currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="font-[family-name:var(--font-space-mono)] text-sm tracking-widest text-red-400 uppercase">
          Access Denied
        </p>
      </div>
    );
  }

  const roles = currentUser.roles || [];
  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard, show: true },
    { id: 'projects' as Tab, label: 'Projects', icon: FolderKanban, show: canAssignQuests(roles) },
    {
      id: 'announcements' as Tab,
      label: 'Announcements',
      icon: Megaphone,
      show: canAnnounce(roles),
    },
    { id: 'users' as Tab, label: 'Users', icon: Users, show: canViewUsers(roles) },
    { id: 'site-access' as Tab, label: 'Site Access', icon: Globe, show: canViewSiteAccess(roles) },
    { id: 'vjudge' as Tab, label: 'CP Contests', icon: Trophy, show: canAssignQuests(roles) },
  ].filter((t) => t.show);

  return (
    <div className="min-h-screen bg-black px-4 pt-28 pb-20 text-white">
      <div className="mx-auto max-w-7xl">
        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="mb-12 flex items-end justify-between border-b border-zinc-800 pb-6">
          <div>
            <p className="mb-2 font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-zinc-400 uppercase">
              Tech Club · DPSRPK
            </p>
            <h1 className="text-3xl font-bold uppercase md:text-4xl">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Role pill */}
            <div className="flex items-center gap-2 rounded-sm border border-[#fac71e]/20 bg-[#fac71e]/[0.06] px-3 py-1.5">
              <Crown size={11} className="text-[#fac71e]" />
              <span className="font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-[#fac71e] uppercase">
                {roles.join(', ') || 'Staff'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-sm border border-zinc-800 px-4 py-2 font-[family-name:var(--font-space-mono)] text-xs text-zinc-300 uppercase transition-colors hover:border-zinc-500 hover:text-white"
            >
              <LogOut size={12} /> Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside className="space-y-8 lg:col-span-1">
            {/* Admin identity */}
            <div className="space-y-4 border-t border-zinc-800 pt-6">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#fac71e] bg-[#fac71e]/[0.08]"
                  style={{ boxShadow: '0 0 20px rgba(250,199,30,0.1)' }}
                >
                  <Shield size={16} className="text-[#fac71e]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{currentUser.name}</p>
                  <p className="font-[family-name:var(--font-space-mono)] text-[10px] text-zinc-500 uppercase">
                    Administrator
                  </p>
                </div>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-400 uppercase">
                  Email
                </span>
                <span className="text-right text-sm break-all text-zinc-200">
                  {currentUser.email}
                </span>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="space-y-0.5 border-t border-zinc-800 pt-4">
              <p className="mb-3 font-[family-name:var(--font-space-mono)] text-xs text-zinc-500 uppercase">
                Navigation
              </p>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-sm transition-all ${
                      isActive
                        ? 'border-l-2 border-[#fac71e] bg-[#fac71e]/[0.08] text-white'
                        : 'border-l-2 border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white'
                    }`}
                  >
                    <Icon size={14} className={isActive ? 'text-[#fac71e]' : 'text-zinc-400'} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────────── */}
          <main className="space-y-12 lg:col-span-3">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-10">
                {/* Stats */}
                <div className="border-t border-zinc-800 pt-8">
                  <p className="mb-6 font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-zinc-400 uppercase">
                    Overview
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-sm border border-zinc-800 p-5">
                      <p className="mb-1 font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-zinc-500 uppercase">
                        Total Users
                      </p>
                      <p className="text-3xl font-bold text-white">{metrics.totalUsers}</p>
                    </div>
                    <div className="rounded-sm border border-zinc-800 p-5">
                      <p className="mb-1 font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-zinc-500 uppercase">
                        Staff Members
                      </p>
                      <p className="text-3xl font-bold text-white">{metrics.admins}</p>
                    </div>
                  </div>
                </div>

                {/* Submissions preview */}
                <div className="border-t border-zinc-800 pt-8">
                  <p className="mb-6 font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-zinc-400 uppercase">
                    Project Submissions
                  </p>
                  <ProjectSubmissions />
                </div>
              </div>
            )}

            {/* Projects */}
            {activeTab === 'projects' && (
              <div className="border-t border-zinc-800 pt-8">
                <p className="mb-8 font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-zinc-400 uppercase">
                  Create Project
                </p>
                <AddProject />
              </div>
            )}

            {/* Announcements */}
            {activeTab === 'announcements' && (
              <div className="border-t border-zinc-800 pt-8">
                <p className="mb-8 font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-zinc-400 uppercase">
                  Create Announcement
                </p>
                <AddAnnouncement />
              </div>
            )}

            {/* Users */}
            {activeTab === 'users' && (
              <div className="border-t border-zinc-800 pt-8">
                <p className="mb-8 font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-zinc-400 uppercase">
                  All Users
                </p>
                <UsersTable />
              </div>
            )}

            {/* Site Access */}
            {activeTab === 'site-access' && (
              <div className="space-y-10">
                {/* Coming soon toggle */}
                <div className="border-t border-zinc-800 pt-8">
                  <p className="mb-6 font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-zinc-400 uppercase">
                    Coming Soon Mode
                  </p>
                  <div className="rounded-sm border border-zinc-800 p-5">
                    <div className="flex items-center justify-between gap-6">
                      <div>
                        <p className="mb-1 text-sm font-medium text-white">Site Lockdown</p>
                        <p className="text-sm text-zinc-400">
                          When enabled, unauthorized visitors are redirected to the Coming Soon
                          page.
                        </p>
                      </div>
                      {/* Toggle */}
                      <button
                        onClick={handleToggleMaintenance}
                        disabled={updatingMode}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
                          maintenanceMode ? 'bg-[#fac71e]' : 'bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                            maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {maintenanceMode && (
                      <div className="mt-5 flex items-center gap-3 border-t border-zinc-800 pt-4">
                        <AlertCircle size={13} className="shrink-0 text-[#fac71e]" />
                        <p className="text-sm text-zinc-300">
                          Site is currently in Coming Soon lockdown mode.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Site visitors */}
                <div className="border-t border-zinc-800 pt-8">
                  <div className="mb-6 flex items-center justify-between">
                    <p className="font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-zinc-400 uppercase">
                      Site Visitors
                    </p>
                    <button
                      onClick={fetchSiteSessions}
                      className="font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-[#fac71e] uppercase transition-opacity hover:opacity-70"
                    >
                      Refresh
                    </button>
                  </div>

                  {loadingSessions ? (
                    <p className="text-sm text-zinc-500">Loading sessions…</p>
                  ) : siteSessions.length === 0 ? (
                    <p className="text-sm text-zinc-500">No active visitor sessions.</p>
                  ) : (
                    <ul className="divide-y divide-zinc-900">
                      {siteSessions.map((session) => (
                        <li
                          key={session.id}
                          className="flex items-center justify-between gap-6 py-4"
                        >
                          <div className="space-y-1">
                            <p className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-300">
                              {session.ip_address}
                            </p>
                            <p className="text-sm text-zinc-400">
                              {session.city}, {session.country}
                            </p>
                            <p className="max-w-xs truncate text-xs text-zinc-600">
                              {session.user_agent}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRevokeSiteSession(session.id)}
                            className="shrink-0 rounded-sm border border-red-500/30 px-4 py-2 font-[family-name:var(--font-space-mono)] text-xs text-red-400 transition-colors hover:bg-red-500/10"
                          >
                            Revoke
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* VJudge / CP Contests */}
            {activeTab === 'vjudge' && (
              <div className="border-t border-zinc-800 pt-8">
                <p className="mb-8 font-[family-name:var(--font-space-mono)] text-xs tracking-[0.15em] text-zinc-400 uppercase">
                  CP Contests
                </p>
                <VJudgeSettings />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
