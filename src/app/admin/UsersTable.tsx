'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { BanUserModal } from "@/app/admin/BanUserModal"; // Adjust path as needed

// Define a type for your user with all new fields
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
  created_at: string;
};

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingAdmin, setUpdatingAdmin] = useState<string | null>(null);
  const [banModalUser, setBanModalUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        if (data) setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSetAdmin = async (userId: string, newAdminStatus: boolean) => {
    setUpdatingAdmin(userId);
    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ is_admin: newAdminStatus })
        .eq('id', userId);

      if (updateError) {
        setError(`Failed to ${newAdminStatus ? 'grant' : 'revoke'} admin privileges`);
        return;
      }

      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, is_admin: newAdminStatus } : u
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while updating admin status");
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

  if (loading) return <div className="p-4">Loading users...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <>
      <div className="overflow-x-auto p-4">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 p-3 text-left">Name</th>
              <th className="border border-gray-300 p-3 text-left">Email</th>
              <th className="border border-gray-300 p-3 text-left">Phone</th>
              <th className="border border-gray-300 p-3 text-left">Class</th>
              <th className="border border-gray-300 p-3 text-left">Section</th>
              <th className="border border-gray-300 p-3 text-left">GitHub ID</th>
              <th className="border border-gray-300 p-3 text-left">Interested Niches</th>
              <th className="border border-gray-300 p-3 text-left">Admin</th>
              <th className="border border-gray-300 p-3 text-left">Email Verified</th>
              <th className="border border-gray-300 p-3 text-left">Joined</th>
              <th className="border border-gray-300 p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={11} className="border border-gray-300 p-3 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3">{user.name}</td>
                  <td className="border border-gray-300 p-3">{user.email}</td>
                  <td className="border border-gray-300 p-3">{user.phone_number}</td>
                  <td className="border border-gray-300 p-3">{user.class}</td>
                  <td className="border border-gray-300 p-3">{user.section}</td>
                  <td className="border border-gray-300 p-3">
                    {user.github_id ? (
                      <a
                        href={`https://github.com/${user.github_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {user.github_id}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="border border-gray-300 p-3">
                    <div className="flex flex-wrap gap-1">
                      {user.interested_niches && user.interested_niches.length > 0 ? (
                        user.interested_niches.map((niche) => (
                          <span
                            key={niche}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                          >
                            {niche}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    <button
                      onClick={() => handleSetAdmin(user.id, !user.is_admin)}
                      disabled={updatingAdmin === user.id}
                      className={`px-3 py-1 rounded text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                        user.is_admin
                          ? 'bg-green-200 text-green-800 hover:bg-green-300'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {updatingAdmin === user.id
                        ? 'Updating...'
                        : user.is_admin
                          ? '✅ Admin'
                          : '❌ User'}
                    </button>
                  </td>
                  <td className="border border-gray-300 p-3 text-center">
                    {user.email_verified ? "✅" : "❌"}
                  </td>
                  <td className="border border-gray-300 p-3 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 p-3">
                    <button
                      onClick={() => setBanModalUser({ id: user.id, name: user.name })}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
                    >
                      Ban User
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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