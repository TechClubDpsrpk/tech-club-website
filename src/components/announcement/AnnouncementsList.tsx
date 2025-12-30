'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deletingId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    checkAdmin();
    fetchAnnouncements();
  }, []);

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        setIsAdmin(false);
        return;
      }

      const data = await response.json();
      
      if (!data?.user?.id) {
        setIsAdmin(false);
        return;
      }

      const { data: userData } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", data.user.id)
        .single();

      setIsAdmin(userData?.is_admin || false);
    } catch (error) {
      console.error("Error checking admin:", error);
      setIsAdmin(false);
    }
  };

  const fetchAnnouncements = async () => {
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    
    setAnnouncements(data || []);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      alert("Only admins can delete announcements");
      return;
    }

    if (!confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    setDeleteId(id);
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error deleting announcement: " + error.message);
    } else {
      setAnnouncements(announcements.filter((a) => a.id !== id));
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {announcements.map((a) => (
        <div key={a.id} className="border p-4 rounded shadow-md">
          {a.image_url && <img src={a.image_url} className="w-full h-48 object-cover rounded mb-2" />}
          <h2 className="font-bold text-xl">{a.heading}</h2>
          <p>{a.description}</p>
          
          {isAdmin && (
            <button
              onClick={() => handleDelete(a.id)}
              disabled={deletingId === a.id}
              className="mt-3 bg-red-500 cursor-pointer text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {deletingId === a.id ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}