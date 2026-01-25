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
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import AddAnnouncement from '@/components/admin/AddAnnouncement';
import AddProject from '@/components/admin/AddProject';
import VJudgeSettings from '@/components/admin/VJudgeSettings';
import ProjectSubmissions from '@/components/admin/ProjectSubmissions';
import UsersTable from '@/app/admin/UsersTable';
import Loading from '@/app/loading';
import { ROLES, hasAnyRole, canCreateAnnouncements, canAssignQuests, canManageRoles, canManageSiteAccess, hasAccessToAdminPanel } from '@/lib/roles';

type User = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  is_admin: boolean;
  [key: string]: any;
};

type Tab = 'dashboard' | 'projects' | 'announcements' | 'submissions' | 'users' | 'site-access' | 'vjudge';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [siteSessions, setSiteSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [error, setError] = useState('');

  // Tab availability handlers
  const canViewProjects = (roles: string[]) => hasAccessToAdminPanel(roles); // Everyone in staff can see projects? Or maybe limiting?
  const canViewUsers = (roles: string[]) => canManageRoles(roles); // Only Dev/Pres/VP
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

        // We need to fetch the fresh user to get roles if the check API doesn't return them fully or trusted
        // The check API (which we updated) returns roles.
        // But verifying via supabase client is also good.

        // Let's rely on data.user.roles from the API we updated.
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

        // Fetch metrics
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        // Approximate admin count (users with roles)
        const { count: adminCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).not('roles', 'is', null).not('roles', 'eq', '{}');

        setMetrics({ totalUsers: userCount || 0, admins: adminCount || 0 });

        setLoading(false);

      } catch (e) {
        console.error("Admin check failed", e);
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
    if (!confirm('Are you sure you want to revoke this visitor\'s access?')) return;
    try {
      const res = await fetch('/api/admin/site-sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        setSiteSessions(prev => prev.filter(s => s.id !== sessionId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === 'site-access') fetchSiteSessions();
  }, [activeTab]);

  const handleLogout = () => {
    router.replace('/admin/login');
  };

  if (loading) {
    return <Loading isAdmin={true} customText="Checking Admin Status..." hideTips={true} />;
  }

  if (!isAdmin || !currentUser) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Access Denied</div>;
  }

  // Calculate available tabs
  const roles = currentUser.roles || [];
  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard, show: true },
    { id: 'projects' as Tab, label: 'Projects', icon: FolderKanban, show: canAssignQuests(roles) },
    { id: 'announcements' as Tab, label: 'Announcements', icon: Megaphone, show: canAnnounce(roles) },
    { id: 'users' as Tab, label: 'Users', icon: Users, show: canViewUsers(roles) },
    { id: 'site-access' as Tab, label: 'Site Access', icon: Globe, show: canViewSiteAccess(roles) },
    { id: 'vjudge' as Tab, label: 'CP Contests', icon: Trophy, show: canAssignQuests(roles) },
  ].filter(t => t.show);

  return (
    <div className="min-h-screen bg-black px-4 pt-24 pb-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[#C9A227]/20 p-3">
              <Shield size={28} className="text-[#C9A227]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
              <p className="text-[#C9A227]/70">
                Logged in as: <span className="text-white font-medium">{currentUser.name}</span>
                <span className="ml-2 text-xs bg-gray-800 px-2 py-1 rounded">{roles.join(', ') || 'Staff'}</span>
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 rounded-xl border border-[#C9A227] px-4 py-2 text-[#C9A227] hover:bg-[#C9A227] hover:text-black transition">
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-[#C9A227]/20">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition whitespace-nowrap ${activeTab === tab.id ? 'text-[#C9A227] border-b-2 border-[#C9A227]' : 'text-[#C9A227]/50 hover:text-[#C9A227]/80'
                    }`}
                >
                  <Icon size={18} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-[#C9A227]/30 bg-black p-6 shadow-xl">
                <p className="text-sm text-[#C9A227]/70">Total Users</p>
                <p className="mt-2 text-3xl font-bold text-white">{metrics.totalUsers}</p>
              </div>
              <div className="rounded-2xl border border-[#C9A227]/30 bg-black p-6 shadow-xl">
                <p className="text-sm text-[#C9A227]/70">Staff Members</p>
                <p className="mt-2 text-3xl font-bold text-white">{metrics.admins}</p>
              </div>
              {/* Add more metrics or widgets */}
              <div className="col-span-1 md:col-span-3">
                <ProjectSubmissions />
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="rounded-2xl border border-[#C9A227]/30 bg-black p-8 shadow-xl">
              <h2 className="mb-6 text-2xl font-bold text-white">Create Project</h2>
              <AddProject />
            </div>
          )}

          {activeTab === 'announcements' && (
            <div className="rounded-2xl border border-[#C9A227]/30 bg-black p-8 shadow-xl">
              <h2 className="mb-6 text-2xl font-bold text-white">Create Announcement</h2>
              <AddAnnouncement />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="rounded-2xl border border-[#C9A227]/30 bg-black p-8 shadow-xl">
              <UsersTable />
            </div>
          )}

          {activeTab === 'site-access' && (
            <div className="rounded-2xl border border-[#C9A227]/30 bg-black p-8 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Site Visitors</h2>
                <button onClick={fetchSiteSessions} className="text-xs text-[#C9A227] hover:underline">Refresh</button>
              </div>
              {/* Reuse table logic or move to component */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#C9A227]/20 text-xs text-[#C9A227]/50 uppercase">
                      <th className="px-4 py-3">IP Address</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Device</th>
                      <th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C9A227]/10">
                    {siteSessions.map(session => (
                      <tr key={session.id} className="text-sm text-white/90">
                        <td className="px-4 py-4 font-mono">{session.ip_address}</td>
                        <td className="px-4 py-4">{session.city}, {session.country}</td>
                        <td className="px-4 py-4 max-w-xs truncate">{session.user_agent}</td>
                        <td className="px-4 py-4">
                          <button onClick={() => handleRevokeSiteSession(session.id)} className="text-red-400 text-xs border border-red-400/30 px-2 py-1 rounded hover:bg-red-400/10">Revoke</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'vjudge' && (
            <div className="rounded-2xl border border-[#C9A227]/30 bg-black p-8 shadow-xl">
              <VJudgeSettings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}