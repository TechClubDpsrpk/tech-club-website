'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setAnnouncements(data || []));
  }, []);

  return (
    <div className="space-y-6">
      {announcements.map((a) => (
        <div key={a.id} className="border p-4 rounded shadow-md">
          {a.image_url && <img src={a.image_url} className="w-full h-48 object-cover rounded mb-2" />}
          <h2 className="font-bold text-xl">{a.heading}</h2>
          <p>{a.description}</p>
        </div>
      ))}
    </div>
  );
}
