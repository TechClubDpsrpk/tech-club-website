'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { BanUserModal } from "@/app/admin/BanUserModal";
import { ROLES, Role } from "@/lib/roles";
import Image from 'next/image';
import { LoadingDots } from '@/components/ui/loading-dots';
import { useAuth } from "@/components/providers/auth-provider";
import { canManageRoles } from "@/lib/roles";

type User = {
  id: string;
  email: string;
  name: string;
  phone_number: string;
  class: string;
  section: string;
  github_id: string | null;
  interested_niches: string[];
  is_admin: boolean; // Keeping for legacy/display compatibility
  roles: string[]; // Start using this
  email_verified: boolean;
  created_at: string;
};

// Role definitions with theme colors
const AVAILABLE_ROLES = [
  { value: ROLES.DEVELOPER, label: 'Developer', color: 'bg-purple-900/40 text-purple-300 border border-purple-500/30' },
  { value: ROLES.PRESIDENT, label: 'President', color: 'bg-[#C9A227]/20 text-[#C9A227] border border-[#C9A227]/30' },
  { value: ROLES.VP, label: 'Vice President', color: 'bg-yellow-600/20 text-yellow-500 border border-yellow-500/30' },
  { value: ROLES.ADMIN, label: 'Core', color: 'bg-blue-900/40 text-blue-300 border border-blue-500/30' },
  { value: ROLES.PR, label: 'PR', color: 'bg-pink-900/40 text-pink-300 border border-pink-500/30' },
  { value: ROLES.MENTOR, label: 'Mentor', color: 'bg-green-900/40 text-green-300 border border-green-500/30' },
];

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [banModalUser, setBanModalUser] = useState<{ id: string; name: string } | null>(null);

  // For Role Editing Modal
  const [editingRoleUser, setEditingRoleUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { user: currentUser } = useAuth();
  const canManage = canManageRoles(currentUser?.roles);

  const fetchUsers = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      if (data) {
        // Ensure roles is always an array
        const formattedData = data.map((u: any) => ({
          ...u,
          roles: u.roles || []
        }));
        setUsers(formattedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
      console.error("Error fetching users:", err);
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
      setSelectedRoles(selectedRoles.filter(r => r !== roleValue));
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: editingRoleUser.id,
          roles: selectedRoles
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update roles');
      }

      // Update local state
      setUsers(users.map(u =>
        u.id === editingRoleUser.id
          ? { ...u, roles: selectedRoles, is_admin: selectedRoles.length > 0 }
          : u
      ));

      setEditingRoleUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleBanSuccess = () => {
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="relative h-10 w-10 animate-spin-slow">
          <Image
            src="/tc-logo.svg"
            alt="Loading"
            fill
            className="object-contain"
          />
        </div>
        <p className="text-sm text-[#C9A227]/70 font-medium flex items-center justify-center">
          Fetching users <LoadingDots />
        </p>
      </div>
    );
  }
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#C9A227]/20 text-xs uppercase tracking-wider text-[#C9A227]/50">
              <th className="p-4 text-left font-medium">Name / Email</th>
              <th className="p-4 text-left font-medium">Details</th>
              <th className="p-4 text-left font-medium">Roles</th>
              <th className="p-4 text-left font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#C9A227]/10">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-[#C9A227]/50">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-[#C9A227]/5 transition">
                  <td className="p-4">
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="text-sm text-[#C9A227]/70">{user.email}</div>
                    {user.email_verified && <span className="text-xs text-green-400 mt-1 inline-block">Verified</span>}
                  </td>
                  <td className="p-4 text-sm">
                    <div className="grid grid-cols-1 gap-1">
                      <span className="text-white/80"><span className="text-[#C9A227]/50 uppercase text-xs mr-2">Phone:</span> {user.phone_number || '—'}</span>
                      <span className="text-white/80"><span className="text-[#C9A227]/50 uppercase text-xs mr-2">Class:</span> {user.class} - {user.section}</span>
                    </div>
                    {user.github_id && (
                      <div className="mt-1">
                        <a
                          href={`https://github.com/${user.github_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#C9A227] hover:underline text-xs"
                        >
                          github/{user.github_id}
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role) => {
                          const roleDef = AVAILABLE_ROLES.find(r => r.value === role);
                          return (
                            <span
                              key={role}
                              className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleDef?.color || 'bg-gray-800 text-gray-300'}`}
                            >
                              {roleDef?.label || role}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[#C9A227]/30 text-xs italic">Member</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col gap-2 items-end">
                      {canManage && (
                        <button
                          onClick={() => handleOpenRoleModal(user)}
                          disabled={updatingUser === user.id}
                          className="text-xs font-medium bg-[#C9A227]/20 text-[#C9A227] hover:bg-[#C9A227]/30 border border-[#C9A227]/30 px-3 py-1.5 rounded transition uppercase tracking-wider"
                        >
                          Manage Roles
                        </button>
                      )}

                      <button
                        onClick={() => setBanModalUser({ id: user.id, name: user.name })}
                        className="text-xs font-medium bg-red-900/20 text-red-400 hover:bg-red-900/30 border border-red-500/30 px-3 py-1.5 rounded transition uppercase tracking-wider"
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

      {/* Role Editor Modal */}
      {editingRoleUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black border border-[#C9A227]/40 rounded-2xl p-6 max-w-md w-full shadow-2xl shadow-[#C9A227]/10">
            <h3 className="text-xl font-bold mb-6 text-white border-b border-[#C9A227]/20 pb-4">
              Edit Roles for <span className="text-[#C9A227]">{editingRoleUser.name}</span>
            </h3>

            <div className="space-y-3 mb-8">
              {AVAILABLE_ROLES.map((role) => (
                <label key={role.value} className="flex items-center space-x-3 p-3 hover:bg-[#C9A227]/10 rounded-lg cursor-pointer transition border border-transparent hover:border-[#C9A227]/20">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.value)}
                    onChange={() => handleRoleToggle(role.value)}
                    className="w-5 h-5 rounded border-[#C9A227]/50 bg-black text-[#C9A227] focus:ring-[#C9A227] focus:ring-offset-0 focus:ring-offset-black"
                  />
                  <span className={`text-sm font-medium px-2 py-0.5 rounded ${role.color}`}>
                    {role.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#C9A227]/20">
              <button
                onClick={() => setEditingRoleUser(null)}
                className="px-4 py-2 text-[#C9A227]/70 hover:text-white transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoles}
                disabled={!!updatingUser}
                className="px-5 py-2 bg-[#C9A227] text-black rounded-lg hover:bg-[#B8901E] disabled:opacity-50 transition font-bold text-sm"
              >
                {updatingUser ? 'Saving...' : 'Save Changes'}
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