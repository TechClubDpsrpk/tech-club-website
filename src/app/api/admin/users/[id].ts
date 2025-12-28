// pages/api/admin/users/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const { method } = req;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  if (method === "DELETE") {
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "User deleted" });
  }

  if (method === "PATCH") {
    let is_admin;
    try {
      is_admin = req.body.is_admin;
    } catch {
      return res.status(400).json({ error: "Invalid request body" });
    }

    if (typeof is_admin !== "boolean") {
      return res.status(400).json({ error: "is_admin must be a boolean" });
    }

    const { error } = await supabase.from("users").update({ is_admin }).eq("id", id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ message: "User updated" });
  }

  // Method not allowed
  res.setHeader("Allow", ["DELETE", "PATCH"]);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
