'use client';

import { useState } from 'react';
import { Ban, X, AlertTriangle } from 'lucide-react';

interface BanUserModalProps {
  userId: string;
  username: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function BanUserModal({ userId, username, onClose, onSuccess }: BanUserModalProps) {
  const [reason, setReason] = useState('');
  const [durationHours, setDurationHours] = useState<number | ''>('');
  const [banIP, setBanIP] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBan = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/ban-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          reason: reason.trim(),
          durationHours: durationHours || null,
          banIP,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to ban user');
      }

      alert('User banned successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error banning user:', error);
      alert(error instanceof Error ? error.message : 'Failed to ban user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-black border border-[#C9A227]/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-500/20 p-2">
              <Ban size={24} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Ban User</h2>
              <p className="text-[#C9A227]/70 text-sm mt-1">{username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-[#C9A227]/50 hover:text-[#C9A227] transition disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#C9A227] mb-2">
              Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#C9A227]/5 border border-[#C9A227]/30 rounded-lg px-4 py-3 text-white placeholder-[#C9A227]/50 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition"
              rows={3}
              placeholder="Enter the reason for banning this user..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#C9A227] mb-2">
              Duration (hours)
            </label>
            <input
              type="number"
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value ? Number(e.target.value) : '')}
              className="w-full bg-[#C9A227]/5 border border-[#C9A227]/30 rounded-lg px-4 py-3 text-white placeholder-[#C9A227]/50 focus:outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227] transition"
              placeholder="Leave empty for permanent ban"
            />
            <p className="text-xs text-[#C9A227]/50 mt-2">
              Examples: 24 (1 day), 168 (1 week), 720 (30 days)
            </p>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg border border-[#C9A227]/20 bg-[#C9A227]/5">
            <input
              type="checkbox"
              id="banIP"
              checked={banIP}
              onChange={(e) => setBanIP(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-[#C9A227]/50 bg-[#C9A227]/10 text-[#C9A227] focus:ring-[#C9A227] focus:ring-offset-0"
            />
            <div className="flex-1">
              <label htmlFor="banIP" className="text-sm font-medium text-white cursor-pointer">
                Also ban user's IP address
              </label>
              <p className="text-xs text-[#C9A227]/50 mt-1">
                This will prevent the user from creating new accounts from the same IP
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-300">
              This action will immediately block the user from accessing the platform. They will receive an email notification about the ban.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg border border-[#C9A227]/50 text-[#C9A227] hover:bg-[#C9A227]/10 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleBan}
            disabled={loading}
            className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Banning...
              </>
            ) : (
              <>
                <Ban size={18} />
                Ban User
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}