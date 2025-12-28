'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// define a type for your user
type User = {
  id: string;
  email: string;
  is_admin: boolean;
};

export default function UsersTable() {
  const [users, setUsers] = useState<User[]>([]); // <--- type added

  useEffect(() => {
    supabase
      .from("users")
      .select("*")
      .then(({ data }) => {
        if (data) setUsers(data); // check for null
      });
  }, []);

  return (
    <table className="table-auto w-full">
      <thead>
        <tr>
          <th>ID</th>
          <th>Email</th>
          <th>Admin?</th>
        </tr>
      </thead>
      <tbody>
        {users.map(u => (
          <tr key={u.id}>
            <td>{u.id}</td>
            <td>{u.email}</td>
            <td>{u.is_admin ? "✅" : "❌"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
