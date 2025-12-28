'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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

  if (loading) return <div className="p-4">Loading users...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
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
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={10} className="border border-gray-300 p-3 text-center text-gray-500">
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
                  {user.is_admin ? "✅" : "❌"}
                </td>
                <td className="border border-gray-300 p-3 text-center">
                  {user.email_verified ? "✅" : "❌"}
                </td>
                <td className="border border-gray-300 p-3 text-sm text-gray-600">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}