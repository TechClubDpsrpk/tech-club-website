'use client';

import { useEffect, useState } from "react";

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
      
      if (!data?.user) {
        setIsAdmin(false);
        return;
      }

      const userRoles = data.user.roles || [];
      const isUserAdmin = data.user.is_admin || userRoles.length > 0;
      setIsAdmin(isUserAdmin);
    } catch (error) {
      console.error("Error checking admin:", error);
      setIsAdmin(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      if (res.ok) {
        const { announcements: data } = await res.json();
        setAnnouncements(data || []);
      }
    } catch (e) {
      console.error('Failed to fetch announcements:', e);
    }
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
    const res = await fetch(`/api/announcements?id=${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert("Error deleting announcement: " + (data.error || "Failed to delete"));
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