'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BanUserModal } from '@/app/admin/BanUserModal';
import { ROLES, Role } from '@/lib/roles';
import Image from 'next/image';
import { LoadingDots } from '@/components/ui/loading-dots';
import { useAuth } from '@/components/providers/auth-provider';
import { canManageRoles } from '@/lib/roles';
import { X } from 'lucide-react';

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
  roles: string[];
  email_verified: boolean;
  created_at: string;
};

// Role definitions — keep colour semantics, adapt to zinc palette
const AVAILABLE_ROLES = [
  {
    value: ROLES.DEVELOPER,
    label: 'Developer',
    pill: 'border-purple-500/30 bg-purple-500/[0.06] text-purple-300',
  },
  {
    value: ROLES.PRESIDENT,
    label: 'President',
    pill: 'border-[#fac71e]/30 bg-[#fac71e]/[0.06] text-[#fac71e]',
  },
  {
    value: ROLES.VP,
    label: 'Vice President',
    pill: 'border-yellow-500/30 bg-yellow-500/[0.06] text-yellow-400',
  },
  {
    value: ROLES.ADMIN,
    label: 'Core',
    pill: 'border-blue-500/30 bg-blue-500/[0.06] text-blue-300',
  },
  { value: ROLES.PR, label: 'PR', pill: 'border-pink-500/30 bg-pink-500/[0.06] text-pink-300' },
  {
    value: ROLES.MENTOR,
    label: 'Mentor',
    pill: 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300',
  },
];

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [banModalUser, setBanModalUser] = useState<{ id: string; name: string } | null>(null);
  const [editingRoleUser, setEditingRoleUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { user: currentUser } = useAuth();
  const canManage = canManageRoles(currentUser?.roles);

  const fetchUsers = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      if (data) {
        const formattedData = data.map((u: any) => ({ ...u, roles: u.roles || [] }));
        setUsers(formattedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenRoleModal = (user: User) => {
    setEditingRoleUser(user);
    setSelectedRoles(user.roles || []);
  };

  const handleRoleToggle = (roleValue: string) => {
    if (selectedRoles.includes(roleValue)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== roleValue));
    } else {
      setSelectedRoles([...selectedRoles, roleValue]);
    }
  };

  const handleSaveRoles = async () => {
    if (!editingRoleUser) return;
    setUpdatingUser(editingRoleUser.id);
    try {
      const response = await fetch('/api/admin/assign-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: editingRoleUser.id, roles: selectedRoles }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update roles');

      setUsers(
        users.map((u) =>
          u.id === editingRoleUser.id
            ? { ...u, roles: selectedRoles, is_admin: selectedRoles.length > 0 }
            : u
        )
      );
      setEditingRoleUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleBanSuccess = () => {
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-4 py-10">
        <div className="relative h-5 w-5 animate-spin">
          <Image src="/tc-logo.svg" alt="Loading" fill className="object-contain" />
        </div>
        <p className="text-sm text-zinc-500">
          Fetching users
          <LoadingDots />
        </p>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-400">Error: {error}</p>;
  }

  return (
    <>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="pr-6 pb-3 text-left font-[family-name:var(--font-space-mono)] text-[10px] tracking-[0.15em] text-zinc-500 uppercase">
                Name / Email
              </th>
              <th className="pr-6 pb-3 text-left font-[family-name:var(--font-space-mono)] text-[10px] tracking-[0.15em] text-zinc-500 uppercase">
                Details
              </th>
              <th className="pr-6 pb-3 text-left font-[family-name:var(--font-space-mono)] text-[10px] tracking-[0.15em] text-zinc-500 uppercase">
                Roles
              </th>
              <th className="pb-3 text-right font-[family-name:var(--font-space-mono)] text-[10px] tracking-[0.15em] text-zinc-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-sm text-zinc-500">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-zinc-950">
                  {/* Name / Email */}
                  <td className="py-4 pr-6">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="mt-0.5 text-xs text-zinc-500">{user.email}</p>
                    {user.email_verified && (
                      <span className="mt-1 inline-block font-[family-name:var(--font-space-mono)] text-[10px] tracking-wide text-emerald-400">
                        Verified
                      </span>
                    )}
                  </td>

                  {/* Details */}
                  <td className="py-4 pr-6">
                    <div className="space-y-1 text-sm">
                      <p className="text-zinc-300">
                        <span className="mr-2 font-[family-name:var(--font-space-mono)] text-[10px] text-zinc-600 uppercase">
                          Phone
                        </span>
                        {user.phone_number || '—'}
                      </p>
                      <p className="text-zinc-300">
                        <span className="mr-2 font-[family-name:var(--font-space-mono)] text-[10px] text-zinc-600 uppercase">
                          Class
                        </span>
                        {user.class} – {user.section}
                      </p>
                      {user.github_id && (
                        <a
                          href={`https://github.com/${user.github_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-[#fac71e] transition-opacity hover:opacity-70"
                        >
                          github/{user.github_id} ↗
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Roles */}
                  <td className="py-4 pr-6">
                    <div className="flex flex-wrap gap-1.5">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role) => {
                          const def = AVAILABLE_ROLES.find((r) => r.value === role);
                          return (
                            <span
                              key={role}
                              className={`rounded-sm border px-2 py-0.5 font-[family-name:var(--font-space-mono)] text-[10px] tracking-wider uppercase ${def?.pill ?? 'border-zinc-700 bg-zinc-800/40 text-zinc-400'}`}
                            >
                              {def?.label ?? role}
                            </span>
                          );
                        })
                      ) : (
                        <span className="font-[family-name:var(--font-space-mono)] text-[10px] text-zinc-600 italic">
                          Member
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 text-right">
                    <div className="flex flex-col items-end gap-2">
                      {canManage && (
                        <button
                          onClick={() => handleOpenRoleModal(user)}
                          disabled={updatingUser === user.id}
                          className="rounded-sm border border-zinc-700 px-3 py-1.5 font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-zinc-300 uppercase transition-colors hover:border-[#fac71e] hover:text-[#fac71e] disabled:opacity-40"
                        >
                          Edit Roles
                        </button>
                      )}
                      <button
                        onClick={() => setBanModalUser({ id: user.id, name: user.name })}
                        className="rounded-sm border border-red-500/30 px-3 py-1.5 font-[family-name:var(--font-space-mono)] text-[10px] tracking-widest text-red-400 uppercase transition-colors hover:bg-red-500/10"
                      >
                        Ban
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Role editor modal ──────────────────────────────────────────────── */}
      {editingRoleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-md rounded-sm border border-zinc-800 bg-black p-8">
            {/* Close */}
            <button
              onClick={() => setEditingRoleUser(null)}
              className="absolute top-5 right-5 text-zinc-400 transition-colors hover:text-white"
            >
              <X size={18} />
            </button>

            <p className="mb-1 font-[family-name:var(--font-space-mono)] text-[10px] tracking-[0.25em] text-[#fac71e] uppercase">
              Roles
            </p>
            <h3 className="mb-6 text-lg leading-tight font-bold">{editingRoleUser.name}</h3>

            <div className="mb-8 space-y-1">
              {AVAILABLE_ROLES.map((role) => {
                const active = selectedRoles.includes(role.value);
                return (
                  <label
                    key={role.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-3 transition-colors ${
                      active
                        ? 'border-[#fac71e]/30 bg-[#fac71e]/[0.06]'
                        : 'border-transparent hover:border-zinc-800 hover:bg-zinc-950'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => handleRoleToggle(role.value)}
                      className="h-4 w-4 accent-[#fac71e]"
                    />
                    <span
                      className={`rounded-sm border px-2 py-0.5 font-[family-name:var(--font-space-mono)] text-[10px] tracking-wider uppercase ${role.pill}`}
                    >
                      {role.label}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-6">
              <button
                onClick={() => setEditingRoleUser(null)}
                className="font-[family-name:var(--font-space-mono)] text-xs text-zinc-400 uppercase transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoles}
                disabled={!!updatingUser}
                className="rounded-sm bg-[#fac71e] px-6 py-2.5 font-[family-name:var(--font-space-mono)] text-xs font-bold tracking-widest text-black uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                {updatingUser ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {banModalUser && (
        <BanUserModal
          userId={banModalUser.id}
          username={banModalUser.name}
          onClose={() => setBanModalUser(null)}
          onSuccess={handleBanSuccess}
        />
      )}
    </>
  );
}
